/**
 * Bitcoin Services - Main Export File
 * 
 * This file brings together all Bitcoin-related services and exports them
 * as a unified API. This creates a clean interface for other parts of the
 * application to interact with Bitcoin functionality.
 */

// Re-export network information
import { BITCOIN_NETWORK, IS_REGTEST, IS_TESTNET, IS_MAINNET } from '../../config/bitcoinNetwork'

// Export custom error types
export * from './errors/rpcErrors'

// Export from core RPC client
export { isNodeAvailable } from './rpc/rpcClient'

// Export from address service
export { 
  validateAddress,
  isValidAddress,
  validateAddressOrThrow,
  getNewAddress,
  getBitcoinPaymentURI
} from './address/addressService'

// Export from wallet service
export {
  getBalance,
  listUnspent,
  listTransactions,
  getTransaction,
  getWalletInfo,
  sendToAddress
} from './wallet/walletService'

// Export from blockchain service
export {
  getBlockchainInfo,
  getNetworkInfo,
  getBlock,
  getBlockHash,
  getBlockCount,
  estimateSmartFee,
  getFeeEstimates
} from './blockchain/blockchainService'

// Export regtest-specific functions, but only when in regtest mode
export {
  generateToAddress,
  generateBlocks,
  fundAddress
} from './regtest/regtestService'

// Export network information constants
export {
  BITCOIN_NETWORK,
  IS_REGTEST,
  IS_TESTNET,
  IS_MAINNET
} 