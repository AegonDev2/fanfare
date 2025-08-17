// Simple cache to prevent unnecessary auth reloads
interface AuthCacheEntry {
  userId: string;
  profile: any;
  userRole: string;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let authCache: AuthCacheEntry | null = null;

export const getAuthCache = (userId: string): AuthCacheEntry | null => {
  if (!authCache || authCache.userId !== userId) {
    return null;
  }
  
  const now = Date.now();
  if (now - authCache.timestamp > CACHE_DURATION) {
    authCache = null;
    return null;
  }
  
  return authCache;
};

export const setAuthCache = (userId: string, profile: any, userRole: string): void => {
  authCache = {
    userId,
    profile,
    userRole,
    timestamp: Date.now()
  };
};

export const clearAuthCache = (): void => {
  authCache = null;
};