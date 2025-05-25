import * as bitcoin from 'bitcoinjs-lib'

export interface Wallet {
  id: string;
  mnemonic?: string; // Optional, may not be stored in memory for security
  network: bitcoin.networks.Network;
  addresses: {
    legacy: string[];
    segwit: string[];
    nativeSegwit: string[];
  };
  balances: {
    confirmed: number;
    unconfirmed: number;
  };
}

export interface Address {
  address: string;
  path: string;
  index: number;
  type: 'legacy' | 'segwit' | 'native_segwit';
}

export interface Transaction {
  txid: string;
  amount: number;
  confirmations: number;
  timestamp: number;
  type: 'send' | 'receive';
  address: string;
} 