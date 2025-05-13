import * as bitcoin from 'bitcoinjs-lib'
import { validateMnemonic, generateRootKeyFromMnemonic } from './keyManagementService'
import { deriveAddresses } from './addressDerivationService'
import { getDefaultNetwork } from '../network/bitcoinNetworkConfig'
import { seedPhraseService } from './seedPhraseService'

export interface BitcoinWallet {
  id: string;
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

export class BitcoinWalletService {
  /**
   * Import a wallet from a mnemonic phrase
   * @param mnemonic The seed phrase
   * @param network The bitcoin network
   * @returns The wallet object
   */
  async importFromMnemonic(
    mnemonic: string,
    network: bitcoin.networks.Network = getDefaultNetwork()
  ): Promise<BitcoinWallet> {
    // Validate the mnemonic
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid seed phrase')
    }
    
    try {
      // Securely store the seed phrase
      await seedPhraseService.storeSeedPhrase(mnemonic, 'primary_seed')
      
      // Derive addresses
      const legacyAddresses = deriveAddresses(mnemonic, network, 'legacy', 0, 3)
      const segwitAddresses = deriveAddresses(mnemonic, network, 'segwit', 0, 3)
      const nativeSegwitAddresses = deriveAddresses(mnemonic, network, 'native_segwit', 0, 3)
      
      // Create and return the wallet object
      const wallet: BitcoinWallet = {
        id        : generateWalletId(),
        network,
        addresses : {
          legacy       : legacyAddresses.map(addr => addr.address),
          segwit       : segwitAddresses.map(addr => addr.address),
          nativeSegwit : nativeSegwitAddresses.map(addr => addr.address)
        },
        balances : {
          confirmed   : 0,
          unconfirmed : 0
        }
      }
      
      return wallet
    } catch (error) {
      console.error('Error importing wallet from mnemonic:', error)
      throw new Error('Failed to import wallet from seed phrase')
    }
  }
  
  /**
   * Validate a seed phrase
   * @param mnemonic The seed phrase to validate
   * @returns Whether the mnemonic is valid
   */
  validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic)
  }
}

// Helper to generate a unique wallet ID
const generateWalletId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Export a singleton instance
export const bitcoinWalletService = new BitcoinWalletService() 