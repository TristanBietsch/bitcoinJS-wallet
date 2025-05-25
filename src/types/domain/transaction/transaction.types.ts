/**
 * Types for transaction-related components and screens
 */

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  date: Date;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed';
  fee?: number;
  memo?: string;
  txid?: string; 
  confirmations?: number;
  
  // Additional UI display fields
  fiatAmount?: string;
  fiatFee?: string;
  fiatTotal?: string;
  total?: number;
  feePriority?: string;
  feeRate?: string;
  confirmationTime?: string;
} 