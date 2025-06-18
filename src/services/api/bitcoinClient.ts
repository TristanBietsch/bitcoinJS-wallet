/**
 * Simplified Bitcoin API Client
 * Replaces the complex 3-tier API system with a single, clean implementation
 * Uses React Query for caching instead of custom cache layers
 */
import { CURRENT_NETWORK } from '@/src/config/env'

interface APIEndpoint {
  name: string
  baseUrl: string
  timeout: number
}

// Network path helper
function getNetworkPath(): string {
  return CURRENT_NETWORK === 'mainnet' ? '' : '/testnet'
}

// Bitcoin API endpoints in priority order
const ENDPOINTS: APIEndpoint[] = [
  {
    name    : 'mempool-primary',
    baseUrl : `https://mempool.space${getNetworkPath()}/api`,
    timeout : 15000
  },
  {
    name    : 'blockstream-fallback', 
    baseUrl : `https://blockstream.info${getNetworkPath()}/api`,
    timeout : 15000
  }
]

/**
 * Simplified Bitcoin API Client
 */
export class BitcoinAPIClient {
  
  /**
   * Make request with automatic endpoint fallback
   */
  private static async makeRequest<T>(path: string): Promise<T> {
    let lastError: Error | null = null
    
    for (const endpoint of ENDPOINTS) {
      try {
        console.log(`🔄 [BitcoinAPI] Trying ${endpoint.name} for ${path}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout)
        
        const response = await fetch(`${endpoint.baseUrl}${path}`, {
          signal  : controller.signal,
          headers : {
            'Accept' : 'application/json',
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log(`✅ [BitcoinAPI] Success with ${endpoint.name}`)
        return data
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.warn(`❌ [BitcoinAPI] ${endpoint.name} failed: ${errorMsg}`)
        lastError = error instanceof Error ? error : new Error(errorMsg)
      }
    }
    
    // All endpoints failed
    console.error(`🚨 [BitcoinAPI] All endpoints failed for ${path}`)
    throw lastError || new Error('All API endpoints failed')
  }
  
  /**
   * Get UTXOs for an address
   */
  static async getUtxos(address: string): Promise<any[]> {
    if (!address) {
      throw new Error('Address is required')
    }
    
    return this.makeRequest(`/address/${address}/utxo`)
  }
  
  /**
   * Get transactions for an address
   */
  static async getTransactions(address: string): Promise<any[]> {
    if (!address) {
      throw new Error('Address is required')
    }
    
    return this.makeRequest(`/address/${address}/txs`)
  }
  
  /**
   * Get transaction details by txid
   */
  static async getTransactionDetails(txid: string): Promise<any> {
    if (!txid) {
      throw new Error('Transaction ID is required')
    }
    
    return this.makeRequest(`/tx/${txid}`)
  }
  
  /**
   * Get current fee estimates
   */
  static async getFeeEstimates(): Promise<any> {
    try {
      return await this.makeRequest('/fees/recommended')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.warn(`[BitcoinAPI] Fee estimates failed: ${errorMsg}, using defaults`)
      // Return sensible defaults based on network
      const isTestnet = CURRENT_NETWORK !== 'mainnet'
      return isTestnet
        ? { fastestFee: 2, halfHourFee: 1, hourFee: 1 }
        : { fastestFee: 25, halfHourFee: 15, hourFee: 10 }
    }
  }
  
  /**
   * Broadcast a raw transaction
   */
  static async broadcastTransaction(txHex: string): Promise<string> {
    if (!txHex) {
      throw new Error('Transaction hex is required')
    }
    
    console.log(`🔄 [BitcoinAPI] Attempting to broadcast transaction: ${txHex.substring(0, 20)}... (${txHex.length} chars)`)
    
    let lastError: Error | null = null
    
    for (const endpoint of ENDPOINTS) {
      try {
        console.log(`🔄 [BitcoinAPI] Broadcasting via ${endpoint.name} to ${endpoint.baseUrl}/tx (${txHex.length / 2} bytes)`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout)
        
        const response = await fetch(`${endpoint.baseUrl}/tx`, {
          method  : 'POST',
          headers : {
            'Content-Type'   : 'text/plain',
            'Content-Length' : (txHex.length / 2).toString(),
            'Accept'         : 'text/plain'
          },
          body   : txHex,
          signal : controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`❌ [BitcoinAPI] HTTP ${response.status} from ${endpoint.name}: ${errorText}`)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const txid = await response.text()
        console.log(`✅ [BitcoinAPI] Transaction broadcasted via ${endpoint.name}: ${txid}`)
        
        // Validate txid format (should be 64 hex characters)
        if (!/^[a-fA-F0-9]{64}$/.test(txid)) {
          console.warn(`⚠️ [BitcoinAPI] Invalid txid format received: ${txid}`)
        }
        
        return txid
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.warn(`❌ [BitcoinAPI] Broadcast failed via ${endpoint.name}: ${errorMsg}`)
        lastError = error instanceof Error ? error : new Error(errorMsg)
      }
    }
    
    // All endpoints failed
    console.error('🚨 [BitcoinAPI] Transaction broadcast failed on all endpoints')
    throw lastError || new Error('Transaction broadcast failed')
  }
} 