import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

interface MobilePerformanceConfig {
  enableNativeOptimizations: boolean;
  aggressiveCaching: boolean;
  preloadCriticalData: boolean;
  optimizeForLowMemory: boolean;
}

class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private config: MobilePerformanceConfig;
  private deviceInfo: any = null;
  private performanceMetrics: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      enableNativeOptimizations: Capacitor.isNativePlatform(),
      aggressiveCaching: true,
      preloadCriticalData: true,
      optimizeForLowMemory: false
    };
    this.initializeDeviceInfo();
  }

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
    }
    return MobilePerformanceOptimizer.instance;
  }

  private async initializeDeviceInfo() {
    if (Capacitor.isNativePlatform()) {
      try {
        this.deviceInfo = await Device.getInfo();
        
        // Optimize for low-end devices
        if (this.deviceInfo.memUsed && this.deviceInfo.memUsed > 0.8) {
          this.config.optimizeForLowMemory = true;
        }
        
        console.log('📱 Device Info:', {
          platform: this.deviceInfo.platform,
          model: this.deviceInfo.model,
          memoryOptimization: this.config.optimizeForLowMemory
        });
      } catch (error) {
        console.warn('Failed to get device info:', error);
      }
    }
  }

  // Critical: Optimize WebView performance
  optimizeWebView() {
    if (!Capacitor.isNativePlatform()) return;

    // Enable hardware acceleration
    document.documentElement.style.transform = 'translateZ(0)';
    
    // Optimize scrolling performance
    (document.body.style as any).webkitOverflowScrolling = 'touch';
    (document.body.style as any).overflowScrolling = 'touch';

    // Disable text selection to improve performance
    (document.body.style as any).webkitUserSelect = 'none';
    document.body.style.userSelect = 'none';

    // Optimize touch events
    document.body.style.touchAction = 'manipulation';
  }

  // Aggressive resource management for mobile
  setupResourceManagement() {
    if (!this.config.optimizeForLowMemory) return;

    // Implement aggressive garbage collection
    const cleanupInterval = setInterval(() => {
      if ('gc' in window && typeof window.gc === 'function') {
        window.gc();
      }
      
      // Clear unused query cache more aggressively on mobile
      window.dispatchEvent(new CustomEvent('mobile-cleanup-cache'));
    }, 30000);

    // Cleanup on app background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(cleanupInterval);
        window.dispatchEvent(new CustomEvent('mobile-cleanup-cache'));
      }
    });
  }

  // Preload critical data intelligently
  async preloadCriticalResources() {
    if (!this.config.preloadCriticalData) return;

    const criticalUrls = [
      '/api/influencers/preview',
      '/api/leaderboard/current',
      '/api/user/profile'
    ];

    const preloadPromises = criticalUrls.map(async (url) => {
      try {
        const startTime = performance.now();
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'X-Preload': 'true' }
        });
        const endTime = performance.now();
        
        this.performanceMetrics.set(url, endTime - startTime);
        console.log(`📊 Preloaded ${url} in ${(endTime - startTime).toFixed(2)}ms`);
        
        return response.json();
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  // Optimize network requests for mobile
  createOptimizedFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = performance.now();
      
      try {
        // Add mobile-specific headers
        const optimizedInit: RequestInit = {
          ...init,
          headers: {
            ...init?.headers,
            'X-Mobile-App': 'true',
            'Connection': 'keep-alive',
            'Cache-Control': this.config.aggressiveCaching ? 'max-age=300' : 'no-cache'
          }
        };

        const response = await originalFetch(input, optimizedInit);
        const endTime = performance.now();
        
        // Log slow requests
        const duration = endTime - startTime;
        if (duration > 1000) {
          console.warn(`🐌 Slow request detected: ${input} took ${duration.toFixed(2)}ms`);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        console.error(`❌ Request failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }

  // Bundle splitting optimization
  async loadComponentChunk(componentName: string) {
    const startTime = performance.now();
    
    try {
      let component;
      
      // Lazy load components based on current route
      switch (componentName) {
        case 'AdminDashboard':
          component = await import('@/pages/AdminDashboard');
          break;
        case 'GiftShop':
          component = await import('@/pages/GiftShop');
          break;
        case 'Influencers':
          component = await import('@/pages/Influencers');
          break;
        case 'Leaderboard':
          component = await import('@/pages/Leaderboard');
          break;
        case 'Wallet':
          component = await import('@/pages/Wallet');
          break;
        default:
          throw new Error(`Unknown component: ${componentName}`);
      }
      
      const endTime = performance.now();
      console.log(`📦 Loaded ${componentName} chunk in ${(endTime - startTime).toFixed(2)}ms`);
      
      return component;
    } catch (error) {
      console.error(`Failed to load ${componentName} chunk:`, error);
      throw error;
    }
  }

  // Performance monitoring
  startPerformanceMonitoring() {
    // Monitor FPS
    let frames = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        console.log(`📊 Current FPS: ${fps}`);
        
        if (fps < 30) {
          console.warn('⚠️ Low FPS detected, consider optimizing');
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        console.log(`📊 Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
        
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('⚠️ High memory usage detected');
          window.dispatchEvent(new CustomEvent('mobile-cleanup-cache'));
        }
      }, 10000);
    }
  }

  // Initialize all optimizations
  async initialize() {
    console.log('🚀 Initializing mobile performance optimizations...');
    
    this.optimizeWebView();
    this.setupResourceManagement();
    this.createOptimizedFetch();
    this.startPerformanceMonitoring();
    
    if (this.config.preloadCriticalData) {
      await this.preloadCriticalResources();
    }
    
    console.log('✅ Mobile performance optimizations initialized');
  }

  getPerformanceReport() {
    return {
      deviceInfo: this.deviceInfo,
      config: this.config,
      metrics: Object.fromEntries(this.performanceMetrics),
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.config.optimizeForLowMemory) {
      recommendations.push('Consider reducing image quality for low-memory devices');
      recommendations.push('Implement more aggressive component unmounting');
    }
    
    const slowRequests = Array.from(this.performanceMetrics.entries())
      .filter(([_, time]) => time > 1000);
    
    if (slowRequests.length > 0) {
      recommendations.push('Optimize slow API endpoints: ' + slowRequests.map(([url]) => url).join(', '));
    }
    
    return recommendations;
  }
}

export const mobilePerformanceOptimizer = MobilePerformanceOptimizer.getInstance();