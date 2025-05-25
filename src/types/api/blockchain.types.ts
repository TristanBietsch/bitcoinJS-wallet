import { z } from 'zod'

const EsploraStatusSchema = z.object({
  confirmed    : z.boolean(),
  block_height : z.number().nullable(),
  block_hash   : z.string().nullable(),
  block_time   : z.number().nullable(),
})
export type EsploraStatus = z.infer<typeof EsploraStatusSchema>;

export const EsploraUTXOSchema = z.object({
  txid   : z.string(),
  vout   : z.number().int().nonnegative(),
  status : EsploraStatusSchema,
  value  : z.number().int().positive(),
})
export type EsploraUTXO = z.infer<typeof EsploraUTXOSchema>;

const EsploraPrevoutSubSchema = z.object({
    scriptpubkey         : z.string(),
    scriptpubkey_asm     : z.string(),
    scriptpubkey_type    : z.string(),
    scriptpubkey_address : z.string().optional(),
    value                : z.number().int().nonnegative(),
})
export type EsploraPrevoutSub = z.infer<typeof EsploraPrevoutSubSchema>;


const EsploraTxVinSchema = z.object({
  txid          : z.string(),
  vout          : z.number().int().nonnegative(),
  prevout       : EsploraPrevoutSubSchema.nullable(),
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
  scriptpubkey_address : z.string().optional(),
  value                : z.number().int().nonnegative(),
})
export type EsploraTxVout = z.infer<typeof EsploraTxVoutSchema>;

export const EsploraTransactionSchema = z.object({
  txid     : z.string(),
  version  : z.number().int(),
  locktime : z.number().int(),
  vin      : z.array(EsploraTxVinSchema),
  vout     : z.array(EsploraTxVoutSchema),
  size     : z.number().int(),
  weight   : z.number().int(),
  fee      : z.number().int(),
  status   : EsploraStatusSchema,
})
export type EsploraTransaction = z.infer<typeof EsploraTransactionSchema>;

export const EsploraFeeEstimatesSchema = z.record(z.string(), z.number())
export type EsploraFeeEstimates = z.infer<typeof EsploraFeeEstimatesSchema>;


export interface FeeRates {
  slow: number;
  normal: number;
  fast: number;
}

export interface ProcessedTransaction {
  txid: string;
  confirmed: boolean;
  blockHeight?: number | null;
  blockTime?: number | null;
  fee: number;
  valueTransacted: number;
  direction: 'sent' | 'received' | 'self';
  isOwnAddress: (address: string) => boolean;
}

export interface WalletState {
  balance: number;
  utxos: EsploraUTXO[];
  transactions: ProcessedTransaction[];
  lastSyncTimestamp: number | null;
}

export type Network = 'mainnet' | 'testnet'; 