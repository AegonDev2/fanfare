
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
      console.log("Attempting to fetch admin orders from new tables...");
      
      // Fetch orders from under_process table
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select('*, influencer:influencer_id(*)')
        .order('created_at', { ascending: false });

      if (underProcessError) {
        console.error("Error fetching under_process orders:", underProcessError);
        throw underProcessError;
      }
      
      // Fetch orders from accepted table
      const { data: acceptedOrders, error: acceptedError } = await supabase
        .from('orders_accepted')
        .select('*, influencer:influencer_id(*)')
        .order('created_at', { ascending: false });

      if (acceptedError) {
        console.error("Error fetching accepted orders:", acceptedError);
        throw acceptedError;
      }

      // Combine and transform the data
      const combinedOrders = [
        ...((underProcessOrders || []).map(order => ({
          ...order,
          status: 'under_process'
        }))),
        ...((acceptedOrders || []).map(order => ({
          ...order,
          status: 'accepted'
        })))
      ];
      
      // If no orders are found, set empty array and return early
      if (combinedOrders.length === 0) {
        console.log("No orders found in under_process or accepted tables");
        setOrders([]);
        setIsLoading(false);
        return;
      }

      console.log(`Found ${combinedOrders.length} orders to process`);

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

      console.log('Fetched admin orders successfully:', enrichedOrders);
      setOrders(enrichedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      
      // Provide more detailed error information
      let errorMessage = "Failed to load orders. ";
      
      if (error.code === "PGRST301") {
        errorMessage += "Database connection issue. Please try again later.";
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage += "Network connection issue. Please check your internet connection.";
      } else {
        errorMessage += error.message || "Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Set empty orders array to avoid undefined errors
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { orders, isLoading, fetchAllOrders, setOrders };
}
