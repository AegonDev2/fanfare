
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { requestManager } from '@/utils/requestDeduplication';

export interface GiftItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
  gift_url: string | null;
}

export function useGiftItems() {
  const { toast } = useToast();
  
  const fetchGiftItems = async (): Promise<GiftItem[]> => {
    return requestManager.dedupeWithRetry('gift-items', async () => {
      console.log('🎁 Fetching gift items');
      
      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('is_available', true)
        .order('is_featured', { ascending: false })
        .order('ranking', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || '',
        description: product.description,
        is_featured: product.is_featured,
        created_at: product.created_at,
        updated_at: product.updated_at,
        gift_url: product.product_url,
      }));
    });
  };

  const getGiftById = useCallback(async (id: string): Promise<GiftItem | null> => {
    if (!id) return null;
    
    try {
      console.log("Fetching gift with ID:", id);
      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('id', id)
        .eq('is_available', true)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching gift item by ID:', error);
        return null;
      }
      
      console.log("Gift data result:", data);
      
      if (!data) return null;
      
      // Map shop product to gift item format
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        image_url: data.image_url || '',
        description: data.description,
        is_featured: data.is_featured,
        created_at: data.created_at,
        updated_at: data.updated_at,
        gift_url: data.product_url,
      };
    } catch (error: any) {
      console.error('Error fetching gift item by ID:', error);
      return null;
    }
  }, []);

  const queryResult = useQuery({
    queryKey: ['giftItems'],
    queryFn: fetchGiftItems,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Handle errors in component
  if (queryResult.error) {
    console.error('Error fetching gift items:', queryResult.error);
    toast({
      title: 'Error',
      description: 'Failed to load gift items',
      variant: 'destructive',
    });
  }

  return {
    ...queryResult,
    getGiftById,
  };
}
