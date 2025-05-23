/**
 * Phase 4: Optimized API Client with predictive loading and advanced caching
 * Designed to eliminate timeout errors through aggressive optimization
 */
import { fallbackClient } from './fallbackClient'
import { resilientUtils } from './resilientClient'

interface PredictiveLoadConfig {
  enabled: boolean
  patterns: Map<string, number> // Track access patterns
  preloadThreshold: number // Load data when X% of cache lifetime remains
}

interface OptimizedCacheEntry {
  data: any
  timestamp: number
  accessCount: number
  lastAccessed: number
  predictedNextAccess: number
}

class OptimizedAPIClient {
  private predictiveCache = new Map<string, OptimizedCacheEntry>()
  private accessPatterns = new Map<string, number[]>() // Track access times
  private preloadQueue = new Set<string>()
  
  private config: PredictiveLoadConfig = {
    enabled          : true,
    patterns         : new Map(),
    preloadThreshold : 0.7 // Preload when 70% of cache time has passed
  }

  /**
   * Enhanced cache with access pattern tracking
   */
  private getCachedData<T>(key: string, maxAge: number): T | null {
    const cached = this.predictiveCache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age <= maxAge) {
      // Update access patterns
      cached.accessCount++
      cached.lastAccessed = Date.now()
      this.updateAccessPattern(key)
      
      // Schedule predictive preload if needed
      this.schedulePreload(key, maxAge)
      
      return cached.data
    }

    return null
  }

  /**
   * Cache data with access tracking
   */
  private setCachedData(key: string, data: any): void {
    const now = Date.now()
    const existing = this.predictiveCache.get(key)
    
    this.predictiveCache.set(key, {
      data,
      timestamp           : now,
      accessCount         : existing ? existing.accessCount + 1 : 1,
      lastAccessed        : now,
      predictedNextAccess : this.predictNextAccess(key)
    })
  }

  /**
   * Track when data is accessed to predict future needs
   */
  private updateAccessPattern(key: string): void {
    const now = Date.now()
    const pattern = this.accessPatterns.get(key) || []
    pattern.push(now)
    
    // Keep only last 10 access times
    if (pattern.length > 10) {
      pattern.shift()
    }
    
    this.accessPatterns.set(key, pattern)
  }

  /**
   * Predict when data will be accessed next
   */
  private predictNextAccess(key: string): number {
    const pattern = this.accessPatterns.get(key)
    if (!pattern || pattern.length < 2) {
      return Date.now() + 300000 // Default to 5 minutes
    }

    // Calculate average interval between accesses
    const intervals: number[] = []
    for (let i = 1; i < pattern.length; i++) {
      intervals.push(pattern[i] - pattern[i - 1])
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    return Date.now() + avgInterval
  }

  /**
   * Schedule predictive preload if data will be needed soon
   */
  private schedulePreload(key: string, maxAge: number): void {
    if (!this.config.enabled || this.preloadQueue.has(key)) return

    const cached = this.predictiveCache.get(key)
    if (!cached) return

    const age = Date.now() - cached.timestamp
    const shouldPreload = age > (maxAge * this.config.preloadThreshold)
    const willBeNeededSoon = cached.predictedNextAccess < Date.now() + maxAge

    if (shouldPreload && willBeNeededSoon) {
      this.preloadQueue.add(key)
      
      // Start preload in background
      setTimeout(() => {
        this.executePreload(key)
      }, 1000) // Small delay to avoid blocking current operation
    }
  }

  /**
   * Execute background preload for predicted data needs
   */
  private async executePreload(key: string): Promise<void> {
    try {
      if (key.startsWith('utxos:')) {
        const address = key.split(':')[1]
        const data = await fallbackClient.getUtxos(address)
        this.setCachedData(key, data)
        console.log(`Predictive preload completed for UTXOs: ${address}`)
      } else if (key.startsWith('txs:')) {
        const address = key.split(':')[1]
        const data = await fallbackClient.getTransactions(address)
        this.setCachedData(key, data)
        console.log(`Predictive preload completed for transactions: ${address}`)
      } else if (key === 'fee-estimates') {
        const data = await fallbackClient.getFeeEstimates()
        this.setCachedData(key, data)
        console.log(`Predictive preload completed for fee estimates`)
      }
    } catch (error) {
      console.warn(`Predictive preload failed for ${key}:`, error)
    } finally {
      this.preloadQueue.delete(key)
    }
  }

  /**
   * Optimized UTXO fetching with aggressive caching and prediction
   */
  async getUtxos(address: string): Promise<any[]> {
    const cacheKey = `utxos:${address}`
    const cacheAge = 180000 // 3 minutes for UTXOs
    
    // Try cache first
    const cached = this.getCachedData<any[]>(cacheKey, cacheAge)
    if (cached) {
      return cached
    }

    // Cache miss - fetch with fallback
    try {
      const data = await fallbackClient.getUtxos(address)
      this.setCachedData(cacheKey, data)
      return data
         } catch (error) {
       // If all endpoints fail, return stale cache if available
       const stale = this.predictiveCache.get(cacheKey)
       if (stale) {
         console.warn(`All endpoints failed for UTXOs, returning stale cache for ${address}`)
         return stale.data
       }
       throw error
     }
  }

  /**
   * Optimized transaction fetching
   */
  async getTransactions(address: string): Promise<any[]> {
    const cacheKey = `txs:${address}`
    const cacheAge = 600000 // 10 minutes for transactions
    
    const cached = this.getCachedData<any[]>(cacheKey, cacheAge)
    if (cached) {
      return cached
    }

    try {
      const data = await fallbackClient.getTransactions(address)
      this.setCachedData(cacheKey, data)
      return data
         } catch (error) {
       const stale = this.predictiveCache.get(cacheKey)
       if (stale) {
         console.warn(`All endpoints failed for transactions, returning stale cache for ${address}`)
         return stale.data
       }
       throw error
     }
  }

  /**
   * Optimized fee estimates
   */
  async getFeeEstimates(): Promise<any> {
    const cacheKey = 'fee-estimates'
    const cacheAge = 60000 // 1 minute for fees
    
    const cached = this.getCachedData<any>(cacheKey, cacheAge)
    if (cached) {
      return cached
    }

    try {
      const data = await fallbackClient.getFeeEstimates()
      this.setCachedData(cacheKey, data)
      return data
         } catch (error) {
       console.error('Fee estimation error:', error)
       const stale = this.predictiveCache.get(cacheKey)
       if (stale) {
         console.warn(`All endpoints failed for fees, returning stale cache`)
         return stale.data
       }
       // Return sensible defaults for fees
       console.warn('Fee estimates failed, using safe defaults')
       return { '1': 20, '6': 10, '144': 2 }
     }
  }

  /**
   * Transaction details with long cache
   */
  async getTransactionDetails(txid: string): Promise<any> {
    const cacheKey = `tx:${txid}`
    const cacheAge = 3600000 // 1 hour for transaction details
    
    const cached = this.getCachedData<any>(cacheKey, cacheAge)
    if (cached) {
      return cached
    }

    const data = await fallbackClient.getTransactionDetails(txid)
    this.setCachedData(cacheKey, data)
    return data
  }

  /**
   * Broadcast transaction (no caching)
   */
  async broadcastTransaction(txHex: string): Promise<string> {
    return fallbackClient.broadcastTransaction(txHex)
  }

  /**
   * Warm up cache for known addresses
   */
  async warmUpCache(addresses: string[]): Promise<void> {
    const warmupPromises = addresses.map(async (address) => {
      try {
        // Start background loads for all data types
        await Promise.allSettled([
          this.getUtxos(address),
          this.getTransactions(address)
        ])
        console.log(`Cache warmed up for ${address}`)
      } catch (error) {
        console.warn(`Failed to warm up cache for ${address}:`, error)
      }
    })

    await Promise.allSettled(warmupPromises)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    entries: string[]
    accessPatterns: number
    preloadQueue: number
    hitRate: number
  } {
    const totalAccesses = Array.from(this.predictiveCache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0)
    
    const cacheHits = Array.from(this.predictiveCache.values())
      .filter(entry => entry.accessCount > 1).length

    return {
      size           : this.predictiveCache.size,
      entries        : Array.from(this.predictiveCache.keys()),
      accessPatterns : this.accessPatterns.size,
      preloadQueue   : this.preloadQueue.size,
      hitRate        : totalAccesses > 0 ? cacheHits / totalAccesses : 0
    }
  }

  /**
   * Configure optimization settings
   */
  configureOptimization(config: Partial<PredictiveLoadConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Clear all optimized cache
   */
  clearCache(): void {
    this.predictiveCache.clear()
    this.accessPatterns.clear()
    this.preloadQueue.clear()
    fallbackClient.clearCache()
  }

  /**
   * Health check across all systems
   */
  async getSystemHealth(): Promise<{
    endpoints: Record<string, boolean>
    circuits: Record<string, any>
    cache: any
  }> {
    const [ endpoints, circuits ] = await Promise.all([
      fallbackClient.checkEndpointHealth(),
      Promise.resolve(resilientUtils.getCircuitStatus())
    ])

    return {
      endpoints,
      circuits,
      cache : this.getCacheStats()
    }
  }
}

// Export singleton instance
export const optimizedClient = new OptimizedAPIClient()
export default optimizedClient 