
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
  gift_url: string | null;
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

  // Modified to prevent infinite retries
  const getGiftById = async (id: string): Promise<GiftItem | null> => {
    if (!id) return null;
    
    try {
      const { data, error } = await supabase
        .from('gift_selection_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        // Log but don't throw to avoid triggering unnecessary retries
        console.error('Error fetching gift item:', error);
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching gift item:', error);
      // Return null instead of throwing
      return null;
    }
  };

  return {
    ...useQuery({
      queryKey: ['giftItems'],
      queryFn: fetchGiftItems,
      // Add retry configuration to prevent infinite retries
      retry: 1,
      retryDelay: 1000,
    }),
    getGiftById,
  };
}
