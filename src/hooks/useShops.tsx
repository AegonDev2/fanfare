
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Shop {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  ranking: number;
  created_at: string;
  updated_at: string;
}

export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async (): Promise<Shop[]> => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('ranking', { ascending: true })
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 15 * 60 * 1000,      // 15 minutes - shops rarely change
    gcTime: 60 * 60 * 1000,          // 1 hour cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
