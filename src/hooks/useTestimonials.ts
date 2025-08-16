import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  avatar_url?: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitTestimonial = async (testimonialData: {
    name: string;
    role: string;
    message: string;
    rating: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a testimonial",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('testimonials')
        .insert({
          ...testimonialData,
          user_id: user.id,
          is_approved: false,
          is_featured: false
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your testimonial has been submitted for review"
      });
      return true;
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to submit testimonial",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return {
    testimonials,
    loading,
    submitTestimonial,
    refetch: fetchTestimonials
  };
};