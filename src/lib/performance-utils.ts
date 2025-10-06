// Performance utilities for high-volume document analysis
// Implements BatchProcessor, PerformanceMonitor, debounce, throttle, and retry

/**
 * Process large item sets in batches with concurrency control
 */
export class BatchProcessor {
  private batchSize: number;
  private concurrency: number;
  
  constructor(batchSize: number = 100, concurrency: number = 5) {
    this.batchSize = batchSize;
    this.concurrency = concurrency;
  }
  
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await this.processWithConcurrency(batch, processor);
      results.push(...batchResults);
      
      // Rate limiting between batches
      if (i + this.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
  
  async processWithConcurrency<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.concurrency) {
      const batch = items.slice(i, i + this.concurrency);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  }
}

/**
 * Track and analyze operation timings
 */
export class PerformanceMonitor {
  private timings = new Map<string, number[]>();
  
  /**
   * Start timing an operation
   * @returns Function to call when operation completes
   */
  start(operationName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (!this.timings.has(operationName)) {
        this.timings.set(operationName, []);
      }
      
      this.timings.get(operationName)!.push(duration);
    };
  }
  
  /**
   * Get statistics for an operation
   */
  getStats(operationName: string) {
    const times = this.timings.get(operationName) || [];
    
    if (times.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, total: 0 };
    }
    
    const total = times.reduce((sum, t) => sum + t, 0);
    const average = total / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return {
      count: times.length,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
  
  /**
   * Get all operation names being tracked
   */
  getAllOperations(): string[] {
    return Array.from(this.timings.keys());
  }
  
  /**
   * Clear all timing data
   */
  clear(): void {
    this.timings.clear();
  }
  
  /**
   * Clear timing data for specific operation
   */
  clearOperation(operationName: string): void {
    this.timings.delete(operationName);
  }
}

/**
 * Rate-limit function execution (waits until calls stop)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}

/**
 * Limit function call frequency (calls at most once per interval)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= limitMs) {
      lastCall = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
        timeout = null;
      }, limitMs - (now - lastCall));
    }
  };
}

/**
 * Automatic retry with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2
  } = options;
  
  let lastError: Error | null = null;
  let delay = initialDelayMs;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}