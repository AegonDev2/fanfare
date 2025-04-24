
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OrderDetails } from "@/types/admin";

export const useOrderActions = (
  orders: OrderDetails[],
  fetchAllOrders: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleOrderProcessing = async (orderId: string) => {
    try {
      console.log(`Processing order ${orderId} - moving to accepted table`);
      
      const { error } = await supabase.rpc('move_order_to_accepted', { 
        order_id: orderId
      });

      if (error) throw error;

      await fetchAllOrders();
      
      toast({
        title: "Order Status Updated",
        description: "Order moved to processing queue",
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleOrderComplete = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");

      // Calculate the total amount to charge
      const totalAmount = (order.product_price || 0) + (order.platform_fee || 5.00);
      console.log(`Processing payment for order ${orderId}, amount: ${totalAmount}`);

      try {
        // Process payment from fan's wallet
        const { data: paymentResult, error: paymentError } = await supabase.functions.invoke("execute_sql", {
          body: {
            sql_query: `SELECT process_gift_payment('${order.user_id}', ${totalAmount}, '${orderId}', 'Payment for ${order.product_title?.replace(/'/g, "''") || "gift order"}')`
          }
        });

        if (paymentError) {
          throw new Error(`Payment processing failed: ${paymentError.message}`);
        }
        
        console.log("Payment successfully processed:", paymentResult);

        // Get delivery estimate (7 days from now)
        const deliveryEstimate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Call the function to move order to completed table
        const { error: moveError } = await supabase.rpc('move_order_to_completed', { 
          order_id: orderId,
          p_delivery_estimate: deliveryEstimate
        });

        if (moveError) throw moveError;

        // Send notification to influencer
        if (order.influencer_id) {
          await supabase.from("notifications").insert({
            recipient_id: order.influencer_id,
            type: "order_completed",
            message: `Your gift order has been processed and will be delivered soon!`,
            reference_id: orderId,
          });
        }
        
        // Send notification to fan
        if (order.user_id) {
          await supabase.from("notifications").insert({
            recipient_id: order.user_id,
            type: "payment_processed",
            message: `Your payment of ₹${totalAmount.toFixed(2)} for the gift has been processed.`,
            reference_id: orderId,
          });
        }

        await fetchAllOrders();
        
        toast({
          title: "Order Completed",
          description: "Order has been processed and payment has been collected",
        });
      } catch (paymentError: any) {
        console.error("Payment processing error:", paymentError);
        throw new Error(paymentError.message || "Payment processing failed");
      }
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete the order",
        variant: "destructive"
      });
    }
  };

  return { handleOrderProcessing, handleOrderComplete };
};
