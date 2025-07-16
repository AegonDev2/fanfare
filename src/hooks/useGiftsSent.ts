
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
  status: 'pending' | 'accepted' | 'rejected' | 'under process' | 'completed';
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
      
      let allRequests: GiftRequest[] = [];

      // Fetch from orders_under_process (waiting admin approval)
      const { data: underProcessOrders, error: underProcessError } = await supabase
        .from('orders_under_process')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!underProcessError && underProcessOrders) {
        const mappedOrders = underProcessOrders.map((order: any) => ({
          id: order.id,
          product_url: order.product_url,
          product_title: order.product_title,
          product_price: order.product_price,
          message: order.message,
          created_at: order.created_at,
          status: 'under process' as const,
          influencer_name: order.influencer?.name || 'Unknown Influencer',
          platform_fee: order.platform_fee,
          total_amount: order.total_amount,
          completed_at: null,
          delivery_estimate: null
        }));
        allRequests.push(...mappedOrders);
      }
      
      // Fetch from gift_requests (various statuses)
      const { data: giftRequests, error: giftRequestsError } = await supabase
        .from('gift_requests')
        .select(`
          *,
          influencer:influencer_profiles(id, name)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (!giftRequestsError && giftRequests) {
        const mappedRequests = giftRequests.map((request: any) => ({
          id: request.id,
          product_url: request.product_url,
          product_title: request.product_title,
          product_price: request.product_price,
          message: request.message,
          created_at: request.created_at,
          status: request.status,
          influencer_name: request.influencer?.name || 'Unknown Influencer',
          platform_fee: null,
          total_amount: request.product_price ? request.product_price + 5 : null,
          completed_at: request.completed_at,
          delivery_estimate: null
        }));
        allRequests.push(...mappedRequests);
      }

      // Fetch from orders_completed
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders_completed')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!completedError && completedOrders) {
        const mappedCompleted = completedOrders.map((order: any) => ({
          id: order.id,
          product_url: order.product_url,
          product_title: order.product_title,
          product_price: order.product_price,
          message: order.message,
          created_at: order.created_at,
          status: 'completed' as const,
          influencer_name: 'Influencer', // We'll need to join this properly later
          platform_fee: order.platform_fee,
          total_amount: order.total_amount,
          completed_at: order.completed_at,
          delivery_estimate: order.delivery_estimate
        }));
        allRequests.push(...mappedCompleted);
      }

      // Remove duplicates and sort by creation date
      const uniqueRequests = allRequests.filter((request, index, self) => 
        index === self.findIndex(r => r.id === request.id)
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRequests(uniqueRequests);
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
