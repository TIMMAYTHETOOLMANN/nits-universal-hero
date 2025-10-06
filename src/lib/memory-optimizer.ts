// Memory optimization utilities for handling large legal datasets
// Implements LRU (Least Recently Used) cache eviction strategy

interface CacheEntry<T> {
  value: T;
  size: number;
  lastAccessed: number;
}

export class MemoryOptimizer<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSizeBytes: number;
  private currentSizeBytes: number = 0;
  
  constructor(maxSizeMB: number = 100) {
    this.maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  }
  
  /**
   * Store item in cache with automatic size estimation
   */
  set(key: string, value: T): void {
    const size = this.estimateSize(value);
    
    // If adding this item would exceed max size, evict LRU items
    while (this.currentSizeBytes + size > this.maxSizeBytes && this.cache.size > 0) {
      this.evictLRU();
    }
    
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.currentSizeBytes -= this.cache.get(key)!.size;
    }
    
    this.cache.set(key, {
      value,
      size,
      lastAccessed: Date.now()
    });
    
    this.currentSizeBytes += size;
  }
  
  /**
   * Retrieve item from cache and update access time
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.value;
    }
    return undefined;
  }
  
  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSizeBytes -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSizeBytes = 0;
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entryCount: this.cache.size,
      currentSizeMB: (this.currentSizeBytes / (1024 * 1024)).toFixed(2),
      maxSizeMB: (this.maxSizeBytes / (1024 * 1024)).toFixed(2),
      utilizationPercent: ((this.currentSizeBytes / this.maxSizeBytes) * 100).toFixed(2)
    };
  }
  
  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  /**
   * Estimate size of object in bytes
   */
  private estimateSize(value: T): number {
    const jsonString = JSON.stringify(value);
    return new Blob([jsonString]).size;
  }
}