// Optimized cache with structured keys and smart TTLs
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheStats {
  size: number;
  hitRate: number;
  totalRequests: number;
  hits: number;
}

class OptimizedCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    size: 0,
    hitRate: 0,
    totalRequests: 0,
    hits: 0
  };

  // Smart TTL based on data type
  private getTTL(key: string): number {
    const TTL_AUTH = 30 * 60 * 1000; // 30 minutes for auth data
    const TTL_STATIC = 2 * 60 * 60 * 1000; // 2 hours for static data
    const TTL_DYNAMIC = 5 * 60 * 1000; // 5 minutes for dynamic data
    const TTL_SHORT = 60 * 1000; // 1 minute for frequent updates

    if (key.includes('user_complete') || key.includes('auth')) return TTL_AUTH;
    if (key.includes('static') || key.includes('influencers') || key.includes('shops')) return TTL_STATIC;
    if (key.includes('leaderboard') || key.includes('notifications')) return TTL_DYNAMIC;
    return TTL_SHORT;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.getTTL(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;

    // Auto-cleanup expired entries
    setTimeout(() => {
      this.cleanupExpired();
    }, ttl);
  }

  get<T>(key: string): T | null {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return null;
    }

    this.stats.hits++;
    this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      size: 0,
      hitRate: 0,
      totalRequests: 0,
      hits: 0
    };
  }

  // Clear all user-specific data
  clearUserData(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.delete(key));
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Structured cache helpers with reduced key count
  getUserComplete(userId: string) {
    return this.get<any>(`user_complete_${userId}`);
  }

  setUserComplete(userId: string, data: any) {
    this.set(`user_complete_${userId}`, data);
  }

  getStaticData(key: string) {
    return this.get<any>(`static_${key}`);
  }

  setStaticData(key: string, data: any) {
    this.set(`static_${key}`, data);
  }

  getDynamicData(userId: string, type: string) {
    return this.get<any>(`dynamic_${userId}_${type}`);
  }

  setDynamicData(userId: string, type: string, data: any) {
    this.set(`dynamic_${userId}_${type}`, data);
  }
}

// Export optimized cache instance
export const optimizedCache = new OptimizedCache();

// Backward compatibility helpers for existing code
export const cacheHelpers = {
  // Auth data - now simplified to single key per user
  setAuthData: (userId: string, data: any) => {
    optimizedCache.setUserComplete(userId, data);
  },
  
  getAuthData: (userId: string) => {
    return optimizedCache.getUserComplete(userId);
  },

  // Static data that rarely changes
  setStaticData: (key: string, data: any) => {
    optimizedCache.setStaticData(key, data);
  },
  
  getStaticData: (key: string) => {
    return optimizedCache.getStaticData(key);
  },

  // Clear user-specific cache
  clearUserCache: (userId: string) => {
    optimizedCache.clearUserData(userId);
  },

  // Get cache performance stats
  getStats: () => optimizedCache.getStats()
};