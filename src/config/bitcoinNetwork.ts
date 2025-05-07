/**
 * Bitcoin Network Configuration
 * 
 * This file controls which Bitcoin network the app connects to.
 * Options are:
 * - "regtest" - Local development environment (default)
 * - "testnet" - Bitcoin testnet
 * - "mainnet" - Bitcoin mainnet (production)
 */

// Valid Bitcoin network types
export type BitcoinNetworkType = 'regtest' | 'testnet' | 'mainnet'

// Default to regtest if not specified
const defaultNetwork: BitcoinNetworkType = 'regtest'

// Read network from environment variable if available
const envNetwork = process.env.BITCOIN_NETWORK as BitcoinNetworkType | undefined

// Validate that the network is one of the supported types
const isValidNetwork = (network?: string): network is BitcoinNetworkType => {
  return network === 'regtest' || network === 'testnet' || network === 'mainnet'
}

// Export the configured network, with fallback to default
export const BITCOIN_NETWORK: BitcoinNetworkType = 
  isValidNetwork(envNetwork) ? envNetwork : defaultNetwork

// Export network-specific constants
export const IS_REGTEST = BITCOIN_NETWORK === 'regtest'
export const IS_TESTNET = BITCOIN_NETWORK === 'testnet'
export const IS_MAINNET = BITCOIN_NETWORK === 'mainnet'

// BIP44 coin type per network (used for derivation paths)
export const BIP44_COIN_TYPE = IS_TESTNET || IS_REGTEST ? 1 : 0  // 0 for mainnet, 1 for testnet/regtest

// Derivation paths per network
export const DEFAULT_DERIVATION_PATH = `m/84'/${BIP44_COIN_TYPE}'/0'/0/0`  // Segwit (bech32) 