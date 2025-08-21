
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useAdBanners() {
  const { toast } = useToast();
  
  const fetchAdBanners = async (): Promise<AdBanner[]> => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching ad banners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banner images',
        variant: 'destructive',
      });
      return [];
    }
  };

  return useQuery({
    queryKey: ['adBanners'],
    queryFn: fetchAdBanners,
    staleTime: 10 * 60 * 1000, // 10 minutes - banners don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
}
