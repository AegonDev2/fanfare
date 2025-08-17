import { useCache } from "./useCache";
import { supabase } from "@/integrations/supabase/client";
import { cacheHelpers } from "@/utils/appCache";

export const useNotifications = (userId: string) => {
  const { data, isLoading, error, refresh } = useCache({
    key: `notifications_${userId}`,
    fetcher: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Cache notifications
      cacheHelpers.setNotifications(userId, data || []);

      return data || [];
    },
    dependencies: [userId],
    enabled: !!userId,
    ttl: 2 * 60 * 1000 // 2 minutes for notifications
  });

  return {
    notifications: data || [],
    isLoading,
    error,
    refetch: refresh
  };
};

export const useGiftRequests = (userId: string) => {
  const { data, isLoading, error, refresh } = useCache({
    key: `gift_requests_${userId}`,
    fetcher: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('gift_requests')
        .select(`
          *,
          sender:profiles!gift_requests_sender_id_fkey(name, email),
          influencer:profiles!gift_requests_influencer_id_fkey(name, email)
        `)
        .or(`sender_id.eq.${userId},influencer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gift requests:', error);
        throw error;
      }

      return data || [];
    },
    dependencies: [userId],
    enabled: !!userId,
    ttl: 3 * 60 * 1000 // 3 minutes for gift requests
  });

  return {
    giftRequests: data || [],
    isLoading,
    error,
    refetch: refresh
  };
};

export const useOrders = (userId: string, type: string = 'all') => {
  const { data, isLoading, error, refresh } = useCache({
    key: `orders_${type}_${userId}`,
    fetcher: async () => {
      if (!userId) return [];

      let query = supabase
        .from('orders')
        .select('*')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (type !== 'all') {
        query = query.eq('status', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      // Cache orders
      cacheHelpers.setOrders(userId, data || [], type);

      return data || [];
    },
    dependencies: [userId, type],
    enabled: !!userId,
    ttl: 5 * 60 * 1000 // 5 minutes for orders
  });

  return {
    orders: data || [],
    isLoading,
    error,
    refetch: refresh
  };
};