// Request deduplication and retry logic
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestManager {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly DEDUPLICATION_WINDOW = 5000; // 5 seconds

  // Deduplicate identical requests within time window
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = this.pendingRequests.get(key);

    // If we have a pending request within the window, return it
    if (existing && (now - existing.timestamp) < this.DEDUPLICATION_WINDOW) {
      console.log('🔄 Deduplicating request:', key);
      return existing.promise;
    }

    // Create new request
    const promise = requestFn();
    this.pendingRequests.set(key, { promise, timestamp: now });

    try {
      const result = await promise;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
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
        console.warn(`Attempt ${attempt} failed:`, error);

        if (attempt === maxAttempts) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Combined dedupe + retry
  async dedupeWithRetry<T>(
    key: string,
    requestFn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    return this.dedupe(key, () => 
      this.withRetry(requestFn, maxAttempts)
    );
  }

  // Clear old requests periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.DEDUPLICATION_WINDOW * 2) {
        this.pendingRequests.delete(key);
      }
    }
  }
}

export const requestManager = new RequestManager();

// Cleanup old requests every minute
setInterval(() => requestManager.cleanup(), 60000);