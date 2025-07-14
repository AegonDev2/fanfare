import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useOrderCompletion = () => {
  const { toast } = useToast();

  const completeOrder = async (orderId: string, deliveryEstimate?: string) => {
    try {
      console.log("Completing order:", orderId);
      
      // Move order from under_process to completed
      const { error } = await supabase.rpc('move_order_to_completed', {
        order_id: orderId,
        p_delivery_estimate: deliveryEstimate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      });

      if (error) {
        console.error("Error completing order:", error);
        throw error;
      }

      // Update any related gift_requests to completed status
      const { error: updateGiftError } = await supabase
        .from('gift_requests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('product_url', orderId); // This might need adjustment based on your data model

      if (updateGiftError) {
        console.warn("Could not update related gift request:", updateGiftError);
      }

      console.log("Order completed successfully");
      return true;
    } catch (error: any) {
      console.error("Error in completeOrder:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete order",
        variant: "destructive"
      });
      return false;
    }
  };

  return { completeOrder };
};