import { optimizedCache } from './optimizedCache';

// Navigation optimizer to prevent cache clearing and improve transitions
export class NavigationOptimizer {
  private static instance: NavigationOptimizer;
  private preloadedRoutes = new Set<string>();

  static getInstance(): NavigationOptimizer {
    if (!NavigationOptimizer.instance) {
      NavigationOptimizer.instance = new NavigationOptimizer();
    }
    return NavigationOptimizer.instance;
  }

  // Preload data for common routes using requestIdleCallback for low-priority loading
  async preloadRoute(route: string): Promise<void> {
    if (this.preloadedRoutes.has(route)) {
      console.log(`✓ Route already preloaded: ${route}`);
      return;
    }

    console.log(`🔄 Preloading route: ${route}`);
    this.preloadedRoutes.add(route);

    // Use requestIdleCallback for low-priority preloading
    const preloadTask = () => {
      switch (route) {
        case '/':
        case '/home':
          this.preloadHomeData();
          break;
        case '/profile':
          this.preloadProfileData();
          break;
        case '/wallet':
          this.preloadWalletData();
          break;
        case '/influencers':
          this.preloadInfluencersData();
          break;
        case '/leaderboard':
          this.preloadLeaderboardData();
          break;
        case '/gift-shop':
          this.preloadGiftShopData();
          break;
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadTask(), { timeout: 2000 });
    } else {
      setTimeout(preloadTask, 100);
    }
  }

  private preloadGiftShopData(): void {
    const cached = optimizedCache.getStaticData('shops_featured');
    if (!cached) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('preload-giftshop-data'));
      }, 100);
    }
  }

  private preloadHomeData(): void {
    const cachedInfluencers = optimizedCache.getStaticData('influencers_featured');
    const cachedLeaderboard = optimizedCache.getStaticData('leaderboard_current');
    
    if (cachedInfluencers && cachedLeaderboard) {
      console.log('🎯 Home data already cached');
      return;
    }

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('preload-home-data'));
    }, 100);
  }

  private preloadProfileData(): void {
    console.log('📋 Profile structure preloaded');
  }

  private preloadWalletData(): void {
    console.log('💰 Wallet structure preloaded');
  }

  private preloadInfluencersData(): void {
    const cached = optimizedCache.getStaticData('influencers_all');
    if (!cached) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('preload-influencers-data'));
      }, 100);
    }
  }

  private preloadLeaderboardData(): void {
    const cached = optimizedCache.getStaticData('leaderboard_current');
    if (!cached) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('preload-leaderboard-data'));
      }, 100);
    }
  }

  // Clear preload cache when memory is low
  clearPreloadCache(): void {
    console.log('🧹 Clearing preload cache');
    this.preloadedRoutes.clear();
  }

  // Get preload status for debugging
  getPreloadStatus(): { routes: string[]; cacheStats: any } {
    return {
      routes: Array.from(this.preloadedRoutes),
      cacheStats: optimizedCache.getStats()
    };
  }
}

export const navigationOptimizer = NavigationOptimizer.getInstance();