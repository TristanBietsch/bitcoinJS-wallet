/**
 * Debug utility for testing transaction broadcast
 * Use this to debug specific transaction issues
 */

import { validateTransactionHex, logTransactionAnalysis } from '../bitcoin/transactionValidator'
import { BitcoinAPIClient } from '@/src/services/api/bitcoinClient'

/**
 * Test the failing transaction from the user's report
 */
export async function testFailingTransaction(): Promise<void> {
  const failingTxHex = "02000000000101e48cdc796e5a188ebb8ac4c4e7269da59d44a43b6f7f69d7e5015d22d96f503a0100000000ffffffff0257040000000000001600142cb7c478ce539df5a855507f2fde8697c7a117cdf3e001000000000016001440d9f82a42cdb749600f368b4ba30bb26ca44c1b02483045022100d4c31a82ab3aacbbd1d8d355947cb3cd9a3aeef653803afc9503e0479c74462c0220458cdb257206ff264c49657298faff3e6f09f4fee0e11e637334eb5b5a59427b01210228460ef7db3728c56c4707b321284e41acb8359b34d46d81ee775b3d0d9f8aa500000000"
  
  console.log('🧪 [Debug] Testing failing transaction...')
  console.log('🧪 [Debug] Transaction hex:', failingTxHex)
  
  // Validate the transaction
  const validation = validateTransactionHex(failingTxHex)
  logTransactionAnalysis(failingTxHex)
  
  if (!validation.isValid) {
    console.error('❌ [Debug] Transaction is invalid:', validation.errors)
    return
  }
  
  console.log('✅ [Debug] Transaction passed validation')
  
  // Try to broadcast using the simplified client
  try {
    console.log('📡 [Debug] Attempting broadcast with BitcoinAPIClient...')
    const txid = await BitcoinAPIClient.broadcastTransaction(failingTxHex)
    console.log('✅ [Debug] Broadcast successful:', txid)
  } catch (error) {
    console.error('❌ [Debug] Broadcast failed:', error instanceof Error ? error.message : String(error))
    
    // Try to extract more details from the error
    if (error instanceof Error && 'response' in error) {
      const response = (error as any).response
      console.error('❌ [Debug] HTTP Status:', response?.status)
      console.error('❌ [Debug] Response Data:', response?.data)
    }
  }
}

/**
 * Test broadcast with manual fetch to bypass all our abstractions
 */
export async function testManualBroadcast(): Promise<void> {
  const failingTxHex = "02000000000101e48cdc796e5a188ebb8ac4c4e7269da59d44a43b6f7f69d7e5015d22d96f503a0100000000ffffffff0257040000000000001600142cb7c478ce539df5a855507f2fde8697c7a117cdf3e001000000000016001440d9f82a42cdb749600f368b4ba30bb26ca44c1b02483045022100d4c31a82ab3aacbbd1d8d355947cb3cd9a3aeef653803afc9503e0479c74462c0220458cdb257206ff264c49657298faff3e6f09f4fee0e11e637334eb5b5a59427b01210228460ef7db3728c56c4707b321284e41acb8359b34d46d81ee775b3d0d9f8aa500000000"
  
  const endpoints = [
    'https://mempool.space/testnet/api/tx',
    'https://blockstream.info/testnet/api/tx'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 [Debug] Testing manual broadcast to ${endpoint}`)
      
      const response = await fetch(endpoint, {
        method  : 'POST',
        headers : {
          'Content-Type'   : 'text/plain',
          'Content-Length' : failingTxHex.length.toString(),
          'Accept'         : 'text/plain',
          'User-Agent'     : 'Nummus-Wallet/1.0'
        },
        body : failingTxHex
      })
      
      console.log(`📡 [Debug] Response status: ${response.status}`)
      console.log(`📡 [Debug] Response headers:`, Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log(`📡 [Debug] Response body: ${responseText}`)
      
      if (response.ok) {
        console.log(`✅ [Debug] Manual broadcast successful to ${endpoint}: ${responseText}`)
        return
      } else {
        console.error(`❌ [Debug] Manual broadcast failed to ${endpoint}: ${response.status} ${responseText}`)
      }
      
    } catch (error) {
      console.error(`❌ [Debug] Manual broadcast error to ${endpoint}:`, error instanceof Error ? error.message : String(error))
    }
  }
}

/**
 * Analyze the transaction structure in detail
 */
export function analyzeTransactionStructure(): void {
  const failingTxHex = "02000000000101e48cdc796e5a188ebb8ac4c4e7269da59d44a43b6f7f69d7e5015d22d96f503a0100000000ffffffff0257040000000000001600142cb7c478ce539df5a855507f2fde8697c7a117cdf3e001000000000016001440d9f82a42cdb749600f368b4ba30bb26ca44c1b02483045022100d4c31a82ab3aacbbd1d8d355947cb3cd9a3aeef653803afc9503e0479c74462c0220458cdb257206ff264c49657298faff3e6f09f4fee0e11e637334eb5b5a59427b01210228460ef7db3728c56c4707b321284e41acb8359b34d46d81ee775b3d0d9f8aa500000000"
  
  console.log('🔍 [Debug] Detailed transaction analysis:')
  console.log('Raw hex:', failingTxHex)
  console.log('Length:', failingTxHex.length, 'characters =', failingTxHex.length / 2, 'bytes')
  
  // Parse the transaction manually
  const buffer = Buffer.from(failingTxHex, 'hex')
  let offset = 0
  
  // Version
  const version = buffer.readUInt32LE(offset)
  console.log('Version:', version.toString(16))
  offset += 4
  
  // Segwit marker and flag
  if (buffer[offset] === 0x00 && buffer[offset + 1] === 0x01) {
    console.log('SegWit: YES (marker=0x00, flag=0x01)')
    offset += 2
  } else {
    console.log('SegWit: NO')
  }
  
  // Input count
  const inputCount = buffer[offset]
  console.log('Input count:', inputCount)
  offset += 1
  
  // First input
  const txidBytes = buffer.slice(offset, offset + 32)
  const txid = txidBytes.reverse().toString('hex')
  console.log('Input TXID:', txid)
  offset += 32
  
  const vout = buffer.readUInt32LE(offset)
  console.log('Input VOUT:', vout)
  offset += 4
  
  const scriptSigLen = buffer[offset]
  console.log('ScriptSig length:', scriptSigLen)
  offset += 1 + scriptSigLen
  
  const sequence = buffer.readUInt32LE(offset)
  console.log('Sequence:', sequence.toString(16))
  offset += 4
  
  // Output count
  const outputCount = buffer[offset]
  console.log('Output count:', outputCount)
  offset += 1
  
  // Outputs
  for (let i = 0; i < outputCount; i++) {
    const value = buffer.readBigUInt64LE(offset)
    console.log(`Output ${i} value:`, value.toString(), 'satoshis')
    offset += 8
    
    const scriptPubKeyLen = buffer[offset]
    console.log(`Output ${i} scriptPubKey length:`, scriptPubKeyLen)
    offset += 1
    
    const scriptPubKey = buffer.slice(offset, offset + scriptPubKeyLen)
    console.log(`Output ${i} scriptPubKey:`, scriptPubKey.toString('hex'))
    offset += scriptPubKeyLen
  }
  
  // Witness data (if SegWit)
  if (buffer[4] === 0x00 && buffer[5] === 0x01) {
    console.log('Witness data present')
    // Skip witness parsing for now
  }
  
  // Locktime
  const locktime = buffer.readUInt32LE(buffer.length - 4)
  console.log('Locktime:', locktime)
}