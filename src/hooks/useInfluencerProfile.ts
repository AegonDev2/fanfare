
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SizePreferences {
  id?: string;
  influencer_id?: string;
  tshirt_size?: string;
  pants_waist?: string;
  pants_length?: string;
  shoe_size?: string;
  food_preferences?: string[];
}

export const useInfluencerProfile = (profileId: string | null) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: influencer,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['influencer_profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      // Fetch influencer profile
      const { data: profileData, error: profileError } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;
      
      // Fetch size preferences separately
      const { data: sizeData, error: sizeError } = await supabase
        .from('size_preferences')
        .select('*')
        .eq('influencer_id', profileId)
        .maybeSingle();
      
      // Don't throw error for size preferences if not found
      // Just combine the data
      return {
        ...profileData,
        size_preferences: sizeError ? null : sizeData
      };
    },
    enabled: !!profileId
  });

  const updateProfile = async (profileData: any) => {
    if (!profileId) return false;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('influencer_profiles')
        .update(profileData)
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      await refetch();
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateSizePreferences = async (sizeData: SizePreferences) => {
    if (!profileId) return false;
    
    try {
      setIsUpdating(true);
      
      // Check if size preferences record exists
      const { data: existingData } = await supabase
        .from('size_preferences')
        .select('id')
        .eq('influencer_id', profileId)
        .maybeSingle();
        
      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('size_preferences')
          .update(sizeData)
          .eq('influencer_id', profileId);
      } else {
        // Insert new record
        result = await supabase
          .from('size_preferences')
          .insert({
            ...sizeData,
            influencer_id: profileId
          });
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: "Size preferences updated successfully"
      });
      
      await refetch();
      return true;
    } catch (error: any) {
      console.error("Error updating size preferences:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update size preferences",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    influencer,
    isLoading,
    error,
    updateProfile,
    updateSizePreferences,
    isUpdating
  };
};
