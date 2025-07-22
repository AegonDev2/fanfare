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
      // Use the security definer function to get top fans data
      const { data: topFansData, error } = await supabase
        .rpc('get_influencer_top_fans', { influencer_id_param: influencerId });

      if (error) {
        throw error;
      }

      // Transform the data to match the expected format
      const formattedTopFans = (topFansData || []).map((fan: any) => ({
        fan_id: fan.fan_id,
        fan_name: fan.fan_name,
        fan_email: fan.fan_email,
        profile_image_url: fan.profile_image_url,
        total_gifts: fan.total_gifts
      }));

      setTopFans(formattedTopFans);
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