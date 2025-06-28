
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Shop {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_image_url: string | null;
  is_active: boolean;
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
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};
