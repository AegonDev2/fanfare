import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TopCreator {
  influencer_id: string;
  influencer_name: string | null;
  total_gifts_received: number;
  total_amount_received: number;
  top_fan_id: string | null;
  top_fan_name: string | null;
  month: string;
  year: number;
}

export const useTopCreators = () => {
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number>(0);
  const { toast } = useToast();

  const fetchTopCreators = async (month?: string, year?: number) => {
    setIsLoading(true);
    try {
      const now = new Date();
      const targetMonth = month || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
      const targetYear = year || now.getFullYear();
      
      setCurrentMonth(targetMonth);
      setCurrentYear(targetYear);

      // Get the month number from the month name
      const monthNumber = new Date(`${targetMonth} 1, ${targetYear}`).getMonth() + 1;
      
      // Call the RPC function directly
      const { data, error } = await supabase.rpc('get_top_gifted_creators', {
        target_month: monthNumber,
        target_year: targetYear
      });

      if (error) {
        throw error;
      }

      // Transform the data to ensure all types are correct
      const transformedData = data.map((creator: any) => ({
        influencer_id: creator.influencer_id,
        influencer_name: creator.influencer_name,
        total_gifts_received: Number(creator.total_gifts_received),
        total_amount_received: Number(creator.total_amount_received),
        top_fan_id: creator.top_fan_id,
        top_fan_name: creator.top_fan_name,
        month: creator.month?.trim(),
        year: Number(creator.year)
      }));

      setTopCreators(transformedData || []);
    } catch (error: any) {
      console.error("Error fetching top creators:", error);
      toast({
        title: "Error loading top creators",
        description: error.message || "Failed to load top creators data",
        variant: "destructive",
      });
      setTopCreators([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCreators();
  }, []);

  return {
    topCreators,
    isLoading,
    fetchTopCreators,
    currentMonth,
    currentYear
  };
};