import type { networks as BitcoinJSNetworks } from 'bitcoinjs-lib' // Using 'bitcoinjs-lib' directly
import type { Psbt } from 'bitcoinjs-lib'
import type { EsploraUTXO } from './blockchain.types' // Assuming EsploraUTXO is in a sibling file blockchain.types.ts

/**
 * Represents a UTXO that has been normalized and is ready for use in transaction building.
 * It extends the basic EsploraUTXO with additional properties needed for signing.
 */
export interface NormalizedUTXO extends EsploraUTXO {
  path?: string; // BIP32 derivation path for the UTXO's address (e.g., "m/84'/0'/0'/0/0")
  publicKey?: Buffer; // Public key Buffer associated with the UTXO's address
  // For SegWit inputs, bitcoinjs-lib primarily needs witnessUtxo
  // witnessUtxo: { script: Buffer; value: number }; // This is often part of what you add to PSBT input
  // For non-SegWit inputs, bitcoinjs-lib needs the full previous transaction hex
  // nonWitnessUtxo?: Buffer; 
}

/**
 * Represents a single output in a Bitcoin transaction.
 */
export interface TransactionOutput {
  address: string; // The recipient Bitcoin address
  value: number;   // Amount in satoshis
}

/**
 * Details about the transaction fee.
 */
export interface TransactionFeeDetails {
  feeRate: number;        // Selected fee rate in satoshis per virtual byte (sat/vB)
  estimatedWeight?: number; // Estimated virtual size of the transaction in virtual bytes (vBytes)
  calculatedFee: number;  // Total calculated fee for the transaction in satoshis
}

/**
 * Parameters required to build a Bitcoin transaction.
 */
export interface BuildTransactionParams {
  inputs: NormalizedUTXO[];         // Array of UTXOs to be used as inputs
  outputs: TransactionOutput[];     // Array of outputs (recipient, potentially change)
  feeRate: number;                  // Desired fee rate in sat/vB
  changeAddress: string;            // Address to send any change to
  network: BitcoinJSNetworks.Network; // BitcoinJS network object (mainnet, testnet)
  // Optional: a function to fetch the full hex of a non-witness transaction if needed for legacy inputs
  // getNonWitnessTxHex?: (txid: string) => Promise<string | Buffer>; 
}

/**
 * Parameters required to sign a Bitcoin transaction.
 */
export interface SignTransactionParams {
  psbt: Psbt;                       // The Partially Signed Bitcoin Transaction (PSBT) to be signed
  mnemonic: string;                 // The user's BIP39 mnemonic seed phrase
  network: BitcoinJSNetworks.Network; // BitcoinJS network object
  // Optional: specific input indices to sign if not all, or additional data per input
  // inputsToSignDetails?: Array<{ index: number; path: string; publicKey: Buffer }>;
} 