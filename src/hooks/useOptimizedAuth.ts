import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import type { NavRole } from '@/types/auth';

// Optimized hook with memoized values and helpers
export const useOptimizedAuth = () => {
  const auth = useSimpleAuth();
  
  return {
    // Core auth state
    user: auth.user,
    userData: auth.userData,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Role helpers (already memoized in context)
    hasRole: auth.hasRole,
    getUserRole: auth.getUserRole,
    isPrimaryRole: auth.isPrimaryRole,
    isAdmin: auth.isAdmin,
    isInfluencer: auth.isInfluencer,
    isFan: auth.isFan,
    
    // Profile helpers
    getDisplayName: auth.getDisplayName,
    getWalletBalance: () => auth.userData?.wallet?.balance || 0,
    getProfileImage: () => {
      return auth.userData?.influencer_profile?.profile_image ||
             auth.userData?.fan_profile?.profile_image_url ||
             null;
    },
    
    // Quick role checks
    isRole: (role: NavRole) => auth.isPrimaryRole(role),
    
    // Actions
    signOut: auth.signOut,
    refresh: auth.refresh,
    
    // Advanced helpers
    canAccessAdmin: () => auth.hasRole('admin'),
    canCreateGifts: () => auth.hasRole('fan') || auth.hasRole('admin'),
    canReceiveGifts: () => auth.hasRole('influencer') || auth.hasRole('admin'),
    canManageShops: () => auth.hasRole('admin'),
    
    // Profile completeness
    hasCompleteProfile: () => {
      const { userData } = auth;
      if (!userData) return false;
      
      if (auth.hasRole('influencer')) {
        return !!(userData.influencer_profile?.name && userData.influencer_profile?.platform);
      }
      
      if (auth.hasRole('fan')) {
        return !!(userData.fan_profile?.profile_name);
      }
      
      return !!(userData.profile?.name);
    },
  };
};

// Backward compatibility
export const useUser = () => {
  const auth = useOptimizedAuth();
  return {
    user: auth.userData?.profile,
    isLoading: auth.isLoading
  };
};