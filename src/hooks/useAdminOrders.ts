
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OrderDetails } from "@/types/admin";

export const useAdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllOrders = useCallback(async () => {
    console.log("useAdminOrders - Starting fetch from unified orders table");
    setIsLoading(true);
    
    try {
      // Fetch all orders from the unified orders table
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          influencer:influencer_profiles(id, name),
          user:profiles!orders_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("useAdminOrders - Orders fetch error:", ordersError);
        throw ordersError;
      }

      console.log("useAdminOrders - Fetched orders:", ordersData?.length || 0);

      if (ordersData) {
        const mappedOrders: OrderDetails[] = ordersData.map((order: any) => {
          // Map the unified status to admin status for display
          let adminStatus = order.status;
          if (order.status === 'pending_admin_approval') {
            adminStatus = 'under_process'; // For admin panel display
          } else if (order.status === 'approved_waiting_influencer') {
            adminStatus = 'processing'; // For admin panel display
          }

          return {
            id: order.id,
            user_id: order.user_id,
            influencer_id: order.influencer_id,
            product_url: order.product_url,
            product_title: order.product_title,
            product_price: order.product_price,
            platform_fee: order.platform_fee,
            total_amount: order.total_amount,
            message: order.message,
            shipping_address: order.shipping_address,
            status: adminStatus,
            original_status: order.status, // Keep original for updates
            created_at: order.created_at,
            updated_at: order.updated_at,
            admin_approved_at: order.admin_approved_at,
            influencer_response_at: order.influencer_response_at,
            completed_at: order.completed_at,
            cancelled_at: order.cancelled_at,
            delivery_estimate: order.delivery_estimate,
            rejection_reason: order.rejection_reason,
            influencer_response: order.influencer_response,
            rejected_by: order.rejected_by,
            influencer: order.influencer,
            user: order.user
          };
        });
        
        console.log("useAdminOrders - Mapped orders:", mappedOrders.length);
        setOrders(mappedOrders);
      } else {
        console.log("useAdminOrders - No orders found");
        setOrders([]);
      }
    } catch (error: any) {
      console.error("useAdminOrders - Error:", error);
      const errorMessage = error.message || "Failed to load orders";
      toast({
        title: "Error loading orders",
        description: errorMessage,
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    orders,
    isLoading,
    fetchAllOrders
  };
};
