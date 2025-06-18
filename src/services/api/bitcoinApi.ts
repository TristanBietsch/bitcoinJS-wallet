/**
 * Unified Bitcoin API Client
 * Consolidates bitcoinClient, fallbackClient, and resilientClient into a single clean implementation
 * Features: endpoint fallback, caching, retry logic, and circuit breaking
 */
import { CURRENT_NETWORK } from '@/src/config/env'
import logger, { LogScope } from '@/src/utils/logger'

interface APIEndpoint {
  name: string
  baseUrl: string
  timeout: number
  priority: number
}

interface CacheEntry {
  data: any
  timestamp: number
}

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  isOpen: boolean
  nextAttemptTime: number
}

/**
 * Network path helper for mainnet/testnet support
 */
function getNetworkPath(): string {
  return CURRENT_NETWORK === 'mainnet' ? '' : '/testnet'
}

/**
 * Bitcoin API endpoints in priority order
 */
const ENDPOINTS: APIEndpoint[] = [
  {
    name     : 'mempool-primary',
    baseUrl  : `https://mempool.space${getNetworkPath()}/api`,
    timeout  : 15000,
    priority : 1
  },
  {
    name     : 'blockstream-fallback', 
    baseUrl  : `https://blockstream.info${getNetworkPath()}/api`,
    timeout  : 15000,
    priority : 2
  }
]

/**
 * Unified Bitcoin API Client with resilient networking
 */
export class BitcoinAPIClient {
  private cache = new Map<string, CacheEntry>()
  private circuitBreakers = new Map<string, CircuitBreakerState>()
  private pendingRequests = new Map<string, Promise<any>>()

  /**
   * Get domain from URL for circuit breaker tracking
   */
  private getDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  /**
   * Check if circuit breaker is open for a domain
   */
  private isCircuitOpen(domain: string): boolean {
    const circuit = this.circuitBreakers.get(domain)
    if (!circuit) return false

    const now = Date.now()
    
    // Reset circuit if enough time has passed (30 seconds)
    if (circuit.isOpen && now > circuit.nextAttemptTime) {
      circuit.isOpen = false
      circuit.failures = 0
      return false
    }

    return circuit.isOpen
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(domain: string): void {
    const now = Date.now()
    let circuit = this.circuitBreakers.get(domain)
    
    if (!circuit) {
      circuit = {
        failures        : 0,
        lastFailureTime : now,
        isOpen          : false,
        nextAttemptTime : now
      }
      this.circuitBreakers.set(domain, circuit)
    }

    circuit.failures++
    circuit.lastFailureTime = now

    // Open circuit after 3 failures
    if (circuit.failures >= 3) {
      circuit.isOpen = true
      circuit.nextAttemptTime = now + 30000 // 30 second timeout
      logger.warn(LogScope.API, `Circuit breaker opened for ${domain}`)
    }
  }

  /**
   * Record a success for circuit breaker
   */
  private recordSuccess(domain: string): void {
    const circuit = this.circuitBreakers.get(domain)
    if (circuit) {
      circuit.failures = Math.max(0, circuit.failures - 1)
      if (circuit.failures === 0) {
        circuit.isOpen = false
      }
    }
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData<T>(key: string, maxAge: number): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const age = Date.now() - cached.timestamp
    if (age <= maxAge) {
      return cached.data
    }
    
    return null
  }

  /**
   * Cache successful response
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp : Date.now()
    })
  }

  /**
   * Make HTTP request with automatic endpoint fallback and resilience
   */
  private async makeRequest<T>(
    path: string, 
    options: {
      method?: 'GET' | 'POST'
      body?: string
      headers?: Record<string, string>
      cacheKey?: string
      cacheTtl?: number
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, cacheKey, cacheTtl = 0 } = options

    // Check cache for GET requests
    if (method === 'GET' && cacheKey && cacheTtl > 0) {
      const cached = this.getCachedData<T>(cacheKey, cacheTtl)
      if (cached) {
        logger.debug(LogScope.API, `Cache hit for ${path}`)
        return cached
      }
    }

    // Check for duplicate pending request
    const requestKey = `${method}:${path}:${body || ''}`
    if (this.pendingRequests.has(requestKey)) {
      logger.debug(LogScope.API, `Deduplicating request for ${path}`)
      return this.pendingRequests.get(requestKey)!
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(path, { method, body, headers })
      .then(result => {
        // Cache successful GET responses
        if (method === 'GET' && cacheKey && cacheTtl > 0) {
          this.setCachedData(cacheKey, result)
        }
        return result
      })
      .finally(() => {
        // Clean up pending request
        this.pendingRequests.delete(requestKey)
      })

    // Track pending request for deduplication
    this.pendingRequests.set(requestKey, requestPromise)
    
    return requestPromise
  }

  /**
   * Execute request across all available endpoints with fallback
   */
  private async executeRequest<T>(
    path: string,
    options: {
      method: 'GET' | 'POST'
      body?: string
      headers: Record<string, string>
    }
  ): Promise<T> {
    const { method, body, headers } = options
    let lastError: Error | null = null
    
    // Sort endpoints by priority
    const sortedEndpoints = [ ...ENDPOINTS ].sort((a, b) => a.priority - b.priority)
    
    for (const endpoint of sortedEndpoints) {
      const domain = this.getDomain(endpoint.baseUrl)
      
      // Skip if circuit breaker is open
      if (this.isCircuitOpen(domain)) {
        logger.warn(LogScope.API, `Skipping ${endpoint.name} - circuit breaker open`)
        continue
      }

      try {
        logger.progress(LogScope.API, `Trying ${endpoint.name} for ${method} ${path}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout)
        
        const response = await fetch(`${endpoint.baseUrl}${path}`, {
          method,
          headers : {
            'Accept' : method === 'GET' ? 'application/json' : 'text/plain',
            ...headers
          },
          body,
          signal : controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        // Record success for circuit breaker
        this.recordSuccess(domain)
        
        // Parse response based on content type
        const result = method === 'GET' ? await response.json() : await response.text()
        
        logger.success(LogScope.API, `Success with ${endpoint.name}`)
        return result
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        logger.warn(LogScope.API, `${endpoint.name} failed: ${errorMsg}`)
        
        // Record failure for circuit breaker
        this.recordFailure(domain)
        
        lastError = error instanceof Error ? error : new Error(errorMsg)
      }
    }
    
    // All endpoints failed
    logger.error(LogScope.API, `All endpoints failed for ${method} ${path}`)
    throw lastError || new Error('All API endpoints failed')
  }

  /**
   * Get UTXOs for an address
   */
  static async getUtxos(address: string): Promise<any[]> {
    if (!address) {
      throw new Error('Address is required')
    }
    
    const client = new BitcoinAPIClient()
    return client.makeRequest(`/address/${address}/utxo`, {
      cacheKey : `utxos:${address}`,
      cacheTtl : 120000 // 2 minutes
    })
  }
  
  /**
   * Get transactions for an address
   */
  static async getTransactions(address: string): Promise<any[]> {
    if (!address) {
      throw new Error('Address is required')
    }
    
    const client = new BitcoinAPIClient()
    return client.makeRequest(`/address/${address}/txs`, {
      cacheKey : `txs:${address}`,
      cacheTtl : 300000 // 5 minutes
    })
  }
  
  /**
   * Get transaction details by txid
   */
  static async getTransactionDetails(txid: string): Promise<any> {
    if (!txid) {
      throw new Error('Transaction ID is required')
    }
    
    const client = new BitcoinAPIClient()
    return client.makeRequest(`/tx/${txid}`, {
      cacheKey : `tx:${txid}`,
      cacheTtl : 600000 // 10 minutes
    })
  }
  
  /**
   * Get current fee estimates with endpoint-specific handling
   */
  static async getFeeEstimates(): Promise<any> {
    const client = new BitcoinAPIClient()
    
    // Check cache first
    const cached = client.getCachedData<any>('fee-estimates', 30000) // 30 seconds
    if (cached) {
      return cached
    }

    // Try different fee endpoints since APIs use different paths
    const feeEndpoints = [
      '/v1/fees/recommended', // Mempool.space format
      '/fee-estimates'        // Blockstream.info format
    ]
    
    let lastError: Error | null = null
    
    for (const endpoint of ENDPOINTS) {
      for (const feePath of feeEndpoints) {
        try {
          const response = await client.executeRequest(feePath, {
            method  : 'GET',
            headers : {}
          })
          
          // Normalize response format
          let feeData = response
          if (feePath === '/fee-estimates') {
            // Convert Blockstream format to Mempool format
            const blockstreamData = response as Record<string, number>
            feeData = {
              fastestFee  : blockstreamData['1'] || blockstreamData['2'] || blockstreamData['3'] || 25,
              halfHourFee : blockstreamData['6'] || blockstreamData['10'] || blockstreamData['12'] || 15,
              hourFee     : blockstreamData['144'] || blockstreamData['72'] || blockstreamData['24'] || 10,
              economyFee  : blockstreamData['144'] || blockstreamData['504'] || blockstreamData['1008'] || 5,
              minimumFee  : 1
            }
          }
          
          // Cache the result
          client.setCachedData('fee-estimates', feeData)
          return feeData
          
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
        }
      }
    }
    
    // All fee endpoints failed, return network-appropriate defaults
    logger.warn(LogScope.API, 'All fee estimate endpoints failed, using defaults')
    
    const isTestnet = CURRENT_NETWORK !== 'mainnet'
    const defaultFees = isTestnet
      ? { fastestFee: 2, halfHourFee: 1, hourFee: 1, economyFee: 1, minimumFee: 1 }
      : { fastestFee: 25, halfHourFee: 15, hourFee: 10, economyFee: 5, minimumFee: 1 }
    
    client.setCachedData('fee-estimates', defaultFees)
    return defaultFees
  }
  
  /**
   * Broadcast a raw transaction
   */
  static async broadcastTransaction(txHex: string): Promise<string> {
    if (!txHex) {
      throw new Error('Transaction hex is required')
    }
    
    logger.debug(LogScope.API, `Broadcasting transaction: ${txHex.substring(0, 20)}... (${txHex.length / 2} bytes)`)
    
    const client = new BitcoinAPIClient()
    const txid = await client.makeRequest<string>('/tx', {
      method  : 'POST',
      body    : txHex,
      headers : {
        'Content-Type'   : 'text/plain',
        'Content-Length' : (txHex.length / 2).toString()
      }
    })
    
    // Validate txid format
    if (!/^[a-fA-F0-9]{64}$/.test(txid)) {
      logger.warn(LogScope.API, `Invalid txid format received: ${txid}`)
    }
    
    logger.success(LogScope.API, `Transaction broadcasted: ${txid}`)
    return txid
  }

  /**
   * Health check across all endpoints
   */
  static async checkEndpointHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    const client = new BitcoinAPIClient()
    
    const healthChecks = ENDPOINTS.map(async endpoint => {
      try {
        await client.executeRequest('/blocks/tip/height', {
          method  : 'GET',
          headers : {}
        })
        results[endpoint.name] = true
      } catch {
        results[endpoint.name] = false
      }
    })
    
    await Promise.allSettled(healthChecks)
    return results
  }

  /**
   * Clear all caches and circuit breakers
   */
  static clearCache(): void {
    const client = new BitcoinAPIClient()
    client.cache.clear()
    client.circuitBreakers.clear()
    client.pendingRequests.clear()
  }

  /**
   * Get cache and circuit breaker status for monitoring
   */
  static getStatus(): {
    cache: { size: number; entries: string[] }
    circuits: Record<string, any>
  } {
    const client = new BitcoinAPIClient()
    
    const circuits: Record<string, any> = {}
    for (const [ domain, circuit ] of client.circuitBreakers.entries()) {
      circuits[domain] = {
        isOpen          : circuit.isOpen,
        failures        : circuit.failures,
        nextAttemptTime : circuit.nextAttemptTime
      }
    }
    
    return {
      cache : {
        size    : client.cache.size,
        entries : Array.from(client.cache.keys())
      },
      circuits
    }
  }
}

// Export singleton-style static methods as the main interface
export default BitcoinAPIClient