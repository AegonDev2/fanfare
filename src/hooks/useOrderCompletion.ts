
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useOrderCompletion = () => {
  const { toast } = useToast();

  const completeOrder = async (orderId: string, deliveryEstimate?: string) => {
    try {
      console.log("Completing order:", orderId);
      
      const deliveryDate = deliveryEstimate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Update order status to completed in the unified orders table
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          delivery_estimate: deliveryDate
        })
        .eq('id', orderId);

      if (error) {
        console.error("Error completing order:", error);
        throw error;
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
