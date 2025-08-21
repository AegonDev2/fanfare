
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOptimizedDataLoader } from "@/hooks/useOptimizedDataLoader";

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

export const useLeaderboard = () => {
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number>(0);
  const { toast } = useToast();

  // Use optimized data loader for leaderboard
  const {
    data: leaderboard = [],
    isLoading,
    refresh,
    error
  } = useOptimizedDataLoader<LeaderboardEntry[]>({
    key: `leaderboard_${currentMonth}_${currentYear}`,
    fetcher: async () => {
      const now = new Date();
      const targetMonth = currentMonth || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
      const targetYear = currentYear || now.getFullYear();
      
      // Get the month number from the month name
      const monthNumber = new Date(`${targetMonth} 1, ${targetYear}`).getMonth() + 1;
      
      // Call the RPC function with optimized caching
      const { data, error } = await supabase.rpc('get_monthly_leaderboard', {
        target_month: monthNumber,
        target_year: targetYear
      });

      if (error) throw error;

      // Transform the data to ensure all types are correct
      return data.map((entry: any) => ({
        fan_id: entry.fan_id,
        fan_name: entry.fan_name,
        fan_email: entry.fan_email,
        total_gifts: Number(entry.total_gifts),
        favorite_influencer_id: entry.favorite_influencer_id,
        favorite_influencer_name: entry.favorite_influencer_name,
        month: entry.month?.trim(),
        year: Number(entry.year)
      }));
    },
    dependencies: [currentMonth, currentYear],
    priority: 'medium',
    ttl: 5 * 60 * 1000, // 5 minutes for leaderboard data
    retryCount: 2
  });

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error loading leaderboard",
        description: error.message || "Failed to load leaderboard data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const fetchLeaderboard = async (month?: string, year?: number) => {
    const now = new Date();
    const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const targetYear = year || now.getFullYear();
    
    setCurrentMonth(targetMonth);
    setCurrentYear(targetYear);
    
    // This will trigger the optimized data loader to refresh
    await refresh();
  };

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date();
    if (!currentMonth && !currentYear) {
      setCurrentMonth(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now));
      setCurrentYear(now.getFullYear());
    }
  }, [currentMonth, currentYear]);

  return {
    leaderboard,
    isLoading,
    fetchLeaderboard,
    currentMonth,
    currentYear
  };
};
