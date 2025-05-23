import { z } from 'zod'

// --- Esplora API Specific Schemas & Types ---

// Status object found in UTXO and Transaction responses
const EsploraStatusSchema = z.object({
  confirmed    : z.boolean(),
  block_height : z.number().nullable(),
  block_hash   : z.string().nullable(),
  block_time   : z.number().nullable(),
})
export type EsploraStatus = z.infer<typeof EsploraStatusSchema>;

// Schema for a single UTXO from /address/:address/utxo
// This represents an *unspent* output for a given address.
export const EsploraUTXOSchema = z.object({
  txid   : z.string(),
  vout   : z.number().int().nonnegative(),
  status : EsploraStatusSchema, // Confirmed status of the tx creating this UTXO
  value  : z.number().int().positive(), // Value in satoshis
})
export type EsploraUTXO = z.infer<typeof EsploraUTXOSchema>;

// Enhanced UTXO type with address and derivation information for wallet operations
export interface EnhancedUTXO extends EsploraUTXO {
  address: string;           // The address this UTXO belongs to
  derivationPath: string;    // BIP32 derivation path (e.g., "m/84'/1'/0'/0/0")
  addressType: 'legacy' | 'segwit' | 'native_segwit'; // Address type for script generation
  addressIndex: number;      // Index in the derivation path
}

// Schema for the 'prevout' object within a transaction's 'vin' array.
// This describes the output that is being spent by this input.
const EsploraPrevoutSubSchema = z.object({
    scriptpubkey         : z.string(),
    scriptpubkey_asm     : z.string(),
    scriptpubkey_type    : z.string(),
    scriptpubkey_address : z.string().optional(),
    value                : z.number().int().nonnegative(),
})
export type EsploraPrevoutSub = z.infer<typeof EsploraPrevoutSubSchema>;


// Schemas for Transaction Details (vin and vout components)
const EsploraTxVinSchema = z.object({
  txid          : z.string(), // The TXID of the transaction this input is spending from.
  vout          : z.number().int().nonnegative(), // The output index in the transaction specified by txid.
  prevout       : EsploraPrevoutSubSchema.nullable(), // Details of the output being spent. Null for coinbase.
  scriptsig     : z.string().nullable(),
  scriptsig_asm : z.string().nullable(),
  witness       : z.array(z.string()).nullable(),
  is_coinbase   : z.boolean(),
  sequence      : z.number().int(),
})
export type EsploraTxVin = z.infer<typeof EsploraTxVinSchema>;

const EsploraTxVoutSchema = z.object({
  scriptpubkey         : z.string(),
  scriptpubkey_asm     : z.string(),
  scriptpubkey_type    : z.string(),
  scriptpubkey_address : z.string().optional(), // Address might not always be present (e.g. OP_RETURN)
  value                : z.number().int().nonnegative(), // Value in satoshis
})
export type EsploraTxVout = z.infer<typeof EsploraTxVoutSchema>;

// Schema for a single Transaction from /address/:address/txs or /tx/:txid
export const EsploraTransactionSchema = z.object({
  txid     : z.string(),
  version  : z.number().int(),
  locktime : z.number().int(),
  vin      : z.array(EsploraTxVinSchema),
  vout     : z.array(EsploraTxVoutSchema),
  size     : z.number().int(),
  weight   : z.number().int(),
  fee      : z.number().int(), // Fee in satoshis
  status   : EsploraStatusSchema,
})
export type EsploraTransaction = z.infer<typeof EsploraTransactionSchema>;

// Schema for Fee Estimates from /mempool/fees
export const EsploraFeeEstimatesSchema = z.record(z.string(), z.number())
export type EsploraFeeEstimates = z.infer<typeof EsploraFeeEstimatesSchema>;


// --- Application-Specific Types ---

export interface FeeRates {
  slow: number;    // sats/vB
  normal: number;  // sats/vB
  fast: number;    // sats/vB
}

export interface ProcessedTransaction {
  txid: string;
  confirmed: boolean;
  blockHeight?: number | null;
  blockTime?: number | null;
  fee: number;
  netAmount: number; // Net change in wallet balance due to this tx (positive for received, negative for sent)
  direction: 'sent' | 'received' | 'self'; // 'self' for consolidation or sending to own addresses
}

export interface WalletState {
  balance: number;
  utxos: EsploraUTXO[];
  transactions: ProcessedTransaction[];
  lastSyncTimestamp: number | null;
}

export type Network = 'mainnet' | 'testnet'; 