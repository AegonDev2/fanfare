import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TopFan {
  fan_id: string;
  fan_name: string | null;
  fan_email: string;
  total_gifts: number;
  profile_image_url?: string;
}

export const useTopFans = (influencerId: string) => {
  const [topFans, setTopFans] = useState<TopFan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopFans = async () => {
    if (!influencerId) {
      setTopFans([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Query to get top fans for specific influencer based on completed gifts
      const { data, error } = await supabase
        .from('orders')
        .select(`
          sender_id,
          profiles!orders_sender_id_fkey(name, email),
          fan_profiles!fan_profiles_user_id_fkey(profile_image_url)
        `)
        .eq('influencer_id', influencerId)
        .eq('status', 'completed')
        .eq('gift_type', true);

      if (error) {
        throw error;
      }

      // Group by sender_id and count gifts
      const fanGiftCounts = data.reduce((acc: any, order: any) => {
        const fanId = order.sender_id;
        if (!acc[fanId]) {
          acc[fanId] = {
            fan_id: fanId,
            fan_name: order.profiles?.name || 'Anonymous Fan',
            fan_email: order.profiles?.email || '',
            profile_image_url: order.fan_profiles?.profile_image_url,
            total_gifts: 0
          };
        }
        acc[fanId].total_gifts += 1;
        return acc;
      }, {});

      // Convert to array and sort by gift count
      const sortedFans = Object.values(fanGiftCounts)
        .sort((a: any, b: any) => b.total_gifts - a.total_gifts)
        .slice(0, 4); // Get top 4 fans

      setTopFans(sortedFans as TopFan[]);
    } catch (error: any) {
      console.error("Error fetching top fans:", error);
      setTopFans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopFans();
  }, [influencerId]);

  return {
    topFans,
    isLoading,
    refetch: fetchTopFans
  };
};