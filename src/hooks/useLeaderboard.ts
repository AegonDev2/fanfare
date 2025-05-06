
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number>(0);
  const { toast } = useToast();

  const fetchLeaderboard = async (month?: string, year?: number) => {
    setIsLoading(true);
    try {
      const now = new Date();
      const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
      const targetYear = year || now.getFullYear();
      
      setCurrentMonth(targetMonth);
      setCurrentYear(targetYear);

      // Get the month number from the month name
      const monthNumber = new Date(`${targetMonth} 1, ${targetYear}`).getMonth() + 1;
      
      // This query gets:
      // 1. Fan who completed the most gifts in the specified month
      // 2. The influencer they gifted to the most
      // 3. Total number of gifts completed
      const { data, error } = await supabase.rpc('get_monthly_leaderboard', {
        target_month: monthNumber,
        target_year: targetYear
      });

      if (error) {
        throw error;
      }

      setLeaderboard(data || []);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error loading leaderboard",
        description: error.message || "Failed to load leaderboard data",
        variant: "destructive",
      });
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    isLoading,
    fetchLeaderboard,
    currentMonth,
    currentYear
  };
};
