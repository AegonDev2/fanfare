
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface GiftItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useGiftItems() {
  const { toast } = useToast();
  
  const fetchGiftItems = async (): Promise<GiftItem[]> => {
    try {
      const { data, error } = await supabase
        .from('gift_selection_items')
        .select('*')
        .order('is_featured', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching gift items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gift items',
        variant: 'destructive',
      });
      return [];
    }
  };

  return useQuery({
    queryKey: ['giftItems'],
    queryFn: fetchGiftItems,
  });
}
