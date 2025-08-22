import { Capacitor } from '@capacitor/core';

interface NetworkOptimizationConfig {
  enableRequestBatching: boolean;
  enableResponseCompression: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
}

class MobileNetworkOptimizer {
  private static instance: MobileNetworkOptimizer;
  private config: NetworkOptimizationConfig;
  private requestQueue: Array<{ url: string; options: RequestInit; resolve: Function; reject: Function }> = [];
  private activeRequests = 0;
  private requestBatchTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableRequestBatching: Capacitor.isNativePlatform(),
      enableResponseCompression: true,
      maxConcurrentRequests: Capacitor.isNativePlatform() ? 3 : 6,
      requestTimeout: Capacitor.isNativePlatform() ? 10000 : 5000
    };
  }

  static getInstance(): MobileNetworkOptimizer {
    if (!MobileNetworkOptimizer.instance) {
      MobileNetworkOptimizer.instance = new MobileNetworkOptimizer();
    }
    return MobileNetworkOptimizer.instance;
  }

  // Batch similar requests to reduce network overhead
  private batchRequests() {
    if (!this.config.enableRequestBatching || this.requestQueue.length === 0) return;

    // Group requests by endpoint pattern
    const batches = new Map<string, typeof this.requestQueue>();
    
    this.requestQueue.forEach(request => {
      const endpoint = this.getEndpointPattern(request.url);
      if (!batches.has(endpoint)) {
        batches.set(endpoint, []);
      }
      batches.get(endpoint)!.push(request);
    });

    // Process batches
    batches.forEach((requests, endpoint) => {
      if (requests.length > 1 && this.canBatchEndpoint(endpoint)) {
        this.processBatchedRequests(requests);
      } else {
        requests.forEach(request => this.processIndividualRequest(request));
      }
    });

    this.requestQueue = [];
  }

  private getEndpointPattern(url: string): string {
    // Extract pattern from URL for batching similar requests
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname.replace(/\/\d+/g, '/:id'); // Replace IDs with pattern
    } catch {
      return url;
    }
  }

  private canBatchEndpoint(endpoint: string): boolean {
    // Define which endpoints support batching
    const batchableEndpoints = [
      '/api/influencers',
      '/api/products',
      '/api/orders'
    ];
    
    return batchableEndpoints.some(pattern => endpoint.includes(pattern));
  }

  private async processBatchedRequests(requests: typeof this.requestQueue) {
    try {
      // Create batch request
      const batchPayload = {
        requests: requests.map(req => ({
          url: req.url,
          method: req.options.method || 'GET',
          headers: req.options.headers,
          body: req.options.body
        }))
      };

      const response = await this.executeBatchRequest(batchPayload);
      
      // Distribute responses back to original promises
      response.results.forEach((result: any, index: number) => {
        const originalRequest = requests[index];
        if (result.success) {
          originalRequest.resolve(new Response(JSON.stringify(result.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        } else {
          originalRequest.reject(new Error(result.error));
        }
      });
    } catch (error) {
      // Fallback to individual requests
      requests.forEach(request => this.processIndividualRequest(request));
    }
  }

  private async executeBatchRequest(payload: any): Promise<any> {
    const response = await fetch('/api/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Batch-Request': 'true'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`);
    }

    return response.json();
  }

  private async processIndividualRequest(request: typeof this.requestQueue[0]) {
    if (this.activeRequests >= this.config.maxConcurrentRequests) {
      // Wait for slot to become available
      await new Promise(resolve => setTimeout(resolve, 50));
      return this.processIndividualRequest(request);
    }

    this.activeRequests++;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);

      const optimizedOptions: RequestInit = {
        ...request.options,
        signal: controller.signal,
        headers: {
          ...request.options.headers,
          'Accept-Encoding': this.config.enableResponseCompression ? 'gzip, deflate' : undefined,
          'Connection': 'keep-alive',
          'X-Mobile-Optimized': 'true'
        }
      };

      const response = await fetch(request.url, optimizedOptions);
      clearTimeout(timeoutId);
      
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
    }
  }

  // Public API for optimized fetch
  async optimizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject });

      // Debounce batch processing
      if (this.requestBatchTimeout) {
        clearTimeout(this.requestBatchTimeout);
      }

      this.requestBatchTimeout = setTimeout(() => {
        this.batchRequests();
        this.requestBatchTimeout = null;
      }, 10); // Small delay to collect similar requests
    });
  }

  // Network condition detection
  detectNetworkCondition(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === '4g' && connection.downlink > 5) {
        return 'fast';
      }
    }

    // Fallback to simple online check
    return navigator.onLine ? 'slow' : 'offline';
  }

  // Adaptive request strategy based on network
  getOptimalRequestStrategy(): {
    maxConcurrentRequests: number;
    timeout: number;
    enablePrefetch: boolean;
  } {
    const networkCondition = this.detectNetworkCondition();
    
    switch (networkCondition) {
      case 'fast':
        return {
          maxConcurrentRequests: 6,
          timeout: 5000,
          enablePrefetch: true
        };
      case 'slow':
        return {
          maxConcurrentRequests: 2,
          timeout: 15000,
          enablePrefetch: false
        };
      case 'offline':
        return {
          maxConcurrentRequests: 0,
          timeout: 1000,
          enablePrefetch: false
        };
    }
  }

  // Initialize network optimizations
  initialize() {
    if (!Capacitor.isNativePlatform()) return;

    console.log('🌐 Initializing mobile network optimizations...');

    // Monitor network changes
    window.addEventListener('online', () => {
      console.log('📶 Network back online - resuming requests');
      this.config = { ...this.config, ...this.getOptimalRequestStrategy() };
    });

    window.addEventListener('offline', () => {
      console.log('📵 Network offline - queuing requests');
    });

    // Adaptive configuration based on network conditions
    const updateNetworkConfig = () => {
      const strategy = this.getOptimalRequestStrategy();
      this.config.maxConcurrentRequests = strategy.maxConcurrentRequests;
      this.config.requestTimeout = strategy.timeout;
    };

    updateNetworkConfig();
    setInterval(updateNetworkConfig, 30000); // Check every 30 seconds

    console.log('✅ Mobile network optimizations initialized');
  }
}

export const mobileNetworkOptimizer = MobileNetworkOptimizer.getInstance();