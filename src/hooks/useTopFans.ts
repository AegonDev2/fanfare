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
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('sender_id')
        .eq('influencer_id', influencerId)
        .eq('status', 'completed')
        .eq('gift_type', true);

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        setTopFans([]);
        setIsLoading(false);
        return;
      }

      // Group by sender_id and count gifts
      const fanGiftCounts = ordersData.reduce((acc: any, order: any) => {
        const fanId = order.sender_id;
        if (!acc[fanId]) {
          acc[fanId] = {
            fan_id: fanId,
            total_gifts: 0
          };
        }
        acc[fanId].total_gifts += 1;
        return acc;
      }, {});

      // Get unique fan IDs and fetch their profile data
      const fanIds = Object.keys(fanGiftCounts);
      
      if (fanIds.length === 0) {
        setTopFans([]);
        setIsLoading(false);
        return;
      }

      // Fetch profiles and fan profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', fanIds);

      const { data: fanProfilesData, error: fanProfilesError } = await supabase
        .from('fan_profiles')
        .select('user_id, profile_image_url')
        .in('user_id', fanIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      if (fanProfilesError) {
        console.error("Error fetching fan profiles:", fanProfilesError);
      }

      // Combine the data
      const combinedFans = fanIds.map(fanId => {
        const profile = profilesData?.find(p => p.id === fanId);
        const fanProfile = fanProfilesData?.find(fp => fp.user_id === fanId);
        
        return {
          fan_id: fanId,
          fan_name: profile?.name || 'Anonymous Fan',
          fan_email: profile?.email || '',
          profile_image_url: fanProfile?.profile_image_url,
          total_gifts: fanGiftCounts[fanId].total_gifts
        };
      });

      // Sort by gift count and get top 4
      const sortedFans = combinedFans
        .sort((a, b) => b.total_gifts - a.total_gifts)
        .slice(0, 4);

      setTopFans(sortedFans);
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