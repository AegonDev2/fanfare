
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { requestManager } from "@/utils/requestDeduplication";

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

// Optimized fetch function with deduplication
const fetchLeaderboard = async (month?: string, year?: number): Promise<{
  leaderboard: LeaderboardEntry[];
  currentMonth: string;
  currentYear: number;
}> => {
  const now = new Date();
  const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const targetYear = year || now.getFullYear();
  const monthNumber = new Date(`${targetMonth} 1, ${targetYear}`).getMonth() + 1;
  
  const cacheKey = `leaderboard_${targetMonth}_${targetYear}`;
  
  return requestManager.dedupeWithRetry(cacheKey, async () => {
    console.log(`📊 Fetching leaderboard: ${targetMonth} ${targetYear}`);
    
    const { data, error } = await supabase.rpc('get_monthly_leaderboard', {
      target_month: monthNumber,
      target_year: targetYear
    });

    if (error) throw error;

    const transformedData = (data || []).map((entry: any) => ({
      fan_id: entry.fan_id,
      fan_name: entry.fan_name,
      fan_email: entry.fan_email,
      total_gifts: Number(entry.total_gifts),
      favorite_influencer_id: entry.favorite_influencer_id,
      favorite_influencer_name: entry.favorite_influencer_name,
      month: entry.month?.trim(),
      year: Number(entry.year)
    }));

    return {
      leaderboard: transformedData,
      currentMonth: targetMonth,
      currentYear: targetYear
    };
  });
};

export const useLeaderboard = (month?: string, year?: number) => {
  const { toast } = useToast();
  const now = new Date();
  const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const targetYear = year || now.getFullYear();

  const query = useQuery({
    queryKey: ['leaderboard', targetMonth, targetYear],
    queryFn: () => fetchLeaderboard(month, year),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Handle errors in component
  if (query.error) {
    console.error("Error fetching leaderboard:", query.error);
    toast({
      title: "Error loading leaderboard",
      description: (query.error as any)?.message || "Failed to load leaderboard data",
      variant: "destructive",
    });
  }

  return {
    leaderboard: query.data?.leaderboard || [],
    isLoading: query.isLoading,
    error: query.error,
    fetchLeaderboard: query.refetch,
    currentMonth: query.data?.currentMonth || targetMonth,
    currentYear: query.data?.currentYear || targetYear
  };
};
