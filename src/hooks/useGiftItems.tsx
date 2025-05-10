
import { useState, useCallback } from 'react';
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
  gift_url: string | null;
}

export function useGiftItems() {
  const { toast } = useToast();
  
  const fetchGiftItems = useCallback(async (): Promise<GiftItem[]> => {
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
  }, [toast]);

  const getGiftById = useCallback(async (id: string): Promise<GiftItem | null> => {
    if (!id) return null;
    
    try {
      console.log("Fetching gift with ID:", id);
      const { data, error } = await supabase
        .from('gift_selection_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching gift item by ID:', error);
        return null;
      }
      
      console.log("Gift data result:", data);
      return data;
    } catch (error: any) {
      console.error('Error fetching gift item by ID:', error);
      return null;
    }
  }, []);

  const queryResult = useQuery({
    queryKey: ['giftItems'],
    queryFn: fetchGiftItems,
    retry: 1, // Limit retries to prevent infinite loops
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    ...queryResult,
    getGiftById,
  };
}
