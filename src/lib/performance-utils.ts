// Batch processing utilities for high-volume document analysis
export class BatchProcessor {
  private readonly BATCH_SIZE = 100;
  
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map(processor);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
  
  async processWithConcurrency<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  }
}