interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestManager {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly DEDUP_WINDOW = 1000; // 1 second

  // Deduplicate identical requests within time window
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = this.pendingRequests.get(key);
    
    // Return existing request if within dedup window
    if (existing && (now - existing.timestamp) < this.DEDUP_WINDOW) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return existing.promise;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, { promise, timestamp: now });
    return promise;
  }

  // Retry with exponential backoff
  async withRetry<T>(
    fn: () => Promise<T>, 
    maxAttempts: number = 3, 
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) break;
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Combine deduplication and retry
  async dedupeWithRetry<T>(
    key: string,
    requestFn: () => Promise<T>,
    maxAttempts: number = 2
  ): Promise<T> {
    return this.dedupe(key, () => this.withRetry(requestFn, maxAttempts));
  }

  // Clean up expired requests
  cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.DEDUP_WINDOW * 2) {
        this.pendingRequests.delete(key);
      }
    }
  }
}

export const requestManager = new RequestManager();

// Clean up periodically
setInterval(() => requestManager.cleanup(), 60000);