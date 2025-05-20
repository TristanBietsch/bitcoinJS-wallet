import * as bitcoin from 'bitcoinjs-lib'
import { Platform } from 'react-native'

import { NETWORK } from '@env'

const ESPLORA_API_MAINNET_URL = "https://blockstream.info/api"
const ESPLORA_API_TESTNET_URL = "https://blockstream.info/testnet/api"

type NetworkType = 'mainnet' | 'testnet';

let networkEnv: NetworkType = 'testnet'
 
if (NETWORK === 'mainnet') {
  networkEnv = 'mainnet'
} else if (NETWORK === 'testnet') {
  networkEnv = 'testnet'
} else {
  const message = `Missing or invalid NETWORK environment variable. Found: "${NETWORK}". Defaulting to 'testnet'. Supported values: 'mainnet', 'testnet'.`
  if (Platform.OS !== 'web' && process.env.NODE_ENV !== 'test') {
    console.warn(message)
  }
}

export const CURRENT_NETWORK: NetworkType = networkEnv

export const ESPLORA_API_BASE_URL: string = CURRENT_NETWORK === 'mainnet' ? ESPLORA_API_MAINNET_URL : ESPLORA_API_TESTNET_URL

export const bitcoinjsNetwork: bitcoin.Network = CURRENT_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log(`Network layer configured for: ${CURRENT_NETWORK.toUpperCase()}`)
    console.log(`Esplora API URL: ${ESPLORA_API_BASE_URL}`)
}

const ENV = {
  SUPABASE_URL : process.env.SUPABASE_URL || '',
  SUPABASE_KEY : process.env.SUPABASE_KEY || '',
  
  NODE_ENV : process.env.NODE_ENV || 'development',
  
  IS_DEV : __DEV__
}

if (__DEV__) {
  console.log('Environment configuration loaded')
  console.log(`- Supabase URL: ${ENV.SUPABASE_URL ? 'Set' : 'Not set'}`)
  console.log(`- Supabase Key: ${ENV.SUPABASE_KEY ? 'Set (hidden)' : 'Not set'}`)
  console.log(`- Is Dev: ${ENV.IS_DEV}`)
}

export default ENV