import * as bitcoin from 'bitcoinjs-lib'

export type BitcoinNetwork = 'mainnet' | 'testnet' | 'signet' | 'regtest';

export const getNetwork = (networkType: BitcoinNetwork): bitcoin.networks.Network => {
  switch (networkType) {
    case 'mainnet':
      return bitcoin.networks.bitcoin
    case 'testnet':
      return bitcoin.networks.testnet
    case 'signet':
      return {
        ...bitcoin.networks.testnet,
        bip32 : {
          public  : 0x043587cf,
          private : 0x04358394
        }
      }
    case 'regtest':
      return bitcoin.networks.regtest
    default:
      return bitcoin.networks.testnet
  }
}

// Default network for the app
export const getDefaultNetwork = (): bitcoin.networks.Network => {
  // Use signet for development as specified in requirements
  return getNetwork('signet')
} 