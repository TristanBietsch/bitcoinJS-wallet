import {
  getUTXOs,
  getTransactionHistory,
  getFeeEstimates,
  broadcastTransaction,
  calculateWalletBalance,
  getTransactionDetails,
} from '@/src/services/bitcoin/blockchain'
import type { FeeRates, EsploraUTXO } from '@/src/types/blockchain.types'
import { z } from 'zod'
import {
  mockEsploraUtxo as importedMockEsploraUtxo,
  mockEsploraTransaction as importedMockEsploraTransaction,
  mockFeeEstimatesRaw as importedMockFeeEstimatesRaw
} from '@/tests/mockData/esploraData'

// This constant is for assertions in tests
const ASSERT_MOCK_ESPLORA_API_BASE_URL = 'https://mock-esplora.com/api/v1/hardcoded'

const mockCurrentNetwork = 'testnet'
const mockBitcoinjsNetwork = require('bitcoinjs-lib').networks.testnet

jest.mock('@/src/config/env', () => {
  console.log('JEST_MOCK: @/src/config/env factory is executing (hardcoded URL).')
  return {
    __esModule           : true, // If env.ts uses ES6 exports
    ESPLORA_API_BASE_URL : 'https://mock-esplora.com/api/v1/hardcoded', // Hardcoded here
    CURRENT_NETWORK      : mockCurrentNetwork,
    bitcoinjsNetwork     : mockBitcoinjsNetwork,
  }
})

// Re-require after mock if needed, or ensure mocks are hoisted
// const { ESPLORA_API_BASE_URL, CURRENT_NETWORK, bitcoinjsNetwork } = require('@/src/config/env');

jest.mock('@/src/utils/network/fetchWithRetry', () => ({
  __esModule      : true, // If fetchWithRetry.ts uses ES6 exports
  fetchWithRetry  : jest.fn(),
  FetchRetryError : class extends Error {
    public data: any
    constructor(message: string, data?: any) {
      super(message)
      this.name = 'FetchRetryError'
      this.data = data
    }
  },
}))

const mockFetchWithRetry = require('@/src/utils/network/fetchWithRetry').fetchWithRetry as jest.Mock
const MockedFetchRetryError = require('@/src/utils/network/fetchWithRetry').FetchRetryError

const mockAddress = 'mockaddress123'
const mockTxId = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'

const expectedFeeRates: FeeRates = {
  fast   : 20.5,
  normal : 10.2,
  slow   : 2.1,
}

describe('Blockchain Service', () => {
  beforeEach(() => {
    mockFetchWithRetry.mockClear()
  })

  describe('getUTXOs', () => {
    it('should fetch and parse UTXOs successfully', async () => {
      mockFetchWithRetry.mockResolvedValueOnce([ importedMockEsploraUtxo ]) 
      const utxos = await getUTXOs(mockAddress)
      expect(mockFetchWithRetry).toHaveBeenCalledWith(`${ASSERT_MOCK_ESPLORA_API_BASE_URL}/address/${mockAddress}/utxo`)
      expect(utxos).toEqual([ importedMockEsploraUtxo ])
    })

    it('should throw if address is not provided', async () => {
      await expect(getUTXOs('')).rejects.toThrow('Address is required to fetch UTXOs')
    })

    it('should re-throw FetchRetryError on API failure', async () => {
      const apiError = new MockedFetchRetryError('API Down', { status: 500, message: 'API Down' })
      mockFetchWithRetry.mockRejectedValueOnce(apiError)
      await expect(getUTXOs(mockAddress)).rejects.toThrow(apiError)
    })

    it('should throw ZodError on invalid data format', async () => {
      const invalidData = [ { ...importedMockEsploraUtxo, value: ('not-a-number' as any) } ]
      mockFetchWithRetry.mockResolvedValueOnce(invalidData)
      await expect(getUTXOs(mockAddress)).rejects.toThrow(z.ZodError)
    })
  })

  describe('getTransactionHistory', () => {
    it('should fetch and parse transaction history successfully', async () => {
      mockFetchWithRetry.mockResolvedValueOnce([ importedMockEsploraTransaction ]) 
      const txs = await getTransactionHistory(mockAddress)
      expect(mockFetchWithRetry).toHaveBeenCalledWith(`${ASSERT_MOCK_ESPLORA_API_BASE_URL}/address/${mockAddress}/txs`)
      expect(txs).toEqual([ importedMockEsploraTransaction ])
    })

    it('should throw if address is not provided', async () => {
        await expect(getTransactionHistory('')).rejects.toThrow('Address is required to fetch transaction history')
    })

    it('should re-throw FetchRetryError on API failure', async () => {
      const apiError = new MockedFetchRetryError('API Error', { message: 'Failed' })
      mockFetchWithRetry.mockRejectedValueOnce(apiError)
      await expect(getTransactionHistory(mockAddress)).rejects.toThrow(apiError)
    })

    it('should throw ZodError on invalid data format', async () => {
      const invalidData = [ { ...importedMockEsploraTransaction, fee: ('not-a-fee' as any) } ]
      mockFetchWithRetry.mockResolvedValueOnce(invalidData)
      await expect(getTransactionHistory(mockAddress)).rejects.toThrow(z.ZodError)
    })
  })

  describe('getFeeEstimates', () => {
    it('should fetch, parse, and transform fee estimates successfully', async () => {
      mockFetchWithRetry.mockResolvedValueOnce(importedMockFeeEstimatesRaw) 
      const feeRates = await getFeeEstimates()
      expect(mockFetchWithRetry).toHaveBeenCalledWith(`${ASSERT_MOCK_ESPLORA_API_BASE_URL}/mempool/fees`)
      expect(feeRates).toEqual(expectedFeeRates)
    })

    it('should return default fee rates if API fails', async () => {
      const apiError = new MockedFetchRetryError('API Error', { message: 'Failed' })
      mockFetchWithRetry.mockRejectedValueOnce(apiError)
      const feeRates = await getFeeEstimates()
      expect(feeRates).toEqual({ fast: 20, normal: 10, slow: 2 })
    })

    it('should use fallback values if specific confirmation targets are missing', async () => {
      const partialFees = { '2': 15, '10': 8, '200': 1 }
      mockFetchWithRetry.mockResolvedValueOnce(partialFees)
      const feeRates = await getFeeEstimates()
      expect(feeRates.fast).toBe(15)
      expect(feeRates.normal).toBe(8)
      expect(feeRates.slow).toBe(1)
    })
    
    it('should return default fee rates for invalid fee data from Esplora', async () => {
      const invalidFeeData = { '1': -5, '6': 0, '144': ('invalid' as any) } 
      mockFetchWithRetry.mockResolvedValueOnce(invalidFeeData)
      const feeRates = await getFeeEstimates()
      expect(feeRates).toEqual({ fast: 20, normal: 10, slow: 2 })
    })
  })

  describe('broadcastTransaction', () => {
    const rawTxHex = '0100000001....txhexdata....00000000'
    it('should broadcast transaction and return txid successfully', async () => {
      mockFetchWithRetry.mockResolvedValueOnce(mockTxId)
      const txid = await broadcastTransaction(rawTxHex)
      expect(mockFetchWithRetry).toHaveBeenCalledWith(`${ASSERT_MOCK_ESPLORA_API_BASE_URL}/tx`, {
        method            : 'POST',
        headers           : { 'Content-Type': 'text/plain' },
        data              : rawTxHex,
        transformResponse : expect.any(Array),
      })
      expect(txid).toBe(mockTxId)
    })

    it('should throw if txHex is not provided', async () => {
        await expect(broadcastTransaction('')).rejects.toThrow('Transaction hex is required to broadcast')
    })

    it('should throw if an invalid txid is returned', async () => {
      mockFetchWithRetry.mockResolvedValueOnce('invalid-txid-format')
      await expect(broadcastTransaction(rawTxHex)).rejects.toThrow('Invalid txid received from Esplora')
    })

    it('should re-throw FetchRetryError on API failure', async () => {
      const apiError = new MockedFetchRetryError('Broadcast failed', { message: 'Error' })
      mockFetchWithRetry.mockRejectedValueOnce(apiError)
      await expect(broadcastTransaction(rawTxHex)).rejects.toThrow(apiError)
    })
  })

  describe('getTransactionDetails', () => {
    it('should fetch and parse transaction details successfully', async () => {
      mockFetchWithRetry.mockResolvedValueOnce(importedMockEsploraTransaction) 
      const tx = await getTransactionDetails(mockTxId)
      expect(mockFetchWithRetry).toHaveBeenCalledWith(`${ASSERT_MOCK_ESPLORA_API_BASE_URL}/tx/${mockTxId}`)
      expect(tx).toEqual(importedMockEsploraTransaction)
    })

    it('should throw if txid is not provided', async () => {
        await expect(getTransactionDetails('')).rejects.toThrow('Transaction ID is required to fetch details')
    })

    it('should re-throw FetchRetryError on API failure', async () => {
      const apiError = new MockedFetchRetryError('API Error', { message: 'Failed' })
      mockFetchWithRetry.mockRejectedValueOnce(apiError)
      await expect(getTransactionDetails(mockTxId)).rejects.toThrow(apiError)
    })

    it('should throw ZodError on invalid data format', async () => {
      const invalidData = { ...importedMockEsploraTransaction, version: ('not-a-version' as any) }
      mockFetchWithRetry.mockResolvedValueOnce(invalidData)
      await expect(getTransactionDetails(mockTxId)).rejects.toThrow(z.ZodError)
    })
  })

  describe('calculateWalletBalance', () => {
    it('should return 0 for an empty UTXO list', () => {
      expect(calculateWalletBalance([])).toBe(0)
    })

    it('should correctly sum values of multiple UTXOs', () => {
      const utxos: EsploraUTXO[] = [
        { ...importedMockEsploraUtxo, value: 100 },
        { ...importedMockEsploraUtxo, txid: 'txid2', value: 200 },
        { ...importedMockEsploraUtxo, txid: 'txid3', value: 300 },
      ]
      expect(calculateWalletBalance(utxos)).toBe(600)
    })

    it('should handle UTXOs with zero value', () => {
      const utxos: EsploraUTXO[] = [
        { ...importedMockEsploraUtxo, value: 100 },
        { ...importedMockEsploraUtxo, txid: 'txid2', value: 0 },
        { ...importedMockEsploraUtxo, txid: 'txid3', value: 50 },
      ]
      expect(calculateWalletBalance(utxos)).toBe(150)
    })
  })
}) 