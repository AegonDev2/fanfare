
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
      // Get delivery estimate (7 days from now)
      const deliveryEstimate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Get the order from orders_under_process
      const { data: orderData, error: fetchError } = await supabase
        .from('orders_under_process')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (fetchError || !orderData) throw new Error("Order not found");
      
      // Insert order into orders_completed table
      const { error: insertError } = await supabase
        .from('orders_completed')
        .insert({
          id: orderId,
          created_at: orderData.created_at,
          completed_at: new Date().toISOString(),
          user_id: orderData.user_id,
          influencer_id: orderData.influencer_id,
          product_url: orderData.product_url,
          product_title: orderData.product_title,
          product_price: orderData.product_price,
          platform_fee: orderData.platform_fee,
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          message: orderData.message,
          delivery_estimate: deliveryEstimate
        });
      
      if (insertError) throw insertError;
      
      // Delete the order from orders_under_process
      const { error: deleteError } = await supabase
        .from('orders_under_process')
        .delete()
        .eq('id', orderId);
      
      if (deleteError) throw deleteError;

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
