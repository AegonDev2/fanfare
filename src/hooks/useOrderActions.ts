
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OrderDetails } from "@/types/admin";

export const useOrderActions = (
  orders: OrderDetails[],
  fetchAllOrders: () => Promise<void>
) => {
  const { toast } = useToast();

  // ADMIN marks as "Accepted" -- now means: change "under_process" to "accepted"
  const handleOrderProcessing = async (orderId: string) => {
    try {
      // Update order status from under_process to accepted (admin's review)
      const { error } = await supabase
        .from('orders')
        .update({ status: "accepted" })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders list
      await fetchAllOrders();
      
      toast({
        title: "Order Status Updated",
        description: "Order marked as accepted (processing started)",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  // ADMIN marks as "Completed"
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

        // Update order status to completed and set delivery estimate
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: "completed",
            delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', orderId);

        if (error) throw error;

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

        // Refresh orders list
        await fetchAllOrders();
        
        toast({
          title: "Order Completed",
          description: "Order has been processed and payment has been collected",
        });
      } catch (paymentError) {
        console.error("Payment processing error:", paymentError);
        throw new Error(paymentError instanceof Error ? paymentError.message : "Payment processing failed");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete the order",
        variant: "destructive"
      });
    }
  };

  return { handleOrderProcessing, handleOrderComplete };
};
