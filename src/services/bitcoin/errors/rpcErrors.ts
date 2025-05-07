/**
 * Bitcoin RPC Error Types
 * 
 * This module defines custom error types for Bitcoin RPC operations
 */

/**
 * Base error class for all Bitcoin RPC errors
 */
export class BitcoinError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BitcoinError'
  }
}

/**
 * Error thrown when a Bitcoin RPC call fails with an error code
 */
export class BitcoinRpcError extends BitcoinError {
  code: number
  method: string

  constructor(message: string, code: number, method: string) {
    super(message)
    this.name = 'BitcoinRpcError'
    this.code = code
    this.method = method
  }
}

/**
 * Error thrown when connection to Bitcoin node fails
 */
export class BitcoinConnectionError extends BitcoinError {
  constructor(message: string) {
    super(message)
    this.name = 'BitcoinConnectionError'
  }
}

/**
 * Error thrown when authentication with Bitcoin node fails
 */
export class BitcoinAuthError extends BitcoinError {
  constructor() {
    super('Authentication failed for Bitcoin RPC')
    this.name = 'BitcoinAuthError'
  }
}

/**
 * Error thrown when an invalid address is used
 */
export class BitcoinAddressError extends BitcoinError {
  address: string
  
  constructor(message: string, address: string) {
    super(message)
    this.name = 'BitcoinAddressError'
    this.address = address
  }
}

/**
 * Error thrown when an operation is not supported on current network
 */
export class BitcoinNetworkError extends BitcoinError {
  network: string
  
  constructor(message: string, network: string) {
    super(message)
    this.name = 'BitcoinNetworkError'
    this.network = network
  }
} 