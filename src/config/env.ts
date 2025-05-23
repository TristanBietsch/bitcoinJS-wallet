import * as bitcoin from 'bitcoinjs-lib'
import { Platform } from 'react-native'
import logger, { LogScope } from '@/src/utils/logger'

const ESPLORA_API_MAINNET_URL = "https://blockstream.info/api"
const ESPLORA_API_TESTNET_URL = "https://blockstream.info/testnet/api"

type NetworkType = 'mainnet' | 'testnet';

// Try to get NETWORK from environment, with fallback to testnet
let NETWORK: string = 'testnet'
try {
  // Try to import from @env if available
  const envModule = require('@env')
  NETWORK = envModule.NETWORK || 'testnet'
} catch {
  // If @env is not available, check process.env or use default
  NETWORK = process.env.NETWORK || 'testnet'
  logger.init(`Using fallback network configuration: ${NETWORK}`)
}

let networkEnv: NetworkType = 'testnet'
 
if (NETWORK === 'mainnet') {
  networkEnv = 'mainnet'
} else if (NETWORK === 'testnet') {
  networkEnv = 'testnet'
} else {
  const message = `Invalid NETWORK: "${NETWORK}". Defaulting to testnet`
  if (Platform.OS !== 'web' && process.env.NODE_ENV !== 'test') {
    logger.warn(LogScope.INIT, message)
  }
}

export const CURRENT_NETWORK: NetworkType = networkEnv

export const ESPLORA_API_BASE_URL: string = CURRENT_NETWORK === 'mainnet' ? ESPLORA_API_MAINNET_URL : ESPLORA_API_TESTNET_URL

export const bitcoinjsNetwork: bitcoin.Network = CURRENT_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    logger.init(`Network layer configured for: ${CURRENT_NETWORK.toUpperCase()}`)
    logger.init(`Esplora API URL: ${ESPLORA_API_BASE_URL}`)
}

const ENV = {
  SUPABASE_URL : process.env.SUPABASE_URL || '',
  SUPABASE_KEY : process.env.SUPABASE_KEY || '',
  
  NODE_ENV : process.env.NODE_ENV || 'development',
  
  IS_DEV : __DEV__
}

if (__DEV__) {
  logger.init('Environment configuration loaded')
  logger.init(`- Supabase URL: ${ENV.SUPABASE_URL ? 'Set' : 'Not set'}`)
  logger.init(`- Supabase Key: ${ENV.SUPABASE_KEY ? 'Set' : 'Not set'}`)
  logger.init(`- Is Dev: ${ENV.IS_DEV}`)
}

export default ENV