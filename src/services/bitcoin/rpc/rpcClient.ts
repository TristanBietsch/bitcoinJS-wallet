/**
 * Bitcoin RPC Client
 * 
 * Provides low-level communication with Bitcoin nodes via JSON-RPC
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { BITCOIN_NETWORK } from '../../../config/bitcoinNetwork'
import { RPC_CONFIG, RPC_URL } from '../../../config/rpc'
import { 
  BitcoinRpcResponse 
} from '../../../types/bitcoin'
import { 
  BitcoinAuthError, 
  BitcoinConnectionError,
  BitcoinRpcError 
} from '../errors/rpcErrors'

/**
 * Safely handle RPC errors and convert them to appropriate error types
 */
function handleRpcError(error: unknown, method: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    
    // Handle authentication errors
    if (axiosError.response?.status === 401) {
      throw new BitcoinAuthError()
    }
    
    // Handle connection errors
    if (!axiosError.response) {
      throw new BitcoinConnectionError(`Connection failed: ${axiosError.message}`)
    }
    
    // Handle RPC errors with response
    const errorData = axiosError.response.data as any
    if (errorData?.error) {
      throw new BitcoinRpcError(
        errorData.error.message || 'Unknown RPC error',
        errorData.error.code || -1,
        method
      )
    }
    
    throw new BitcoinConnectionError(`RPC request failed: ${axiosError.message}`)
  }
  
  // Handle other errors
  throw new BitcoinRpcError(
    `Bitcoin RPC error: ${error instanceof Error ? error.message : String(error)}`,
    -1,
    method
  )
}

/**
 * Make a generic RPC call to the Bitcoin node
 */
export async function callRpc<T>(method: string, params: any[] = []): Promise<T> {
  const requestId = Date.now()
  
  const requestConfig: AxiosRequestConfig = {
    auth : {
      username : RPC_CONFIG.username,
      password : RPC_CONFIG.password
    },
    headers : {
      'Content-Type' : 'application/json'
    },
    timeout : RPC_CONFIG.timeout
  }
  
  const requestBody = {
    jsonrpc : '1.0',
    id      : requestId,
    method,
    params
  }
  
  // Log in development mode
  if (__DEV__) {
    // Redact sensitive information in logs
    const redactedParams = method.includes('send') || method.includes('sign') ? 
      '[REDACTED FOR SECURITY]' : params
      
    console.log(`[Bitcoin RPC] Request: ${method}`, redactedParams)
  }
  
  try {
    const response: AxiosResponse<BitcoinRpcResponse<T>> = await axios.post(
      RPC_URL,
      requestBody,
      requestConfig
    )
    
    // Check for RPC errors
    if (response.data.error) {
      const errorMsg = `Bitcoin RPC Error: ${response.data.error.message} (Code: ${response.data.error.code})`
      console.error(errorMsg)
      throw new BitcoinRpcError(
        response.data.error.message, 
        response.data.error.code, 
        method
      )
    }
    
    // Log response in development mode
    if (__DEV__) {
      // Redact sensitive information in logs
      const redactedResult = method.includes('wallet') || method.includes('private') ? 
        '[REDACTED FOR SECURITY]' : response.data.result
        
      console.log(`[Bitcoin RPC] Response: ${method}`, redactedResult)
    }
    
    return response.data.result
  } catch (error) {
    return handleRpcError(error, method)
  }
}

/**
 * Check if the Bitcoin node is available
 */
export async function isNodeAvailable(): Promise<boolean> {
  try {
    const networkInfo = await callRpc<any>('getnetworkinfo', [])
    return !!networkInfo.version
  } catch (error) {
    console.error('Node availability check failed:', error)
    return false
  }
}

// Export Bitcoin network information
export { BITCOIN_NETWORK } 