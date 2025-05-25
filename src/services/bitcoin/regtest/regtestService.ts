/**
 * Bitcoin Regtest Service
 * 
 * Provides functionality specific to the regtest network
 * such as block generation and faucet capabilities.
 */

import { IS_REGTEST, BITCOIN_NETWORK } from '../../../config/bitcoinNetwork'
import { BitcoinNetworkError } from '../errors/rpcErrors'
import { callRpc } from '../rpc/rpcClient'
import { isValidAddress } from '../address/addressService'

/**
 * Ensure we are on regtest network
 * @throws BitcoinNetworkError if not on regtest
 */
function ensureRegtestNetwork(): void {
  if (!IS_REGTEST) {
    throw new BitcoinNetworkError(
      'This operation is only available in regtest mode', 
      BITCOIN_NETWORK
    )
  }
}

/**
 * Generate blocks (regtest only)
 * @param blocks Number of blocks to generate
 * @param address Address to receive the block rewards
 * @returns Array of block hashes generated
 */
export async function generateToAddress(
  blocks: number,
  address: string
): Promise<string[]> {
  ensureRegtestNetwork()
  
  if (blocks <= 0) {
    throw new Error('Block count must be greater than 0')
  }
  
  if (!(await isValidAddress(address))) {
    throw new Error(`Invalid Bitcoin address: ${address}`)
  }
  
  return callRpc<string[]>('generatetoaddress', [ blocks, address ])
}

/**
 * Generate blocks to a new address controlled by the node
 * @param blocks Number of blocks to generate
 * @returns The generated block hashes
 */
export async function generateBlocks(blocks: number): Promise<string[]> {
  ensureRegtestNetwork()
  
  // First, get a new address from the wallet
  const address = await callRpc<string>('getnewaddress', [])
  
  // Generate blocks to this address
  return generateToAddress(blocks, address)
}

/**
 * Fund an address with a certain amount (useful for testing)
 * @param address The address to fund
 * @param amount Amount in BTC to send
 * @returns The transaction ID
 */
export async function fundAddress(
  address: string, 
  amount: number
): Promise<string> {
  ensureRegtestNetwork()
  
  if (!(await isValidAddress(address))) {
    throw new Error(`Invalid Bitcoin address: ${address}`)
  }
  
  // Send the amount to the specified address
  const txid = await callRpc<string>('sendtoaddress', [ address, amount ])
  
  // Generate a block to confirm the transaction
  await generateBlocks(1)
  
  return txid
} 