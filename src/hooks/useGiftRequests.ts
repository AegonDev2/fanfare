import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';

export interface GiftRequest {
  id: string;
  sender_id: string | null;
  user_id: string;
  influencer_id: string | null;
  product_title: string | null;
  product_url: string;
  product_price: number | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  admin_approved: boolean | null;
  admin_approved_at: string | null;
  influencer_response: string | null;
  influencer_response_at: string | null;
  delivery_estimate?: string | null;
  gift_type: boolean;
  total_amount: number | null;
  platform_fee: number | null;
  sender?: {
    name: string;
    email: string;
  };
  sender_name?: string;
  sender_email?: string;
}

export const useGiftRequests = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState<GiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGiftRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching gift requests for influencer:", user.id);
      
      // Fetch gift orders from unified orders table
      const { data: ordersData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('influencer_id', user.id)
        .eq('gift_type', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error("Error fetching gift requests:", fetchError);
        throw fetchError;
      }

      console.log("Fetched gift requests:", ordersData?.length);
      
      // Fetch profiles for all sender_ids (user_id for gifts)
      const senderIds = ordersData?.map(order => order.sender_id || order.user_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', senderIds);
        profilesData = profiles || [];
      }

      // Transform the data to match GiftRequest interface
      const transformedData = (ordersData || []).map(order => {
        const senderId = order.sender_id || order.user_id;
        const senderProfile = profilesData.find(p => p.id === senderId);
        return {
          ...order,
          sender_id: senderId,
          status: order.status,
          sender_name: senderProfile?.name,
          sender_email: senderProfile?.email,
          sender: senderProfile ? { name: senderProfile.name, email: senderProfile.email } : undefined
        };
      });
      setRequests(transformedData);
    } catch (err) {
      console.error("Gift requests fetch error:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftRequests();
  }, [user]);

  const getPendingRequests = () => {
    return requests.filter(request => 
      request.admin_approved && 
      request.status === 'approved_waiting_influencer' && 
      !request.influencer_response
    );
  };

  const getAcceptedRequests = () => {
    return requests.filter(request => 
      request.status === 'accepted' || 
      request.status === 'completed'
    );
  };

  const getRejectedRequests = () => {
    return requests.filter(request => 
      request.status === 'rejected_by_influencer' || request.status === 'rejected_by_admin'
    );
  };

  return {
    requests,
    loading,
    error,
    setRequests,
    fetchGiftRequests,
    fetchRequests: fetchGiftRequests, // Alias for consistency
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests
  };
};