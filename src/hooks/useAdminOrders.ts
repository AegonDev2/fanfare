
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
      console.log("Fetching admin orders...");
      
      // Fetch orders from under_process table
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select('*, influencer:influencer_id(*)')
        .order('created_at', { ascending: false });

      if (underProcessError) {
        console.error("Error fetching under_process orders:", underProcessError);
        throw underProcessError;
      }
      
      // Fetch orders from completed table
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders_completed')
        .select('*, influencer:influencer_id(*)')
        .order('created_at', { ascending: false });

      if (completedError) {
        console.error("Error fetching completed orders:", completedError);
        throw completedError;
      }

      // Combine and transform the data
      const combinedOrders = [
        ...((underProcessOrders || []).map(order => ({
          ...order,
          status: 'under_process' as const
        }))),
        ...((completedOrders || []).map(order => ({
          ...order,
          status: 'completed' as const
        })))
      ];

      // If no orders are found, set empty array and return early
      if (combinedOrders.length === 0) {
        console.log("No orders found");
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Enrich orders with additional data
      const enrichedOrders = await Promise.all(
        combinedOrders.map(async (order) => {
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

            // Handle potential null influencer data safely
            const influencerName = order.influencer?.name || "Unknown";
            
            return {
              ...order,
              fan_email: fanData?.email || "Unknown",
              influencer_name: influencerName,
            } as OrderDetails;
          } catch (err) {
            console.error(`Error enriching order ${order.id}:`, err);
            return {
              ...order,
              fan_email: "Unknown",
              influencer_name: "Unknown",
            } as OrderDetails;
          }
        })
      );

      console.log('Fetched admin orders successfully:', enrichedOrders);
      setOrders(enrichedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to load orders",
        variant: "destructive"
      });
      
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { orders, isLoading, fetchAllOrders, setOrders };
};
