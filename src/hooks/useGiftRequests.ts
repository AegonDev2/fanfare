
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';

interface GiftRequest {
  id: string;
  sender_id: string;
  influencer_id: string;
  product_title: string;
  product_url: string;
  product_price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under process' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
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
      
      const { data, error: fetchError } = await supabase
        .from('gift_requests')
        .select('*')
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRequests(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftRequests();
  }, [user]);

  const getPendingRequests = () => {
    return requests.filter(request => request.status === 'pending');
  };

  const getAcceptedRequests = () => {
    return requests.filter(request => request.status === 'accepted');
  };

  const getRejectedRequests = () => {
    return requests.filter(request => request.status === 'rejected');
  };

  return {
    requests,
    loading,
    error,
    setRequests,
    fetchGiftRequests,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests
  };
};
