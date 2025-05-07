/**
 * Bitcoin RPC Configuration
 * 
 * This file contains the connection details for Bitcoin nodes 
 * on different networks (regtest, testnet, mainnet).
 * 
 * SECURITY NOTES:
 * - In production, credentials SHOULD NEVER be stored in this file
 * - Use a secure credentials manager or environment variables for production
 * - Enable SSL/TLS for all mainnet/testnet connections
 * - Consider using an API key service for remote node access
 */

import { BITCOIN_NETWORK, BitcoinNetworkType } from './bitcoinNetwork'
import { RpcConfig } from '../types/bitcoin'

/**
 * Get RPC credentials from environment variables if available
 * This provides better security than hardcoding credentials
 */
function getSecureCredentials(network: BitcoinNetworkType): { username: string, password: string } {
  // Try to get from environment variables
  const envUsername = process.env[`BITCOIN_${network.toUpperCase()}_USERNAME`]
  const envPassword = process.env[`BITCOIN_${network.toUpperCase()}_PASSWORD`]
  
  if (envUsername && envPassword) {
    return {
      username : envUsername,
      password : envPassword
    }
  }
  
  // Fallback to defaults (only safe for development)
  if (__DEV__) {
    return {
      username : 'admin',
      password : 'admin'
    }
  }
  
  // For production, warn about missing credentials
  console.warn(`SECURITY WARNING: Using default credentials for ${network} network. 
    This is UNSAFE for production. Please set environment variables:
    BITCOIN_${network.toUpperCase()}_USERNAME and BITCOIN_${network.toUpperCase()}_PASSWORD`)
  
  return {
    username : 'admin', // Should be replaced in production
    password : 'admin'  // Should be replaced in production
  }
}

// RPC configurations for each network type
const RPC_CONFIGS: Record<BitcoinNetworkType, RpcConfig> = {
  // Local regtest configuration (development)
  regtest : {
    host       : process.env.BITCOIN_REGTEST_HOST || 'localhost',
    port       : Number(process.env.BITCOIN_REGTEST_PORT) || 18443,
    ...getSecureCredentials('regtest'),
    protocol   : 'http',  // HTTP is acceptable for local regtest
    timeout    : 10000,
    maxRetries : 2
  },
  
  // Testnet configuration
  // TODO: Replace with secure credential management for production
  testnet : {
    host                : process.env.BITCOIN_TESTNET_HOST || 'localhost',
    port                : Number(process.env.BITCOIN_TESTNET_PORT) || 18332,
    ...getSecureCredentials('testnet'),
    protocol            : process.env.BITCOIN_TESTNET_PROTOCOL as 'http' | 'https' || 'https',
    timeout             : 15000,
    allowSelfSignedCert : __DEV__, // Only allow in development
    maxRetries          : 3
  },
  
  // Mainnet configuration
  // TODO: Replace with secure credential management for production
  mainnet : {
    host                : process.env.BITCOIN_MAINNET_HOST || 'localhost',
    port                : Number(process.env.BITCOIN_MAINNET_PORT) || 8332,
    ...getSecureCredentials('mainnet'),
    protocol            : process.env.BITCOIN_MAINNET_PROTOCOL as 'http' | 'https' || 'https',
    timeout             : 30000,
    allowSelfSignedCert : false, // Never allow self-signed certs in production
    maxRetries          : 3
  }
}

// Export the configuration for the current network
export const RPC_CONFIG = RPC_CONFIGS[BITCOIN_NETWORK]

// Build the RPC URL
export const RPC_URL = `${RPC_CONFIG.protocol}://${RPC_CONFIG.host}:${RPC_CONFIG.port}`

// Validate RPC configuration on startup
function validateRpcConfig() {
  // Security check: HTTPS should be used for non-local connections
  if (!__DEV__ && RPC_CONFIG.protocol !== 'https' && RPC_CONFIG.host !== 'localhost' && RPC_CONFIG.host !== '127.0.0.1') {
    console.error(`SECURITY WARNING: Using non-HTTPS connection for ${BITCOIN_NETWORK} network with a remote host. 
      This is INSECURE and could expose your credentials. Enable HTTPS for production use.`)
  }
  
  // Warning for default credentials in production
  if (!__DEV__ && RPC_CONFIG.username === 'admin' && RPC_CONFIG.password === 'admin') {
    console.error(`CRITICAL SECURITY WARNING: Using default credentials for ${BITCOIN_NETWORK} network in production.
      This is EXTREMELY UNSAFE. Set proper credentials via environment variables.`)
  }
}

// Run validation checks
validateRpcConfig() 