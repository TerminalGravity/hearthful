import { trackEvent } from "./monitoring";

interface BatchOptions {
  maxBatchSize?: number;
  maxWaitTime?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface BatchItem<T, R> {
  input: T;
  resolve: (value: R) => void;
  reject: (error: Error) => void;
}

class BatchProcessor<T, R> {
  private queue: BatchItem<T, R>[] = [];
  private timer: NodeJS.Timeout | null = null;
  private processing = false;
  private options: Required<BatchOptions>;

  constructor(
    private processBatch: (items: T[]) => Promise<R[]>,
    options: BatchOptions = {}
  ) {
    this.options = {
      maxBatchSize: options.maxBatchSize || 100,
      maxWaitTime: options.maxWaitTime || 50,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 100,
    };
  }

  async add(input: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ input, resolve, reject });

      if (this.queue.length >= this.options.maxBatchSize) {
        this.processQueue();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.processQueue(), this.options.maxWaitTime);
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0, this.options.maxBatchSize);
    const inputs = batch.map(item => item.input);
    const startTime = Date.now();

    try {
      const results = await this.processWithRetry(inputs);

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });

      await trackEvent({
        action: 'batch_processed',
        category: 'performance',
        value: batch.length,
        metadata: {
          duration: Date.now() - startTime,
          batchSize: batch.length,
        },
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error as Error);
      });

      await trackEvent({
        action: 'batch_error',
        category: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          batchSize: batch.length,
        },
      });
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  private async processWithRetry(inputs: T[]): Promise<R[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        return await this.processBatch(inputs);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.options.retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, this.options.retryDelay * attempt)
          );
          
          await trackEvent({
            action: 'batch_retry',
            category: 'performance',
            value: attempt,
            metadata: {
              error: lastError.message,
              batchSize: inputs.length,
            },
          });
        }
      }
    }

    throw lastError || new Error('Batch processing failed');
  }
}

export function createBatchProcessor<T, R>(
  processBatch: (items: T[]) => Promise<R[]>,
  options?: BatchOptions
): BatchProcessor<T, R> {
  const processor = new BatchProcessor<T, R>(processBatch, options);

  process.on('beforeExit', () => {
    if (processor['timer']) {
      clearTimeout(processor['timer']);
    }
  });

  return processor;
} 