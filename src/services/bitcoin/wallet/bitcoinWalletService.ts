import * as bitcoin from 'bitcoinjs-lib'
import { validateMnemonic } from './keyManagementService'
import { deriveAddresses } from './addressDerivationService'
import { getDefaultNetwork } from '../network/bitcoinNetworkConfig'
import { seedPhraseService } from './seedPhraseService'

// Development mode detection
const isDevelopment = __DEV__

// Temporary storage for development mode only - DO NOT USE IN PRODUCTION
let _tempSeedPhrase = ''

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
      // In development mode, bypass secure storage if having issues
      if (isDevelopment) {
        try {
          // First try the normal way
          await seedPhraseService.storeSeedPhrase(mnemonic, 'primary_seed')
          console.log('Seed phrase stored successfully with normal method')
        } catch (storageError) {
          console.warn('Secure storage failed, using development mode fallback:', storageError)
          
          // Store in temporary memory (ONLY FOR DEVELOPMENT)
          _tempSeedPhrase = mnemonic
          console.log('Using in-memory storage for development only')
        }
      } else {
        // Production code - must use secure storage
        await seedPhraseService.storeSeedPhrase(mnemonic, 'primary_seed')
      }
      
      // Pre-validate that we can derive addresses before proceeding
      try {
        // First, try just one address to verify everything works
        const testAddress = deriveAddresses(mnemonic, network, 'native_segwit', 0, 1)
        console.log('Test address derivation successful:', testAddress[0].address)
      } catch (derivationTestError) {
        console.error('Address derivation validation failed:', derivationTestError)
        throw new Error('Failed to derive Bitcoin addresses from seed phrase')
      }
      
      // Now derive all addresses needed
      console.log('Deriving addresses for all address types...')
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
      
      console.log('Wallet import successful, addresses generated:', 
        wallet.addresses.nativeSegwit[0])
      
      return wallet
    } catch (error) {
      console.error('Error importing wallet from mnemonic:', error)
      throw new Error(`Failed to import wallet from seed phrase: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
  
  /**
   * Development-only method to get stored seed phrase
   * Should NEVER be used in production
   */
  _devGetStoredPhrase(): string | null {
    if (!isDevelopment) {
      console.error('Attempted to access development-only method in production')
      return null
    }
    return _tempSeedPhrase
  }
}

// Helper to generate a unique wallet ID
const generateWalletId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Export a singleton instance
export const bitcoinWalletService = new BitcoinWalletService() 