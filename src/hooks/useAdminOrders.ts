
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OrderDetails, UnderProcessOrder, CompletedOrder } from "@/types/admin";

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Fetching admin orders...");
      
      // Fetch orders from under_process table
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .order('created_at', { ascending: false });

      if (underProcessError) {
        console.error("Error fetching under_process orders:", underProcessError);
        throw underProcessError;
      }
      
      console.log("📋 Under process orders found:", underProcessOrders?.length || 0);
      
      // Fetch orders from completed table
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders_completed')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .order('created_at', { ascending: false });

      if (completedError) {
        console.error("Error fetching completed orders:", completedError);
        throw completedError;
      }
      
      console.log("✅ Completed orders found:", completedOrders?.length || 0);

      // If no orders are found, set empty array and return early
      if ((!underProcessOrders || underProcessOrders.length === 0) && 
          (!completedOrders || completedOrders.length === 0)) {
        console.log("No orders found");
        setOrders([]);
        setIsLoading(false);
        return;
      }
      
      // Enrich orders with additional data
      const enrichedOrders: OrderDetails[] = await Promise.all([
        ...((underProcessOrders || []).map(async (order) => {
          try {
            // Get fan's email and name
            const { data: fanData, error: fanError } = await supabase
              .from('profiles')
              .select('email, name')
              .eq('id', order.user_id)
              .maybeSingle();

            if (fanError) {
              console.warn(`Error fetching fan data for order ${order.id}:`, fanError);
            }

            // Handle potential null influencer data safely
            const influencerName = order.influencer?.name || "Unknown";
            
            return {
              ...order,
              status: 'under_process' as const,
              fan_email: fanData?.email || "Unknown",
              fan_name: fanData?.name || "Unknown",
              influencer_name: influencerName,
            } as OrderDetails;
          } catch (err) {
            console.error(`Error enriching order ${order.id}:`, err);
            return {
              ...order,
              status: 'under_process' as const,
              fan_email: "Unknown",
              fan_name: "Unknown",
              influencer_name: "Unknown",
            } as OrderDetails;
          }
        })),
        ...((completedOrders || []).map(async (order) => {
          try {
            // Get fan's email and name
            const { data: fanData, error: fanError } = await supabase
              .from('profiles')
              .select('email, name')
              .eq('id', order.user_id)
              .maybeSingle();

            if (fanError) {
              console.warn(`Error fetching fan data for order ${order.id}:`, fanError);
            }

            // Handle potential null influencer data safely
            const influencerName = order.influencer?.name || "Unknown";
            
            return {
              ...order,
              status: 'completed' as const,
              fan_email: fanData?.email || "Unknown",
              fan_name: fanData?.name || "Unknown",
              influencer_name: influencerName,
            } as OrderDetails;
          } catch (err) {
            console.error(`Error enriching order ${order.id}:`, err);
            return {
              ...order,
              status: 'completed' as const,
              fan_email: "Unknown",
              fan_name: "Unknown",
              influencer_name: "Unknown",
            } as OrderDetails;
          }
        }))
      ]);

      console.log('🎯 Successfully fetched and enriched admin orders:', enrichedOrders.length);
      console.log('📊 Order details:', enrichedOrders.map(o => ({ 
        id: o.id, 
        status: o.status, 
        product_title: o.product_title,
        fan_name: o.fan_name 
      })));
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
