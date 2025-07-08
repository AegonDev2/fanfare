
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  id: string;
  user_id?: string;
  sender_id?: string;
  product_title: string;
  product_url: string;
  product_price: number;
  platform_fee?: number;
  total_amount?: number;
  created_at: string;
  status?: string;
  influencer_id?: string;
  message?: string;
  fan_email?: string;
  fan_name?: string;
  influencer_name?: string;
}

export const useOrdersData = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch from gift_requests table (main orders)
      const { data: giftRequests, error: giftError } = await supabase
        .from('gift_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (giftError) throw giftError;

      // Fetch from orders_under_process
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select('*')
        .order('created_at', { ascending: false });

      if (underProcessError) throw underProcessError;

      // Fetch from orders_completed
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders_completed')
        .select('*')
        .order('created_at', { ascending: false });

      if (completedError) throw completedError;

      // Enrich orders with user information
      const enrichedOrders: OrderData[] = await Promise.all([
        ...(underProcessOrders || []).map(async (item) => {
          let fan_name = "Unknown";
          let fan_email = "Unknown";
          
          if (item.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', item.user_id)
              .single();
              
            if (profile) {
              fan_name = profile.name || "Unknown";
              fan_email = profile.email || "Unknown";
            }
          }
          
          return {
            id: item.id,
            user_id: item.user_id,
            product_title: item.product_title || 'Unknown Product',
            product_url: item.product_url,
            product_price: item.product_price || 0,
            platform_fee: item.platform_fee || 5.00,
            total_amount: item.total_amount || 0,
            created_at: item.created_at,
            status: 'pending', // These are pending admin approval
            influencer_id: item.influencer_id,
            message: item.message,
            fan_name,
            fan_email,
          };
        }),
        ...(completedOrders || []).map(async (item) => {
          let fan_name = "Unknown";
          let fan_email = "Unknown";
          
          if (item.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', item.user_id)
              .single();
              
            if (profile) {
              fan_name = profile.name || "Unknown";
              fan_email = profile.email || "Unknown";
            }
          }
          
          return {
            id: item.id,
            user_id: item.user_id,
            product_title: item.product_title || 'Unknown Product',
            product_url: item.product_url,
            product_price: item.product_price || 0,
            platform_fee: item.platform_fee || 5.00,
            total_amount: item.total_amount || 0,
            created_at: item.created_at,
            status: 'completed',
            influencer_id: item.influencer_id,
            message: item.message,
            fan_name,
            fan_email,
          };
        })
      ]);

      // Sort by created_at descending
      enrichedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(enrichedOrders);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      if (newStatus === 'approved') {
        // Move order to gift_requests for influencer approval
        const { error } = await supabase.rpc('move_order_to_gift_request', {
          order_id: orderId
        });

        if (error) throw error;

      } else if (newStatus === 'rejected') {
        // This is handled by the AdminOrderCard component with rejection reason
        
      } else if (newStatus === 'completed') {
        // Use the database function to move order to completed
        const { error } = await supabase.rpc('move_order_to_completed', {
          order_id: orderId,
          p_delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, handleStatusChange };
};
