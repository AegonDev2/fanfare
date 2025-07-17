
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
      
      // Update order status to completed in the unified orders table
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          delivery_estimate: deliveryEstimate
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error("Failed to complete order:", error);
        throw error;
      }
      
      console.log("Successfully updated order to completed");

      // Get order details for notifications
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found in local state");

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    console.log(`Admin action: Changing order ${orderId} status to ${newStatus}`);
    
    try {
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map admin actions to database status
      if (newStatus === 'approved') {
        updateData.status = 'approved_waiting_influencer';
        updateData.admin_approved_at = new Date().toISOString();
        
      } else if (newStatus === 'rejected') {
        updateData.status = 'rejected_by_admin';
        updateData.rejected_by = 'admin';
        updateData.cancelled_at = new Date().toISOString();
        
      } else if (newStatus === 'completed') {
        await handleOrderComplete(orderId);
        return; // handleOrderComplete already handles notifications and refresh
      } else {
        // Direct status update
        updateData.status = newStatus;
      }

      console.log("Updating order with data:", updateData);

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
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

  const handleGiftOrderItemStatusChange = async (
    itemId: string, 
    newStatus: 'accepted' | 'rejected' | 'processing' | 'completed',
    orderId?: string
  ) => {
    // This function is kept for compatibility but may not be needed with unified orders table
    try {
      console.log(`Changing gift order item ${itemId} status to ${newStatus}`);
      
      toast({
        title: "Status Updated",
        description: `Item status has been updated to ${newStatus}`,
      });
      
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

  return { 
    handleOrderComplete,
    handleGiftOrderItemStatusChange,
    handleStatusChange
  };
};
