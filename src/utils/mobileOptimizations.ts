// Mobile-specific optimizations for Android performance
import { performanceCache } from './performanceCache';

interface PerformanceMetrics {
  loadTime: number;
  networkRequests: number;
  cacheHits: number;
  memoryUsage: number;
  timestamp: number;
}

class MobileOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private isLowEndDevice = false;
  private networkType: string = 'unknown';
  private isInitialized = false;

  constructor() {
    this.detectDeviceCapabilities();
    this.setupNetworkMonitoring();
    this.setupPerformanceMonitoring();
  }

  // Device capability detection
  private detectDeviceCapabilities(): void {
    try {
      // Check device memory
      const deviceMemory = (navigator as any).deviceMemory;
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      
      // Consider device low-end if < 4GB RAM or < 4 cores
      this.isLowEndDevice = deviceMemory < 4 || hardwareConcurrency < 4;
      
      console.log(`📱 Device: ${this.isLowEndDevice ? 'Low-end' : 'High-end'} (${deviceMemory}GB RAM, ${hardwareConcurrency} cores)`);
    } catch (error) {
      // Fallback: assume low-end for safety
      this.isLowEndDevice = true;
    }
  }

  // Network monitoring and adaptive loading
  private setupNetworkMonitoring(): void {
    try {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        this.networkType = connection.effectiveType || 'unknown';
        
        connection.addEventListener('change', () => {
          this.networkType = connection.effectiveType || 'unknown';
          this.adaptToNetworkConditions();
        });
        
        console.log(`🌐 Network: ${this.networkType}`);
      }
    } catch (error) {
      console.warn('Network monitoring not supported');
    }
  }

  // Performance monitoring
  private setupPerformanceMonitoring(): void {
    // Track page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
            this.recordMetric({ 
              loadTime, 
              networkRequests: performance.getEntriesByType('resource').length,
              cacheHits: performanceCache.getStats().hits,
              memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
              timestamp: Date.now()
            });
          }
        }, 1000);
      });
    }
  }

  // Adapt behavior based on network conditions
  private adaptToNetworkConditions(): void {
    const config = this.getOptimizedConfig();
    
    // Update cache settings based on network
    if (this.networkType === 'slow-2g' || this.networkType === '2g') {
      // Aggressive caching for slow networks
      console.log('📶 Slow network detected - enabling aggressive caching');
    } else if (this.networkType === '4g') {
      // Normal caching for fast networks
      console.log('📶 Fast network detected - using normal caching');
    }
  }

  // Get optimized configuration based on device and network
  getOptimizedConfig() {
    return {
      // Cache settings
      cacheSize: this.isLowEndDevice ? 100 : 200,
      cacheTTL: this.isSlowNetwork() ? 30 * 60 * 1000 : 15 * 60 * 1000,
      
      // Loading settings
      enableLazyLoading: this.isLowEndDevice,
      preloadCount: this.isLowEndDevice ? 2 : 5,
      
      // Image settings
      imageQuality: this.isSlowNetwork() ? 'low' : 'high',
      enableWebP: !this.isLowEndDevice,
      
      // Network settings
      requestTimeout: this.isSlowNetwork() ? 15000 : 8000,
      retryAttempts: this.isSlowNetwork() ? 5 : 3,
      
      // UI settings
      enableAnimations: !this.isLowEndDevice,
      enableTransitions: !this.isLowEndDevice,
      
      // Batch sizes
      dataBatchSize: this.isLowEndDevice ? 10 : 20,
      requestBatchSize: this.isLowEndDevice ? 3 : 5
    };
  }

  // Check if network is slow
  private isSlowNetwork(): boolean {
    return ['slow-2g', '2g', '3g'].includes(this.networkType);
  }

  // Preload critical resources with priority
  async preloadCriticalResources(): Promise<void> {
    const config = this.getOptimizedConfig();
    
    console.log('🚀 Preloading critical resources...');
    
    const criticalResources = {
      // High priority - auth and user data
      auth_session: async () => {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase.auth.getSession();
          return data.session;
        } catch (error) {
          console.warn('Failed to preload auth session:', error);
          return null;
        }
      },
      
      // Medium priority - static data
      static_platforms: async () => {
        return ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Twitch'];
      },
      
      static_categories: async () => {
        return ['Gaming', 'Lifestyle', 'Fashion', 'Tech', 'Food', 'Travel', 'Fitness'];
      }
    };

    // Load high priority first, then medium
    const highPriority = ['auth_session'];
    const mediumPriority = ['static_platforms', 'static_categories'];
    
    // Load high priority resources immediately
    for (const key of highPriority) {
      try {
        const data = await criticalResources[key as keyof typeof criticalResources]();
        performanceCache.set(key, data);
        console.log('✅ Preloaded:', key);
      } catch (error) {
        console.warn('❌ Failed to preload:', key, error);
      }
    }
    
    // Load medium priority resources with delay on slow networks
    const delay = this.isSlowNetwork() ? 500 : 100;
    setTimeout(async () => {
      for (const key of mediumPriority) {
        try {
          const data = await criticalResources[key as keyof typeof criticalResources]();
          performanceCache.set(key, data);
          console.log('✅ Preloaded:', key);
        } catch (error) {
          console.warn('❌ Failed to preload:', key, error);
        }
      }
    }, delay);
  }

  // Optimize images for mobile
  optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return url;
    
    const config = this.getOptimizedConfig();
    
    // For Google Drive images, already handled in components
    if (url.includes('drive.google.com')) {
      return url;
    }
    
    // For other images, apply mobile optimizations
    let optimizedUrl = url;
    
    // Add size parameters if supported
    if (width && height) {
      const separator = url.includes('?') ? '&' : '?';
      optimizedUrl += `${separator}w=${width}&h=${height}`;
      
      // Add quality parameter for slow networks
      if (config.imageQuality === 'low') {
        optimizedUrl += '&q=60';
      }
    }
    
    return optimizedUrl;
  }

  // Batch database requests for efficiency
  createBatchedFetcher<T>(
    fetchFn: (ids: string[]) => Promise<T[]>,
    batchSize?: number
  ) {
    const config = this.getOptimizedConfig();
    const actualBatchSize = batchSize || config.requestBatchSize;
    
    return async (ids: string[]): Promise<T[]> => {
      if (ids.length <= actualBatchSize) {
        return fetchFn(ids);
      }
      
      // Split into batches
      const batches: string[][] = [];
      for (let i = 0; i < ids.length; i += actualBatchSize) {
        batches.push(ids.slice(i, i + actualBatchSize));
      }
      
      // Execute batches with delay between them on slow networks
      const results: T[] = [];
      for (let i = 0; i < batches.length; i++) {
        if (i > 0 && this.isSlowNetwork()) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const batchResult = await fetchFn(batches[i]);
        results.push(...batchResult);
      }
      
      return results;
    };
  }

  // Record performance metrics
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 10 metrics
    if (this.metrics.length > 10) {
      this.metrics = this.metrics.slice(-10);
    }
    
    // Log performance issues
    if (metric.loadTime > 5000) {
      console.warn('⚠️ Slow page load detected:', metric.loadTime + 'ms');
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    if (this.metrics.length === 0) return null;
    
    const latest = this.metrics[this.metrics.length - 1];
    const average = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length;
    
    return {
      latestLoadTime: latest.loadTime,
      averageLoadTime: Math.round(average),
      networkType: this.networkType,
      isLowEndDevice: this.isLowEndDevice,
      cacheStats: performanceCache.getStats(),
      recommendations: this.getPerformanceRecommendations()
    };
  }

  // Get performance recommendations
  private getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getPerformanceSummary();
    
    if (!summary) return recommendations;
    
    if (summary.averageLoadTime > 3000) {
      recommendations.push('Consider enabling more aggressive caching');
    }
    
    if (this.isSlowNetwork()) {
      recommendations.push('Reduce image sizes and enable compression');
    }
    
    if (this.isLowEndDevice) {
      recommendations.push('Disable animations and reduce UI complexity');
    }
    
    if (summary.cacheStats.hitRate < 50) {
      recommendations.push('Improve cache hit rate by preloading common data');
    }
    
    return recommendations;
  }

  // Clear all optimization data
  reset(): void {
    this.metrics = [];
    performanceCache.clear();
  }
}

export const mobileOptimizer = new MobileOptimizer();
