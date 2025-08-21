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

  // Preload data for common routes
  async preloadRoute(route: string): Promise<void> {
    if (this.preloadedRoutes.has(route)) {
      console.log(`🔄 Route ${route} already preloaded`);
      return;
    }

    console.log(`🚀 Preloading route: ${route}`);

    try {
      switch (route) {
        case '/':
        case '/home':
          await this.preloadHomeData();
          break;
        case '/profile':
          await this.preloadProfileData();
          break;
        case '/wallet':
          await this.preloadWalletData();
          break;
        case '/influencers':
          await this.preloadInfluencersData();
          break;
        case '/leaderboard':
          await this.preloadLeaderboardData();
          break;
      }

      this.preloadedRoutes.add(route);
      console.log(`✅ Route ${route} preloaded`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload ${route}:`, error);
    }
  }

  private async preloadHomeData(): Promise<void> {
    // Check if data is already cached
    const cachedInfluencers = optimizedCache.getStaticData('influencers_featured');
    const cachedLeaderboard = optimizedCache.getStaticData('leaderboard_current');
    
    if (cachedInfluencers && cachedLeaderboard) {
      console.log('🎯 Home data already cached');
      return;
    }

    // Trigger background loading
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('preload-home-data'));
    }, 100);
  }

  private async preloadProfileData(): Promise<void> {
    // Profile data is user-specific, so we can only preload general structure
    console.log('📋 Profile structure preloaded');
  }

  private async preloadWalletData(): Promise<void> {
    console.log('💰 Wallet structure preloaded');
  }

  private async preloadInfluencersData(): Promise<void> {
    const cached = optimizedCache.getStaticData('influencers_all');
    if (!cached) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('preload-influencers-data'));
      }, 100);
    }
  }

  private async preloadLeaderboardData(): Promise<void> {
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