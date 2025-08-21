import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { optimizedCache } from "@/utils/optimizedCache";

export interface LeaderboardEntry {
  fan_id: string;
  fan_name: string | null;
  fan_email: string;
  total_gifts: number;
  favorite_influencer_id: string | null;
  favorite_influencer_name: string | null;
  month: string;
  year: number;
}

const fetchLeaderboard = async (month?: string, year?: number): Promise<LeaderboardEntry[]> => {
  const now = new Date();
  const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const targetYear = year || now.getFullYear();
  
  // Check cache first
  const cacheKey = `leaderboard_${targetMonth}_${targetYear}`;
  const cached = optimizedCache.get<LeaderboardEntry[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Get the month number from the month name
  const monthNumber = new Date(`${targetMonth} 1, ${targetYear}`).getMonth() + 1;
  
  // Call the RPC function directly
  const { data, error } = await supabase.rpc('get_monthly_leaderboard', {
    target_month: monthNumber,
    target_year: targetYear
  });

  if (error) {
    throw error;
  }

  // Transform the data to ensure all types are correct
  const transformedData = data.map((entry: any) => ({
    fan_id: entry.fan_id,
    fan_name: entry.fan_name,
    fan_email: entry.fan_email,
    total_gifts: Number(entry.total_gifts),
    favorite_influencer_id: entry.favorite_influencer_id,
    favorite_influencer_name: entry.favorite_influencer_name,
    month: entry.month?.trim(),
    year: Number(entry.year)
  }));

  // Cache the result
  optimizedCache.set(cacheKey, transformedData, 5 * 60 * 1000); // 5 minutes cache
  return transformedData || [];
};

export const useOptimizedLeaderboard = (month?: string, year?: number) => {
  const { toast } = useToast();
  const now = new Date();
  const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const targetYear = year || now.getFullYear();

  return useQuery({
    queryKey: ['leaderboard', targetMonth, targetYear],
    queryFn: async () => {
      try {
        return await fetchLeaderboard(month, year);
      } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        toast({
          title: "Error loading leaderboard",
          description: error.message || "Failed to load leaderboard data",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    select: (data) => ({
      leaderboard: data,
      currentMonth: targetMonth,
      currentYear: targetYear
    })
  });
};