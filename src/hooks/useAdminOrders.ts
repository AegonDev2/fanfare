
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OrderDetails } from "@/types/admin";

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Modified query to also fetch orders with status 'under_process'
      // This ensures orders show up after influencer approval
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, influencer:influencer_id(*)')
        .in('status', ['under_process', 'accepted'])
        .order('created_at', { ascending: false });

      if (orderError) {
        throw orderError;
      }

      // If no orders are found, set empty array and return early
      if (!orderData || orderData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Enrich orders with additional data
      const enrichedOrders = await Promise.all(
        orderData.map(async (order) => {
          try {
            // Get fan's email
            const { data: fanData, error: fanError } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', order.user_id)
              .maybeSingle();

            if (fanError) {
              console.warn(`Error fetching fan data for order ${order.id}:`, fanError);
            }

            const influencerName = order.influencer?.name || "Unknown";
            
            return {
              ...order,
              fan_email: fanData?.email || "Unknown",
              influencer_name: influencerName,
            };
          } catch (err) {
            console.error(`Error enriching order ${order.id}:`, err);
            // Return order with default values if enrichment fails
            return {
              ...order,
              fan_email: "Unknown",
              influencer_name: "Unknown",
            };
          }
        })
      );

      console.log('Fetched admin orders:', enrichedOrders);
      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { orders, isLoading, fetchAllOrders, setOrders };
}
