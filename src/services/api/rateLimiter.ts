/**
 * Token Bucket Rate Limiter
 * Implements per-domain rate limiting with burst capability and request prioritization
 */

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstLimit: number;
  queueLimit: number;
}

export interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: RequestPriority;
  timestamp: number;
}

export enum RequestPriority {
  LOW = 0,      // Analytics, non-critical updates
  NORMAL = 1,   // Regular wallet operations
  HIGH = 2,     // User-initiated actions
  CRITICAL = 3  // Transaction broadcasting, urgent operations
}

class TokenBucket {
  private tokens: number
  private lastRefill: number
  private readonly config: RateLimitConfig
  private readonly queue: QueuedRequest[] = []
  private processing = false

  constructor(config: RateLimitConfig) {
    this.config = config
    this.tokens = config.burstLimit
    this.lastRefill = Date.now()
  }

  /**
   * Add tokens to the bucket based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000 // Convert to seconds
    const tokensToAdd = elapsed * this.config.requestsPerSecond
    
    this.tokens = Math.min(this.config.burstLimit, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  /**
   * Check if a token is available and consume it
   */
  private consumeToken(): boolean {
    this.refillTokens()
    
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    
    return false
  }

  /**
   * Add request to priority queue
   */
  private enqueue(request: QueuedRequest): void {
    if (this.queue.length >= this.config.queueLimit) {
      request.reject(new Error('Rate limit queue is full'))
      return
    }

    // Insert in priority order (higher priority first)
    let insertIndex = this.queue.length
    for (let i = 0; i < this.queue.length; i++) {
      if (request.priority > this.queue[i].priority) {
        insertIndex = i
        break
      }
    }
    
    this.queue.splice(insertIndex, 0, request)
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      if (!this.consumeToken()) {
        // No tokens available, wait before trying again
        const delay = 1000 / this.config.requestsPerSecond
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      const request = this.queue.shift()
      if (!request) break

      try {
        const result = await request.execute()
        request.resolve(result)
      } catch (error) {
        request.reject(error)
      }
    }

    this.processing = false
  }

  /**
   * Execute a request with rate limiting
   */
  async execute<T>(
    requestFn: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    // For critical requests or if token is immediately available, execute directly
    if (priority === RequestPriority.CRITICAL && this.consumeToken()) {
      return requestFn()
    }
    
    // For normal priority requests, try immediate execution first
    if (this.consumeToken()) {
      return requestFn()
    }

    // No tokens available, add to queue
    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        execute   : requestFn,
        resolve,
        reject,
        priority,
        timestamp : Date.now()
      }

      this.enqueue(queuedRequest)
      this.processQueue() // Start processing if not already running
    })
  }

  /**
   * Get current queue status
   */
  getStatus() {
    this.refillTokens()
    return {
      availableTokens : Math.floor(this.tokens),
      queueLength     : this.queue.length,
      isProcessing    : this.processing
    }
  }

  /**
   * Clear the entire queue (emergency stop)
   */
  clearQueue(): void {
    const queuedRequests = this.queue.splice(0)
    queuedRequests.forEach(request => {
      request.reject(new Error('Queue cleared'))
    })
  }
}

/**
 * Domain-based rate limiter manager
 */
export class RateLimiterManager {
  private buckets = new Map<string, TokenBucket>()
  private configs = new Map<string, RateLimitConfig>()

  /**
   * Configure rate limits for a specific domain
   */
  configure(domain: string, config: RateLimitConfig): void {
    this.configs.set(domain, config)
    this.buckets.set(domain, new TokenBucket(config))
  }

  /**
   * Get or create a bucket for a domain
   */
  private getBucket(domain: string): TokenBucket {
    let bucket = this.buckets.get(domain)
    
    if (!bucket) {
      // Use default config if none specified
      const defaultConfig: RateLimitConfig = {
        requestsPerSecond : 2,
        burstLimit        : 5,
        queueLimit        : 20
      }
      
      const config = this.configs.get(domain) || defaultConfig
      bucket = new TokenBucket(config)
      this.buckets.set(domain, bucket)
    }
    
    return bucket
  }

  /**
   * Execute a request with domain-specific rate limiting
   */
  async execute<T>(
    domain: string,
    requestFn: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    const bucket = this.getBucket(domain)
    return bucket.execute(requestFn, priority)
  }

  /**
   * Get status for all domains
   */
  getAllStatus() {
    const status: Record<string, any> = {}
    for (const [ domain, bucket ] of this.buckets) {
      status[domain] = bucket.getStatus()
    }
    return status
  }

  /**
   * Get status for a specific domain
   */
  getStatus(domain: string) {
    const bucket = this.buckets.get(domain)
    return bucket ? bucket.getStatus() : null
  }

  /**
   * Clear queue for a specific domain
   */
  clearQueue(domain: string): void {
    const bucket = this.buckets.get(domain)
    if (bucket) {
      bucket.clearQueue()
    }
  }

  /**
   * Clear all queues
   */
  clearAllQueues(): void {
    for (const bucket of this.buckets.values()) {
      bucket.clearQueue()
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiterManager() 