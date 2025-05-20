import * as bitcoin from 'bitcoinjs-lib'
import { buildTransaction } from '@/src/services/bitcoin/txBuilder'
import type { BuildTransactionParams, NormalizedUTXO, TransactionOutput, TransactionFeeDetails as _TransactionFeeDetails } from '@/src/types/tx.types'
import { ECPairFactory } from 'ecpair'
import * as eccTopLevel from 'tiny-secp256k1'
import { Buffer } from 'buffer'
// import * as ecc from 'tiny-secp256k1'

// --- Mocks Setup ---

// Mock bitcoinjs-lib's Psbt
const mockAddInput = jest.fn()
const mockAddOutput = jest.fn()
const mockPsbtInstance = {
  addInput  : mockAddInput,
  addOutput : mockAddOutput,
  // Add other PSBT methods if they are called and need to be asserted/mocked
}

jest.mock('bitcoinjs-lib', () => {
  const actualBitcoinJsLib = jest.requireActual('bitcoinjs-lib')
  // It's crucial that the top-level bitcoin.initEccLib(eccTopLevel) in the test file
  // correctly initializes the ecc for actualBitcoinJsLib.payments.p2wpkh etc.
  // We are only mocking Psbt here.
  return {
    ...actualBitcoinJsLib,
    Psbt : jest.fn().mockImplementation(() => mockPsbtInstance), // Ensured space before and after colon
    // Ensure other parts like `networks` and `payments` are from actualBitcoinJsLib
    // and that `initEccLib` called at the top of the test file has taken effect for them.
  }
})

// Mock config/env for network
const mockTestnetNetwork = bitcoin.networks.testnet
// const mockProdNetwork = bitcoin.networks.bitcoin // Unused for now
jest.mock('@/src/config/env', () => ({
  __esModule       : true,
  bitcoinjsNetwork : mockTestnetNetwork, // Default to testnet for most tests
  // Add other env vars if txBuilder starts using them
}))

// Mock utils/bitcoin/utils.ts
const mockDUST_THRESHOLD = 546
const mockEstimateTxVirtualBytes = jest.fn()

jest.mock('@/src/utils/bitcoin/utils', () => ({
  __esModule                : true,
  DUST_THRESHOLD            : mockDUST_THRESHOLD,
  estimateTxVirtualBytes    : mockEstimateTxVirtualBytes,
  // getScriptPubKeyForAddress will be used internally by txBuilder, we don't mock it here unless we need to test its specific calls
  // For now, assume its implementation is correct and tested elsewhere, or allow txBuilder to use the actual one.
  getScriptPubKeyForAddress : jest.requireActual('@/src/utils/bitcoin/utils').getScriptPubKeyForAddress 
}))

// Top-level ECC initialization for bitcoinjs-lib and ECPairFactory
bitcoin.initEccLib(eccTopLevel)

const ECPair = ECPairFactory(eccTopLevel)
const dummyKeyPair = ECPair.fromWIF('cPWMF2oKBEj8yYg2q5cR3nFwA6jN9yqB5Y2XQNjH2U7zE1NzG4Pz', mockTestnetNetwork)
const VALID_MOCK_COMPRESSED_PUBKEY = Buffer.from(dummyKeyPair.publicKey)

// --- Test Suite ---
describe('txBuilder', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAddInput.mockClear()
    mockAddOutput.mockClear()
    mockEstimateTxVirtualBytes.mockClear();
    // Cast to unknown first, then to jest.Mock to satisfy TypeScript
    (((bitcoin.Psbt as unknown) as jest.Mock).mockClear())
  })

  const defaultNetwork = mockTestnetNetwork
  const defaultChangeAddress = 'change_address_testnet'
  const defaultFeeRate = 10 // sats/vB

  const createMockUtxo = (value: number, path: string = "m/84'/0'/0'/0/0", txid: string = 'txid_default', vout: number = 0): NormalizedUTXO => ({
    txid,
    vout,
    status    : { confirmed: true, block_height: 1, block_hash: 'dummy', block_time: 123 },
    value,
    path,
    publicKey : VALID_MOCK_COMPRESSED_PUBKEY, // Use the valid mock public key
    // address: 'dummy_address_for_scriptpubkey_if_needed' // Removed as NormalizedUTXO doesn't have it
  })

  const defaultPlaceholderMasterFingerprint = Buffer.from('00000000', 'hex')

  describe('buildTransaction', () => {
    it('should throw error if no inputs are provided', () => {
      const params: BuildTransactionParams = {
        inputs        : [],
        outputs       : [ { address: 'recipient_address', value: 10000 } ],
        feeRate       : defaultFeeRate,
        changeAddress : defaultChangeAddress,
        network       : defaultNetwork,
      }
      expect(() => buildTransaction(params)).toThrow('Transaction must have at least one input.')
    })

    it('should throw error if no outputs are provided', () => {
      const params: BuildTransactionParams = {
        inputs        : [ createMockUtxo(50000) ],
        outputs       : [],
        feeRate       : defaultFeeRate,
        changeAddress : defaultChangeAddress,
        network       : defaultNetwork,
      }
      expect(() => buildTransaction(params)).toThrow('Transaction must have at least one output (recipient).')
    })

    it('should throw error if no change address is provided', () => {
      const params: BuildTransactionParams = {
        inputs        : [ createMockUtxo(50000) ],
        outputs       : [ { address: 'recipient_address', value: 10000 } ],
        feeRate       : defaultFeeRate,
        changeAddress : '', // Empty change address
        network       : defaultNetwork,
      }
      expect(() => buildTransaction(params)).toThrow('Change address is required.')
    })

    it('should construct a simple P2WPKH transaction with change', () => {
      const inputUtxoForSimpleTx = createMockUtxo(100000, "m/84'/0'/0'/0/0")
      const recipientOutput: TransactionOutput = { address: 'recipient_address', value: 60000 }
      // Cast publicKey to any to bypass persistent type error for p2wpkh in test setup
      const expectedInputWitnessUtxoScript = bitcoin.payments.p2wpkh({ pubkey: inputUtxoForSimpleTx.publicKey! as any, network: defaultNetwork }).output!

      // Mock estimated weight: 1 input (68) + 2 outputs (31*2) + overhead (10.5) = 68 + 62 + 10.5 = 140.5 => 141 vBytes
      mockEstimateTxVirtualBytes.mockReturnValue(141)
      const expectedFee = 141 * defaultFeeRate // 1410
      const expectedChangeValue = inputUtxoForSimpleTx.value - recipientOutput.value - expectedFee // 100000 - 60000 - 1410 = 38590

      const params: BuildTransactionParams = {
        inputs        : [ inputUtxoForSimpleTx ],
        outputs       : [ recipientOutput ],
        feeRate       : defaultFeeRate,
        changeAddress : defaultChangeAddress,
        network       : defaultNetwork,
      }

      const { /* _psbt */ feeDetails } = buildTransaction(params)

      expect(bitcoin.Psbt).toHaveBeenCalledWith({ network: defaultNetwork })
      expect(mockAddInput).toHaveBeenCalledTimes(1)
      expect(mockAddInput).toHaveBeenCalledWith(expect.objectContaining({
        hash        : inputUtxoForSimpleTx.txid,
        index       : inputUtxoForSimpleTx.vout,
        witnessUtxo : expect.objectContaining({
          script : expectedInputWitnessUtxoScript,
          value  : inputUtxoForSimpleTx.value,
        }),
        bip32Derivation : expect.arrayContaining([
          expect.objectContaining({
            masterFingerprint : defaultPlaceholderMasterFingerprint,
            path              : inputUtxoForSimpleTx.path!,
            pubkey            : inputUtxoForSimpleTx.publicKey!,
          }),
        ]),
      }))

      expect(mockAddOutput).toHaveBeenCalledTimes(2) // Recipient + Change
      expect(mockAddOutput).toHaveBeenCalledWith({ address: recipientOutput.address, value: recipientOutput.value })
      expect(mockAddOutput).toHaveBeenCalledWith({ address: defaultChangeAddress, value: expectedChangeValue })

      expect(feeDetails.calculatedFee).toBe(expectedFee)
      expect(feeDetails.feeRate).toBe(defaultFeeRate)
      expect(feeDetails.estimatedWeight).toBe(141)
      expect(mockEstimateTxVirtualBytes).toHaveBeenCalledWith(1, 2, 
        expect.arrayContaining([ expect.any(String) ]),
        expect.arrayContaining([ expect.any(String) ])
      )
    })

    it('should throw if output value is below dust threshold', () => {
        const params: BuildTransactionParams = {
            inputs        : [ createMockUtxo(50000) ],
            outputs       : [ { address: 'recipient_address', value: mockDUST_THRESHOLD -1 } ], // Below dust
            feeRate       : defaultFeeRate,
            changeAddress : defaultChangeAddress,
            network       : defaultNetwork,
          }
          mockEstimateTxVirtualBytes.mockReturnValue(100) // Arbitrary weight for fee calc
          expect(() => buildTransaction(params)).toThrow(/^Output value for address .* must be greater than dust threshold/)
    })

    it('should handle insufficient funds correctly', () => {
        const insufficientInput = createMockUtxo(8000)
        const recipientOutput: TransactionOutput = { address: 'recipient_address', value: 8000 }
        mockEstimateTxVirtualBytes.mockReturnValue(141) // Same weight as simple tx
        // Fee would be 1410. Needed = 8000 + 1410 = 9410. Available = 10000. Change = 590 (above dust)
        // Let's make it insufficient: input 8000, output 8000. Fee 1410. Needed 9410.
        const params: BuildTransactionParams = {
            inputs        : [ insufficientInput ],
            outputs       : [ recipientOutput ],
            feeRate       : defaultFeeRate,
            changeAddress : defaultChangeAddress,
            network       : defaultNetwork,
        }
        expect(() => buildTransaction(params)).toThrow(/^Insufficient funds/)
    })

    it('should handle change being dust (no change output, fee is totalIn - totalOut)', () => {
        const inputForDustTest = createMockUtxo(100000)
        const weightWithChange = 141 // Mocked weight if change were added
        const weightWithoutChange = 108 // Mocked weight if no change is added

        mockEstimateTxVirtualBytes.mockImplementation((numInputs, numOutputs) => {
            if (numOutputs === 2) return weightWithChange // For initial calculation (1 input, recipient + change)
            if (numOutputs === 1) return weightWithoutChange // For re-estimation (1 input, recipient only)
            return 100 // Fallback
        })
        
        // Create a scenario where changeValue would be DUST_THRESHOLD - 1 = 545
        // initialCalculatedFee (based on weightWithChange) = 141 * 10 = 1410
        // recipientValue = totalInput - initialFee - (DUST_THRESHOLD - 1)
        // recipientValue = 100000 - 1410 - 545 = 98045
        const recipientValForDustTest = 98045
        const recipientOutput: TransactionOutput = { address: 'recipient_address_dust', value: recipientValForDustTest }
        
        const params: BuildTransactionParams = {
            inputs        : [ inputForDustTest ],
            outputs       : [ recipientOutput ],
            feeRate       : defaultFeeRate,
            changeAddress : defaultChangeAddress,
            network       : defaultNetwork,
        }

        const { /* _psbt */ feeDetails } = buildTransaction(params)

        expect(mockAddOutput).toHaveBeenCalledTimes(1) // Only recipient output should be added
        expect(mockAddOutput).toHaveBeenCalledWith({ address: recipientOutput.address, value: recipientOutput.value })
        
        // Assert that the returned feeDetails reflect no change output
        const expectedActualFeePaid = inputForDustTest.value - recipientValForDustTest // 100000 - 98045 = 1955
        expect(feeDetails.calculatedFee).toBe(expectedActualFeePaid)
        expect(feeDetails.estimatedWeight).toBe(weightWithoutChange) // Should use weight *without* change
        expect(feeDetails.feeRate).toBe(defaultFeeRate)
        expect(mockEstimateTxVirtualBytes).toHaveBeenCalledTimes(2) // Called once for initial, once for re-estimate without change
    })

  })
}) 