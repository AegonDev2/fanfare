// Unified high-performance cache system for Android optimization
import { requestManager } from './requestDeduplication';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  networkStatus: 'fresh' | 'stale' | 'expired';
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  persistKeys: string[];
  compressionThreshold: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig = {
    maxSize: 200, // Reduced for mobile
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    persistKeys: ['auth_', 'user_', 'static_'],
    compressionThreshold: 50000 // 50KB
  };

  private stats = {
    hits: 0,
    misses: 0,
    size: 0,
    backgroundSync: 0
  };

  constructor() {
    this.loadFromPersistentStorage();
    this.startBackgroundTasks();
  }

  // Get with background refresh for stale data
  async get<T>(key: string, refreshFn?: () => Promise<T>): Promise<T | null> {
    this.stats.size = this.cache.size;
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Return expired data immediately but trigger background refresh
    if (age > entry.ttl) {
      entry.networkStatus = 'expired';
      if (refreshFn) {
        this.backgroundRefresh(key, refreshFn);
      }
      return entry.data; // Return stale data for immediate UX
    }

    // Mark as stale if 70% of TTL passed, trigger background refresh
    if (age > entry.ttl * 0.7) {
      entry.networkStatus = 'stale';
      if (refreshFn) {
        this.backgroundRefresh(key, refreshFn);
      }
    }

    this.stats.hits++;
    return entry.data;
  }

  // Set with intelligent TTL based on data type and usage
  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.getSmartTTL(key, data);
    const priority = this.getPriority(key);
    
    // Compression for large data
    const serializedData = this.shouldCompress(data) ? 
      this.compress(data) : data;

    this.cache.set(key, {
      data: serializedData,
      timestamp: Date.now(),
      ttl,
      priority,
      networkStatus: 'fresh'
    });

    this.enforceMemoryLimits();
    this.persistIfNeeded(key);
  }

  // Cache-first data fetching with background sync
  async fetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options: { 
      ttl?: number; 
      forceRefresh?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const cacheKey = `fetch_${key}`;
    
    // Return cache immediately unless force refresh
    if (!options.forceRefresh) {
      const cached = await this.get(cacheKey, fetchFn);
      if (cached !== null) {
        return cached;
      }
    }

    // Deduplicate network requests
    return requestManager.dedupeWithRetry(cacheKey, async () => {
      const data = await fetchFn();
      this.set(cacheKey, data, options.ttl);
      return data;
    });
  }

  // Batch operations for multiple cache operations
  async batchGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    for (const key of keys) {
      results[key] = await this.get<T>(key);
    }
    
    return results;
  }

  batchSet(entries: Array<{ key: string; data: any; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl);
    }
  }

  // Warm cache with critical data
  async warmCache(warmingMap: Record<string, () => Promise<any>>): Promise<void> {
    console.log('🔥 Warming cache for', Object.keys(warmingMap).length, 'entries');
    
    const promises = Object.entries(warmingMap).map(async ([key, fetchFn]) => {
      try {
        const data = await fetchFn();
        this.set(key, data);
        console.log('✅ Warmed cache for', key);
      } catch (error) {
        console.warn('❌ Failed to warm cache for', key, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Background refresh without blocking UI
  private async backgroundRefresh<T>(key: string, refreshFn: () => Promise<T>): Promise<void> {
    this.stats.backgroundSync++;
    
    try {
      // Use requestIdleCallback if available, otherwise setTimeout
      const scheduleWork = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(callback, { timeout: 5000 });
        } else {
          setTimeout(callback, 100);
        }
      };

      scheduleWork(async () => {
        try {
          const freshData = await refreshFn();
          this.set(key, freshData);
          console.log('🔄 Background refreshed:', key);
        } catch (error) {
          console.warn('Background refresh failed for', key, error);
        }
      });
    } catch (error) {
      console.warn('Background refresh error:', error);
    }
  }

  // Smart TTL based on data patterns
  private getSmartTTL(key: string, data: any): number {
    // User data - longer TTL, updated less frequently
    if (key.includes('user_') || key.includes('profile_')) {
      return 30 * 60 * 1000; // 30 minutes
    }
    
    // Static data - very long TTL
    if (key.includes('static_') || key.includes('categories') || key.includes('platforms')) {
      return 2 * 60 * 60 * 1000; // 2 hours
    }
    
    // Real-time data - short TTL
    if (key.includes('leaderboard') || key.includes('notifications')) {
      return 2 * 60 * 1000; // 2 minutes
    }
    
    // Auth data - medium TTL
    if (key.includes('auth_') || key.includes('session_')) {
      return 15 * 60 * 1000; // 15 minutes
    }
    
    return this.config.defaultTTL;
  }

  private getPriority(key: string): 'high' | 'medium' | 'low' {
    if (key.includes('auth_') || key.includes('user_')) return 'high';
    if (key.includes('static_') || key.includes('influencer_')) return 'medium';
    return 'low';
  }

  private shouldCompress(data: any): boolean {
    try {
      return JSON.stringify(data).length > this.config.compressionThreshold;
    } catch {
      return false;
    }
  }

  private compress(data: any): any {
    // Simple compression - in production, use proper compression library
    try {
      const str = JSON.stringify(data);
      return { __compressed: true, data: str };
    } catch {
      return data;
    }
  }

  private decompress(data: any): any {
    if (data?.__compressed) {
      try {
        return JSON.parse(data.data);
      } catch {
        return data.data;
      }
    }
    return data;
  }

  // Memory management for mobile devices
  private enforceMemoryLimits(): void {
    if (this.cache.size <= this.config.maxSize) return;

    // Sort by priority and age, remove least important old entries
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        age: Date.now() - entry.timestamp,
        priority: entry.priority
      }))
      .sort((a, b) => {
        // Sort by priority first, then by age
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        return priorityDiff !== 0 ? priorityDiff : a.age - b.age;
      });

    // Remove oldest low-priority entries
    const toRemove = entries.slice(this.config.maxSize);
    toRemove.forEach(({ key }) => {
      this.cache.delete(key);
      this.removeFromPersistentStorage(key);
    });

    console.log(`🧹 Cache cleanup: removed ${toRemove.length} entries`);
  }

  // Persistent storage for critical data
  private loadFromPersistentStorage(): void {
    try {
      const stored = localStorage.getItem('performance_cache');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, entry]: [string, any]) => {
          // Only load non-expired persistent entries
          if (this.shouldPersist(key) && entry.timestamp + entry.ttl > Date.now()) {
            this.cache.set(key, {
              ...entry,
              data: this.decompress(entry.data)
            });
          }
        });
        console.log('💾 Loaded', this.cache.size, 'entries from persistent storage');
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error);
    }
  }

  private persistIfNeeded(key: string): void {
    if (!this.shouldPersist(key)) return;

    try {
      const persistentData: Record<string, any> = {};
      
      this.cache.forEach((entry, cacheKey) => {
        if (this.shouldPersist(cacheKey)) {
          persistentData[cacheKey] = {
            ...entry,
            data: this.shouldCompress(entry.data) ? 
              this.compress(entry.data) : entry.data
          };
        }
      });

      localStorage.setItem('performance_cache', JSON.stringify(persistentData));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  private removeFromPersistentStorage(key: string): void {
    try {
      const stored = localStorage.getItem('performance_cache');
      if (stored) {
        const data = JSON.parse(stored);
        delete data[key];
        localStorage.setItem('performance_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to remove from persistent storage:', error);
    }
  }

  private shouldPersist(key: string): boolean {
    return this.config.persistKeys.some(prefix => key.startsWith(prefix));
  }

  private startBackgroundTasks(): void {
    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > entry.ttl * 2) { // Double TTL for cleanup
          this.cache.delete(key);
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        console.log(`🧹 Background cleanup: removed ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000);

    // Persist critical data every 10 minutes
    setInterval(() => {
      this.persistIfNeeded('background_persist');
    }, 10 * 60 * 1000);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    localStorage.removeItem('performance_cache');
    this.stats = { hits: 0, misses: 0, size: 0, backgroundSync: 0 };
  }

  // Clear user-specific data
  clearUserData(userId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(userId) || key.includes('user_')) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.removeFromPersistentStorage(key);
    });
    
    console.log(`🗑️ Cleared ${keysToDelete.length} user cache entries`);
  }

  // Performance stats
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 ? 
      (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.cache.size
    };
  }
}

export const performanceCache = new PerformanceCache();