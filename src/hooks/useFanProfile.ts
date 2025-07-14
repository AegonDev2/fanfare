
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FanStats {
  giftsSent: number;
  totalSpent: number;
  favoriteInfluencers: number;
}

export interface GiftHistory {
  id: string;
  influencer_name: string;
  influencer_id: string;
  product_title: string;
  product_price: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface FanProfileData {
  id: string;
  name: string | null;
  email: string;
  user_type: string;
  bio?: string;
  profile_image_url?: string;
  favorite_categories?: string[];
  total_gifts_sent: number;
  total_amount_spent: number;
  stats: FanStats;
  giftHistory: GiftHistory[];
}

export const useFanProfile = (userId: string) => {
  const [fanProfile, setFanProfile] = useState<FanProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFanProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get basic profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get fan profile data
      const { data: fanProfileData, error: fanProfileError } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Get fan stats from gift requests
      const { data: giftRequestsData, error: giftRequestsError } = await supabase
        .from('gift_requests')
        .select(`
          id,
          product_price,
          status,
          created_at,
          completed_at,
          influencer_id,
          product_title,
          influencer_profiles!inner(name)
        `)
        .eq('sender_id', userId);

      if (giftRequestsError) throw giftRequestsError;

      // Calculate stats
      const completedGifts = giftRequestsData?.filter(g => g.status === 'completed') || [];
      const totalSpent = completedGifts.reduce((sum, gift) => sum + (gift.product_price || 0), 0);
      const uniqueInfluencers = new Set(completedGifts.map(g => g.influencer_id)).size;

      const stats: FanStats = {
        giftsSent: completedGifts.length,
        totalSpent,
        favoriteInfluencers: uniqueInfluencers
      };

      // Format gift history
      const giftHistory: GiftHistory[] = (giftRequestsData || []).map(gift => ({
        id: gift.id,
        influencer_name: (gift.influencer_profiles as any)?.name || 'Unknown',
        influencer_id: gift.influencer_id,
        product_title: gift.product_title || 'Unknown Gift',
        product_price: gift.product_price || 0,
        status: gift.status,
        created_at: gift.created_at,
        completed_at: gift.completed_at
      }));

      setFanProfile({
        ...profile,
        bio: fanProfileData?.bio,
        profile_image_url: fanProfileData?.profile_image_url,
        favorite_categories: fanProfileData?.favorite_categories,
        total_gifts_sent: fanProfileData?.total_gifts_sent || 0,
        total_amount_spent: fanProfileData?.total_amount_spent || 0,
        stats,
        giftHistory: giftHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      });

    } catch (error: any) {
      console.error('Error fetching fan profile:', error);
      setError(error.message);
      toast({
        title: "Error loading profile",
        description: "Failed to load fan profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (file: File) => {
    try {
      if (!userId) throw new Error('User ID is required');

      // Delete existing image first
      const { data: existingFiles } = await supabase.storage
        .from('profile_images')
        .list(`${userId}/`);
      
      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('profile_images')
          .remove([`${userId}/${existingFiles[0].name}`]);
      }

      // Upload new image
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      // Update fan profile with new image URL
      const { error: updateError } = await supabase
        .from('fan_profiles')
        .upsert({
          user_id: userId,
          profile_image_url: publicUrl
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      // Update local state
      if (fanProfile) {
        setFanProfile({
          ...fanProfile,
          profile_image_url: publicUrl
        });
      }

      toast({
        title: "Profile image updated",
        description: "Your profile picture has been successfully updated",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile image",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFanProfile();
    }
  }, [userId]);

  return {
    fanProfile,
    isLoading,
    error,
    refetch: fetchFanProfile,
    uploadProfileImage
  };
};
