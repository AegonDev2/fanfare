
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

      // Combine and transform all orders
      const allOrders: OrderData[] = [
        ...(giftRequests || []).map(item => ({
          id: item.id,
          user_id: item.sender_id,
          product_title: item.product_title || 'Unknown Product',
          product_url: item.product_url,
          product_price: item.product_price || 0,
          platform_fee: 5.00,
          total_amount: (item.product_price || 0) + 5.00,
          created_at: item.created_at,
          status: item.status,
          influencer_id: item.influencer_id,
          message: item.message,
        })),
        ...(underProcessOrders || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          product_title: item.product_title || 'Unknown Product',
          product_url: item.product_url,
          product_price: item.product_price || 0,
          platform_fee: item.platform_fee || 5.00,
          total_amount: item.total_amount || 0,
          created_at: item.created_at,
          status: 'under process',
          influencer_id: item.influencer_id,
          message: item.message,
        })),
        ...(completedOrders || []).map(item => ({
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
        }))
      ];

      // Sort by created_at descending
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(allOrders);
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
      if (newStatus === 'under process') {
        // Move from gift_requests to orders_under_process
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');

        const { error: insertError } = await supabase
          .from('orders_under_process')
          .insert({
            id: orderId,
            user_id: order.user_id,
            influencer_id: order.influencer_id,
            product_url: order.product_url,
            product_title: order.product_title,
            product_price: order.product_price,
            platform_fee: order.platform_fee,
            total_amount: order.total_amount,
            message: order.message,
            created_at: order.created_at
          });

        if (insertError) throw insertError;

        // Update gift_requests status
        const { error: updateError } = await supabase
          .from('gift_requests')
          .update({ status: 'under process' })
          .eq('id', orderId);

        if (updateError) throw updateError;

      } else if (newStatus === 'completed') {
        // Use the database function to move order to completed
        const { error } = await supabase.rpc('move_order_to_completed', {
          order_id: orderId,
          p_delivery_estimate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

        if (error) throw error;

        // Update gift_requests status
        const { error: updateError } = await supabase
          .from('gift_requests')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) throw updateError;
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
