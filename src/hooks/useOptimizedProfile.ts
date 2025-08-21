import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { optimizedCache } from '@/utils/optimizedCache';

interface ProfileData {
  profile: any;
  influencer_profile: any;
  fan_profile: any;
  roles: string[];
  wallet: any;
  top_fans?: any[];
}

// Optimized profile data fetcher - batches all profile-related queries
const fetchCompleteProfileData = async (profileId: string): Promise<ProfileData> => {
  // Check cache first
  const cacheKey = `profile_complete_${profileId}`;
  const cached = optimizedCache.getStaticData(cacheKey);
  if (cached) {
    console.log('⚡ Using cached profile data');
    return cached;
  }

  console.log('📊 Fetching complete profile data for:', profileId);

  try {
    // Use the existing database function for complete user data
    const { data: userData, error: userError } = await supabase.rpc('get_complete_user_data', {
      user_uuid: profileId
    });

    if (userError) throw userError;

    // Type the userData properly
    const typedUserData = userData as any;

    // For influencers, also fetch top fans
    let topFans: any[] = [];
    if (typedUserData?.influencer_profile?.id) {
      const { data: fansData } = await supabase.rpc('get_influencer_top_fans', {
        influencer_id_param: typedUserData.influencer_profile.id
      });
      
      if (fansData) {
        topFans = fansData;
      }
    }

    const result: ProfileData = {
      profile: typedUserData?.profile || null,
      influencer_profile: typedUserData?.influencer_profile || null,
      fan_profile: typedUserData?.fan_profile || null,
      roles: typedUserData?.roles || [],
      wallet: typedUserData?.wallet || null,
      top_fans: topFans
    };

    // Cache the result
    optimizedCache.setStaticData(cacheKey, result);
    
    console.log('✅ Complete profile data loaded and cached');
    return result;
  } catch (error) {
    console.error('❌ Error fetching profile data:', error);
    throw error;
  }
};

export const useOptimizedProfile = (profileId: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile-complete', profileId],
    queryFn: () => fetchCompleteProfileData(profileId!),
    enabled: enabled && !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes for profile data
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};