
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GiftRequest {
  id: string;
  gift_item: string;
  product_url: string;
  product_title: string | null;
  product_price: number | null;
  message: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under process' | 'completed';
  sender: { id: string; email: string };
  influencer_id: string;
  platform_fee?: number | null;
  total_amount?: number | null;
  delivery_estimate?: string | null;
  completed_at?: string | null;
}

export const useGiftRequests = () => {
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGiftRequests = useCallback(async () => {
    try {
      setLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to view gift requests",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('gift_requests')
        .select(`
          id,
          product_url,
          product_title,
          product_price,
          message,
          created_at,
          status,
          influencer_id,
          sender_id,
          platform_fee,
          total_amount,
          delivery_estimate,
          completed_at
        `)
        .eq('influencer_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const requestsWithSenders = await Promise.all(
          data.map(async (request: any) => {
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('id, email')
              .eq('id', request.sender_id)
              .single();

            if (senderError) {
              return {
                ...request,
                gift_item: request.product_title || request.product_url,
                status: request.status || 'pending',
                sender: { id: request.sender_id || '', email: 'Unknown email' }
              };
            }

            return {
              ...request,
              gift_item: request.product_title || request.product_url,
              status: request.status || 'pending',
              sender: {
                id: senderData?.id || request.sender_id || '',
                email: senderData?.email || 'Unknown email'
              }
            };
          })
        );
        setRequests(requestsWithSenders as GiftRequest[]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gift requests",
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGiftRequests();
  }, [fetchGiftRequests]);

  const getPendingRequests = () => requests.filter(r => r.status === 'pending');
  const getAcceptedRequests = () => requests.filter(r => r.status === 'accepted');
  const getRejectedRequests = () => requests.filter(r => r.status === 'rejected');

  return {
    requests,
    loading,
    setRequests,
    fetchGiftRequests,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests,
  };
};
