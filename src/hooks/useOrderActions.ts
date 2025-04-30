
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
          type: "order_completed",
          message: `Your gift order has been processed and will be delivered soon!`,
          reference_id: orderId,
        });
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

  return { handleOrderComplete };
};
