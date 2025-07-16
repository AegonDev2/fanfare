
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShopProduct {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  product_url: string | null;
  category: string | null;
  is_available: boolean;
  is_featured: boolean;
  ranking: number;
  created_at: string;
  updated_at: string;
}

export const useShopProducts = (shopId: string | null) => {
  return useQuery({
    queryKey: ['shop-products', shopId],
    queryFn: async (): Promise<ShopProduct[]> => {
      if (!shopId) return [];

      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_available', true)
        .order('is_featured', { ascending: false })
        .order('ranking', { ascending: true })
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!shopId,
  });
};
