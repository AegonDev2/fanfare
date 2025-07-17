
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
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("useAdminOrders - Orders fetch error:", ordersError);
        throw ordersError;
      }

      console.log("useAdminOrders - Fetched orders:", ordersData?.length || 0);

      if (ordersData) {
        // Get unique user and influencer IDs to fetch their data
        const userIds = [...new Set(ordersData.map(order => order.user_id).filter(Boolean))];
        const influencerIds = [...new Set(ordersData.map(order => order.influencer_id).filter(Boolean))];
        
        // Fetch user data separately
        let userData: any[] = [];
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);
          
          userData = users || [];
        }

        // Fetch influencer data separately
        let influencerData: any[] = [];
        if (influencerIds.length > 0) {
          const { data: influencers } = await supabase
            .from('influencer_profiles')
            .select('id, name')
            .in('id', influencerIds);
          
          influencerData = influencers || [];
        }

        const mappedOrders: OrderDetails[] = ordersData.map((order: any) => {
          // Map the unified status to admin status for display
          let adminStatus = order.status;
          if (order.status === 'pending_admin_approval') {
            adminStatus = 'under_process'; // For admin panel display
          } else if (order.status === 'approved_waiting_influencer' || order.status === 'accepted') {
            adminStatus = 'processing'; // For admin panel display - both waiting for influencer and accepted by influencer
          } else if (order.status === 'rejected_by_admin' || order.status === 'rejected_by_influencer' || order.status === 'completed') {
            adminStatus = 'completed'; // For admin panel display - all final states
          }

          const user = userData.find(u => u.id === order.user_id);
          const influencer = influencerData.find(inf => inf.id === order.influencer_id);

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
            influencer: influencer ? { id: influencer.id, name: influencer.name } : null,
            user: user ? { id: user.id, name: user.name, email: user.email } : null,
            // Map the required fields from the joined data
            fan_email: user?.email || '',
            fan_name: user?.name || '',
            influencer_name: influencer?.name || ''
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
    fetchAllOrders,
    setOrders
  };
};
