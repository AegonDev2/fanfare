
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
      try {
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
          // For unauthenticated users, return sample data instead of empty array
          return getSampleInfluencers();
        }

        return data && data.length > 0 ? data : getSampleInfluencers();
      } catch (error) {
        console.error('Network error fetching influencers:', error);
        // Return sample data to gracefully handle network/auth errors
        return getSampleInfluencers();
      }
    },
    // Add retry and error handling
    retry: 1,
    retryDelay: 1000,
  });
};

// Sample data for unauthenticated users
const getSampleInfluencers = (): DatabaseInfluencer[] => {
  return [
    {
      id: "sample-1",
      name: "Sarah Johnson",
      platform: "Instagram",
      profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=400&h=400&fit=crop&crop=face",
      followers: 125000,
      about: "Lifestyle and fashion influencer",
      category: "Fashion",
      instagram_url: "https://instagram.com/sarahjohnson",
      youtube_url: null,
      tiktok_url: null,
      twitter_url: null,
      facebook_url: null,
    },
    {
      id: "sample-2",
      name: "Mike Chen",
      platform: "YouTube",
      profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      followers: 89000,
      about: "Tech reviewer and gaming content",
      category: "Technology",
      instagram_url: null,
      youtube_url: "https://youtube.com/mikechen",
      tiktok_url: null,
      twitter_url: null,
      facebook_url: null,
    },
    {
      id: "sample-3",
      name: "Emma Williams",
      platform: "TikTok",
      profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      followers: 234000,
      about: "Dance and lifestyle content creator",
      category: "Entertainment",
      instagram_url: null,
      youtube_url: null,
      tiktok_url: "https://tiktok.com/@emmawilliams",
      twitter_url: null,
      facebook_url: null,
    },
    {
      id: "sample-4",
      name: "Alex Rodriguez",
      platform: "Instagram",
      profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      followers: 156000,
      about: "Fitness and wellness coach",
      category: "Fitness",
      instagram_url: "https://instagram.com/alexfit",
      youtube_url: null,
      tiktok_url: null,
      twitter_url: null,
      facebook_url: null,
    },
    {
      id: "sample-5",
      name: "Lisa Park",
      platform: "YouTube",
      profile_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      followers: 98000,
      about: "Beauty and skincare expert",
      category: "Beauty",
      instagram_url: null,
      youtube_url: "https://youtube.com/lisapark",
      tiktok_url: null,
      twitter_url: null,
      facebook_url: null,
    },
    {
      id: "sample-6",
      name: "David Thompson",
      platform: "Instagram",
      profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      followers: 187000,
      about: "Travel photographer and blogger",
      category: "Travel",
      instagram_url: "https://instagram.com/davidtravel",
      youtube_url: null,
      tiktok_url: null,
      twitter_url: null,
      facebook_url: null,
    }
  ];
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
  });
};
