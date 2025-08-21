
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseInfluencer {
  id: string;
  name: string;
  platform: string;
  profile_image: string | null;
  followers: number;
  about: string | null;
  category: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
}

export const useInfluencers = (searchQuery?: string, categoryFilter?: string) => {
  return useQuery({
    queryKey: ['influencers', searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('influencer_profiles')
        .select('*')
        .order('followers', { ascending: false });

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery.trim()}%,platform.ilike.%${searchQuery.trim()}%`);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching influencers:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: searchQuery ? 2 * 60 * 1000 : 10 * 60 * 1000, // 2 min for search, 10 min for general
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};

export const useInfluencerCategories = () => {
  return useQuery({
    queryKey: ['influencer-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_profiles')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Get unique categories
      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return categories.sort();
    },
    staleTime: 60 * 60 * 1000, // 1 hour - categories rarely change
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
  });
};
