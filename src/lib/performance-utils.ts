// Performance Utilities - Batch processing and optimization tools
// PURPOSE: Efficient processing of large document sets

export class BatchProcessor<T, R> {
  private batchSize: number
  private concurrency: number

  constructor(batchSize: number = 10, concurrency: number = 3) {
    this.batchSize = batchSize
    this.concurrency = concurrency
  }

  /**
   * Process items in batches with concurrency control
   */
  async processBatch(
    items: T[],
    processor: (item: T) => Promise<R>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<R[]> {
    const results: R[] = []
    let completed = 0

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize)
      const batchResults = await this.processConcurrent(batch, processor)
      results.push(...batchResults)
      
      completed += batch.length
      if (onProgress) {
        onProgress(completed, items.length)
      }
    }

    return results
  }

  /**
   * Process items concurrently with limit
   */
  private async processConcurrent(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < items.length; i += this.concurrency) {
      const chunk = items.slice(i, i + this.concurrency)
      const chunkResults = await Promise.all(chunk.map(processor))
      results.push(...chunkResults)
    }

    return results
  }

  setBatchSize(size: number): void {
    this.batchSize = size
  }

  setConcurrency(concurrency: number): void {
    this.concurrency = concurrency
  }
}

export class PerformanceMonitor {
  private metrics: Map<string, number[]>

  constructor() {
    this.metrics = new Map()
  }

  /**
   * Start timing an operation
   */
  start(operation: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, [])
      }
      this.metrics.get(operation)!.push(duration)
    }
  }

  /**
   * Get statistics for an operation
   */
  getStats(operation: string): {
    count: number
    total: number
    average: number
    min: number
    max: number
  } | null {
    const times = this.metrics.get(operation)
    if (!times || times.length === 0) return null

    return {
      count: times.length,
      total: times.reduce((sum, t) => sum + t, 0),
      average: times.reduce((sum, t) => sum + t, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Get all operations
   */
  getAllOperations(): string[] {
    return Array.from(this.metrics.keys())
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError || new Error('Retry failed')
}
