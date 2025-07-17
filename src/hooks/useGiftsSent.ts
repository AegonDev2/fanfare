
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GiftRequest {
  id: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string | null;
  created_at: string;
  status: 'pending_admin_approval' | 'approved_waiting_influencer' | 'accepted' | 'rejected_by_admin' | 'rejected_by_influencer' | 'completed' | 'cancelled_by_user';
  influencer_name: string | null;
  platform_fee?: number | null;
  total_amount?: number | null;
  completed_at?: string | null;
  delivery_estimate?: string | null;
}

export const useGiftsSent = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSentGiftRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }
      
      // Fetch all orders sent by this user from the unified orders table
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (orders) {
        const mappedRequests = orders.map((order: any) => ({
          id: order.id,
          product_url: order.product_url,
          product_title: order.product_title,
          product_price: order.product_price,
          message: order.message,
          created_at: order.created_at,
          status: order.status,
          influencer_name: order.influencer?.name || 'Unknown Influencer',
          platform_fee: order.platform_fee,
          total_amount: order.total_amount,
          completed_at: order.completed_at,
          delivery_estimate: order.delivery_estimate
        }));
        setRequests(mappedRequests);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      setError(error.message || "Failed to load gifts");
      toast({
        title: "Error loading gifts",
        description: error.message || "An error occurred while loading your gifts",
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    requests,
    loading,
    error,
    fetchSentGiftRequests
  };
};
