
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/utils/notifications";
import type { OrderDetails } from "@/types/admin";

export const useOrderActions = (
  orders: OrderDetails[],
  fetchAllOrders: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleOrderComplete = async (orderId: string) => {
    try {
      console.log("Completing order:", orderId);
      
      // Get delivery estimate (7 days from now)
      const deliveryEstimate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Use the updated database function to move order to completed
      const { data, error } = await supabase.rpc('move_order_to_completed', {
        order_id: orderId,
        p_delivery_estimate: deliveryEstimate
      });
      
      if (error) {
        console.error("Failed to complete order:", error);
        throw error;
      }
      
      console.log("Successfully moved order to completed");

      // Get order details for notifications
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found in local state");

      // Update the gift_order_items status if it exists
      const { data: orderItems, error: itemsError } = await supabase
        .from('gift_order_items')
        .select('id')
        .eq('order_id', orderId);

      if (!itemsError && orderItems && orderItems.length > 0) {
        console.log("Updating gift order items status to completed");
        await supabase
          .from('gift_order_items')
          .update({ 
            status: 'completed',
          })
          .eq('order_id', orderId);
      }

      // Also update the gift_request status to completed if it exists
      const { data: giftRequests, error: giftReqError } = await supabase
        .from('gift_requests')
        .select('id')
        .eq('product_url', order.product_url)
        .eq('sender_id', order.user_id)
        .eq('influencer_id', order.influencer_id);

      if (!giftReqError && giftRequests && giftRequests.length > 0) {
        console.log("Updating gift request status to completed:", giftRequests[0].id);
        await supabase
          .from('gift_requests')
          .update({ 
            status: 'completed',
            delivery_estimate: deliveryEstimate,
            completed_at: new Date().toISOString()
          })
          .eq('id', giftRequests[0].id);
      }

      // Send notification to influencer
      if (order.influencer_id) {
        console.log(`Sending completion notification to influencer: ${order.influencer_id}`);
        await sendNotification(
          order.influencer_id,
          "order_completed",
          `Your gift order has been processed and will be delivered soon!`,
          orderId
        );
      }
      
      // Send notification to fan
      if (order.user_id) {
        console.log(`Sending completion notification to fan: ${order.user_id}`);
        await sendNotification(
          order.user_id,
          "order_completed",
          `Your gift order has been processed and will be delivered around ${new Date(deliveryEstimate).toLocaleDateString()}!`,
          orderId
        );
      }

      console.log("Notifications sent, refreshing orders list");
      await fetchAllOrders();
      
      toast({
        title: "Order Completed",
        description: "Order has been marked as completed",
      });
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete the order",
        variant: "destructive"
      });
    }
  };

  // Add a function to handle individual gift order item status changes
  const handleGiftOrderItemStatusChange = async (
    itemId: string, 
    newStatus: 'accepted' | 'rejected' | 'processing' | 'completed',
    orderId?: string
  ) => {
    try {
      console.log(`Changing gift order item ${itemId} status to ${newStatus}`);
      
      // Update the gift order item status
      const { error } = await supabase
        .from('gift_order_items')
        .update({ status: newStatus })
        .eq('id', itemId);
        
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Item status has been updated to ${newStatus}`,
      });
      
      // If order ID was provided, check if all items in the order are in the same status
      if (orderId) {
        const { data: items, error: itemsError } = await supabase
          .from('gift_order_items')
          .select('status')
          .eq('order_id', orderId);
          
        if (!itemsError && items) {
          const allSameStatus = items.every(i => i.status === newStatus);
          
          if (allSameStatus && items.length > 0) {
            // If all items have the same status, update the order status
            const { error: orderError } = await supabase
              .from('gift_orders')
              .update({ status: newStatus })
              .eq('id', orderId);
              
            if (orderError) {
              console.error("Error updating order status:", orderError);
            }
          }
        }
      }
      
      // Refresh orders list if necessary
      if (fetchAllOrders) {
        await fetchAllOrders();
      }
    } catch (error: any) {
      console.error("Error updating item status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update the item status",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    console.log(`Admin action: Changing order ${orderId} status to ${newStatus}`);
    
    try {
      if (newStatus === 'approved') {
        console.log("Moving order to gift_request for influencer approval...");
        
        // Move order to gift_requests for influencer approval
        const { error } = await supabase.rpc('move_order_to_gift_request', {
          order_id: orderId
        });

        if (error) {
          console.error("Error moving order to gift_request:", error);
          throw error;
        }
        
        console.log("Successfully moved order to gift_request");

      } else if (newStatus === 'rejected') {
        console.log("Order rejection is handled by AdminOrderCard component");
        
      } else if (newStatus === 'completed') {
        console.log("Moving order to completed status...");
        
        await handleOrderComplete(orderId);
        return; // handleOrderComplete already handles notifications and refresh
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      // Trigger a refresh of the admin orders
      console.log("Order action completed successfully");
      await fetchAllOrders();

    } catch (error: any) {
      console.error("Error in handleStatusChange:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  return { 
    handleOrderComplete,
    handleGiftOrderItemStatusChange,
    handleStatusChange
  };
};
