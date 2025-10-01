// Memory Optimizer - Intelligent memory management for large document processing
// PURPOSE: Prevent memory overflow when processing massive legal documents

export class MemoryOptimizer {
  private cacheLimit: number
  private cache: Map<string, any>
  private accessTimestamps: Map<string, number>

  constructor(cacheLimitMB: number = 100) {
    this.cacheLimit = cacheLimitMB * 1024 * 1024 // Convert to bytes
    this.cache = new Map()
    this.accessTimestamps = new Map()
  }

  /**
   * Store item in cache with automatic eviction
   */
  set(key: string, value: any): void {
    const size = this.estimateSize(value)
    
    // Evict if necessary
    while (this.getCurrentSize() + size > this.cacheLimit && this.cache.size > 0) {
      this.evictLRU()
    }
    
    this.cache.set(key, value)
    this.accessTimestamps.set(key, Date.now())
  }

  /**
   * Retrieve item from cache
   */
  get(key: string): any | undefined {
    if (this.cache.has(key)) {
      this.accessTimestamps.set(key, Date.now())
      return this.cache.get(key)
    }
    return undefined
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.accessTimestamps.clear()
  }

  /**
   * Get current cache size in bytes
   */
  private getCurrentSize(): number {
    let total = 0
    for (const value of this.cache.values()) {
      total += this.estimateSize(value)
    }
    return total
  }

  /**
   * Estimate memory size of an object
   */
  private estimateSize(obj: any): number {
    if (obj === null || obj === undefined) return 0
    
    if (typeof obj === 'string') {
      return obj.length * 2 // UTF-16 encoding
    }
    
    if (typeof obj === 'number') {
      return 8 // 64-bit number
    }
    
    if (typeof obj === 'boolean') {
      return 4
    }
    
    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.estimateSize(item), 0)
    }
    
    if (typeof obj === 'object') {
      return Object.values(obj).reduce((sum, val) => sum + this.estimateSize(val), 0)
    }
    
    return 0
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, timestamp] of this.accessTimestamps) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.accessTimestamps.delete(oldestKey)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    items: number
    sizeMB: number
    limitMB: number
    hitRate: number
  } {
    return {
      items: this.cache.size,
      sizeMB: this.getCurrentSize() / (1024 * 1024),
      limitMB: this.cacheLimit / (1024 * 1024),
      hitRate: 0 // Would need hit tracking for accurate rate
    }
  }
}
