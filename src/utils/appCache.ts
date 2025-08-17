interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

class AppCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SHORT_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly LONG_TTL = 30 * 60 * 1000; // 30 minutes

  // Cache TTL configurations for different data types
  private getTTL(key: string): number {
    if (key.startsWith('profile_') || key.startsWith('influencer_')) return this.LONG_TTL;
    if (key.startsWith('leaderboard_') || key.startsWith('creators_')) return this.DEFAULT_TTL;
    if (key.startsWith('notifications_') || key.startsWith('orders_')) return this.SHORT_TTL;
    if (key.startsWith('static_')) return this.LONG_TTL;
    return this.DEFAULT_TTL;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.getTTL(key);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
    
    // Set cleanup timer
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const ttl = this.getTTL(key);
    const isExpired = Date.now() - entry.timestamp > ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear all cache entries for a specific user
  clearUserCache(userId: string): void {
    for (const [key] of this.cache) {
      if (key.includes(userId)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Preload commonly accessed data
  async preloadUserData(userId: string, supabase: any): Promise<void> {
    try {
      // Preload user profile
      if (!this.get(`profile_${userId}`)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (profile) {
          this.set(`profile_${userId}`, profile);
        }
      }

      // Preload influencer profile if exists
      if (!this.get(`influencer_${userId}`)) {
        const { data: influencer } = await supabase
          .from('influencer_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (influencer) {
          this.set(`influencer_${userId}`, influencer);
        }
      }

      // Preload fan profile if exists
      if (!this.get(`fan_${userId}`)) {
        const { data: fan } = await supabase
          .from('fan_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fan) {
          this.set(`fan_${userId}`, fan);
        }
      }
    } catch (error) {
      console.error('Error preloading user data:', error);
    }
  }
}

// Singleton instance
export const appCache = new AppCache();

// Helper functions for specific cache operations
export const cacheHelpers = {
  // Auth cache
  setAuthData: (userId: string, data: any) => {
    appCache.set(`auth_${userId}`, data);
  },
  
  getAuthData: (userId: string) => {
    return appCache.get(`auth_${userId}`);
  },

  // Profile cache
  setProfile: (userId: string, profile: any, type: 'influencer' | 'fan' | 'general') => {
    appCache.set(`profile_${type}_${userId}`, profile);
  },
  
  getProfile: (userId: string, type: 'influencer' | 'fan' | 'general') => {
    return appCache.get(`profile_${type}_${userId}`);
  },

  // Leaderboard cache
  setLeaderboard: (type: string, data: any) => {
    appCache.set(`leaderboard_${type}`, data);
  },
  
  getLeaderboard: (type: string) => {
    return appCache.get(`leaderboard_${type}`);
  },

  // Notifications cache
  setNotifications: (userId: string, notifications: any[]) => {
    appCache.set(`notifications_${userId}`, notifications);
  },
  
  getNotifications: (userId: string) => {
    return appCache.get(`notifications_${userId}`);
  },

  // Orders cache
  setOrders: (userId: string, orders: any[], type: string = 'all') => {
    appCache.set(`orders_${type}_${userId}`, orders);
  },
  
  getOrders: (userId: string, type: string = 'all') => {
    return appCache.get(`orders_${type}_${userId}`);
  },

  // Static data cache
  setStaticData: (key: string, data: any) => {
    appCache.set(`static_${key}`, data);
  },
  
  getStaticData: (key: string) => {
    return appCache.get(`static_${key}`);
  },

  // Clear user-specific cache on logout
  clearUserCache: (userId: string) => {
    appCache.clearUserCache(userId);
  }
};