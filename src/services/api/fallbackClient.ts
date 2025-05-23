/**
 * Fallback API Client with multiple endpoints and stale-while-revalidate
 * Handles cases where primary APIs are slow or failing
 */
import { resilientClient, RequestPriority } from './resilientClient'

interface APIEndpoint {
  name: string
  baseUrl: string
  priority: number
  timeout: number
}

interface CacheEntry {
  data: any
  timestamp: number
  isStale: boolean
}

/**
 * API endpoint configurations for different services
 */
const BITCOIN_API_ENDPOINTS: APIEndpoint[] = [
  {
    name     : 'blockstream-primary',
    baseUrl  : 'https://blockstream.info/testnet/api',
    priority : 1,
    timeout  : 30000
  },
  {
    name     : 'mempool-fallback',
    baseUrl  : 'https://mempool.space/testnet/api',
    priority : 2,
    timeout  : 30000
  },
  {
    name     : 'blockstream-retry',
    baseUrl  : 'https://blockstream.info/testnet/api',
    priority : 3,
    timeout  : 30000
  }
]

class FallbackAPIClient {
  private persistentCache = new Map<string, CacheEntry>()
  private backgroundRefreshInProgress = new Set<string>()

  /**
   * Try multiple endpoints with fallback logic
   */
  async fetchWithFallback<T>(
    path: string,
    priority: RequestPriority = RequestPriority.NORMAL,
    cacheKey?: string,
    staleTolerance: number = 300000 // 5 minutes
  ): Promise<T> {
    // Check for cached data first
    if (cacheKey) {
      const cached = this.getCachedData<T>(cacheKey, staleTolerance)
      if (cached) {
        // Start background refresh if data is getting stale
        this.maybeStartBackgroundRefresh(path, cacheKey, staleTolerance)
        return cached
      }
    }

    // Try endpoints in priority order
    const sortedEndpoints = [ ...BITCOIN_API_ENDPOINTS ].sort((a, b) => a.priority - b.priority)
    
    let lastError: Error | null = null
    
    for (const endpoint of sortedEndpoints) {
      try {
        console.log(`Trying ${endpoint.name} for ${path}`)
        
        const url = `${endpoint.baseUrl}${path}`
        const data = await resilientClient.request<T>(
          'GET',
          url,
          undefined,
          { timeout: endpoint.timeout },
          priority
        )
        
        // Cache successful response
        if (cacheKey) {
          this.setCachedData(cacheKey, data)
        }
        
        console.log(`Success with ${endpoint.name}`)
        return data
        
      } catch (error) {
        console.warn(`${endpoint.name} failed for ${path}:`, error instanceof Error ? error.message : error)
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // If this was the primary endpoint and we have stale cache, return it
        if (endpoint.priority === 1 && cacheKey) {
          const staleData = this.getStaleData<T>(cacheKey)
          if (staleData) {
            console.log(`Returning stale data for ${path} due to primary endpoint failure`)
            // Continue trying other endpoints in background
            this.tryOtherEndpointsInBackground(path, cacheKey, priority, sortedEndpoints.slice(1))
            return staleData
          }
        }
      }
    }
    
    // All endpoints failed, throw the last error
    throw lastError || new Error('All API endpoints failed')
  }

  /**
   * Get cached data if within tolerance
   */
  private getCachedData<T>(key: string, staleTolerance: number): T | null {
    const cached = this.persistentCache.get(key)
    if (!cached) return null
    
    const age = Date.now() - cached.timestamp
    if (age <= staleTolerance) {
      return cached.data
    }
    
    return null
  }

  /**
   * Get stale data (beyond tolerance but still available)
   */
  private getStaleData<T>(key: string): T | null {
    const cached = this.persistentCache.get(key)
    return cached ? cached.data : null
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: any): void {
    this.persistentCache.set(key, {
      data,
      timestamp : Date.now(),
      isStale   : false
    })
  }

  /**
   * Start background refresh if data is getting stale
   */
  private maybeStartBackgroundRefresh(
    path: string, 
    cacheKey: string, 
    staleTolerance: number
  ): void {
    const cached = this.persistentCache.get(cacheKey)
    if (!cached) return
    
    const age = Date.now() - cached.timestamp
    const refreshThreshold = staleTolerance * 0.8 // Refresh when 80% of tolerance is reached
    
    if (age > refreshThreshold && !this.backgroundRefreshInProgress.has(cacheKey)) {
      this.backgroundRefreshInProgress.add(cacheKey)
      
      // Start background refresh
      this.fetchWithFallback(path, RequestPriority.LOW, undefined)
        .then(data => {
          this.setCachedData(cacheKey, data)
          console.log(`Background refresh completed for ${path}`)
        })
        .catch(error => {
          console.warn(`Background refresh failed for ${path}:`, error)
        })
        .finally(() => {
          this.backgroundRefreshInProgress.delete(cacheKey)
        })
    }
  }

  /**
   * Try remaining endpoints in background after returning stale data
   */
  private async tryOtherEndpointsInBackground(
    path: string,
    cacheKey: string,
    priority: RequestPriority,
    remainingEndpoints: APIEndpoint[]
  ): Promise<void> {
    for (const endpoint of remainingEndpoints) {
      try {
        const url = `${endpoint.baseUrl}${path}`
        const data = await resilientClient.request(
          'GET',
          url,
          undefined,
          { timeout: endpoint.timeout },
          RequestPriority.LOW // Use low priority for background requests
        )
        
        // Update cache with fresh data
        this.setCachedData(cacheKey, data)
        console.log(`Background update successful with ${endpoint.name}`)
        return
        
      } catch (error) {
        console.warn(`Background ${endpoint.name} failed:`, error instanceof Error ? error.message : error)
      }
    }
  }

  /**
   * Specific methods for Bitcoin API calls
   */
  async getUtxos(address: string): Promise<any[]> {
    const path = `/address/${address}/utxo`
    const cacheKey = `utxos:${address}`
    return this.fetchWithFallback(path, RequestPriority.HIGH, cacheKey, 120000) // 2 minute tolerance
  }

  async getTransactions(address: string): Promise<any[]> {
    const path = `/address/${address}/txs`
    const cacheKey = `txs:${address}`
    return this.fetchWithFallback(path, RequestPriority.NORMAL, cacheKey, 300000) // 5 minute tolerance
  }

  async getFeeEstimates(): Promise<any> {
    const path = '/mempool/fees'
    const cacheKey = 'fee-estimates'
    return this.fetchWithFallback(path, RequestPriority.NORMAL, cacheKey, 30000) // 30 second tolerance
  }

  async getTransactionDetails(txid: string): Promise<any> {
    const path = `/tx/${txid}`
    const cacheKey = `tx:${txid}`
    return this.fetchWithFallback(path, RequestPriority.NORMAL, cacheKey, 600000) // 10 minute tolerance
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    // Broadcasting should not use cache and should try all endpoints
    const path = '/tx'
    const sortedEndpoints = [ ...BITCOIN_API_ENDPOINTS ].sort((a, b) => a.priority - b.priority)
    
    for (const endpoint of sortedEndpoints) {
      try {
        const url = `${endpoint.baseUrl}${path}`
        const txid = await resilientClient.request<string>(
          'POST',
          url,
          txHex,
          { 
            headers : { 'Content-Type': 'text/plain' },
            timeout : endpoint.timeout 
          },
          RequestPriority.CRITICAL
        )
        
        console.log(`Transaction broadcast successful with ${endpoint.name}`)
        return txid
        
      } catch (error) {
        console.warn(`Broadcast failed with ${endpoint.name}:`, error instanceof Error ? error.message : error)
      }
    }
    
    throw new Error('Transaction broadcast failed on all endpoints')
  }

  /**
   * Health check across all endpoints
   */
  async checkEndpointHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    const healthChecks = BITCOIN_API_ENDPOINTS.map(async endpoint => {
      try {
        const url = `${endpoint.baseUrl}/blocks/tip/height`
        await resilientClient.request('GET', url, undefined, { timeout: 30000 }, RequestPriority.LOW)
        results[endpoint.name] = true
      } catch {
        results[endpoint.name] = false
      }
    })
    
    await Promise.allSettled(healthChecks)
    return results
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.persistentCache.clear()
    this.backgroundRefreshInProgress.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size    : this.persistentCache.size,
      entries : Array.from(this.persistentCache.keys())
    }
  }
}

// Export singleton instance
export const fallbackClient = new FallbackAPIClient()
export default fallbackClient 