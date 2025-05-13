import * as bitcoin from 'bitcoinjs-lib'
import { generateRootKeyFromMnemonic, getDerivationPath } from './keyManagementService'

export interface DerivedAddress {
  address: string;
  path: string;
  index: number;
}

/**
 * Derives addresses from a mnemonic
 * @param mnemonic The seed phrase
 * @param network The bitcoin network
 * @param addressType The type of address to derive
 * @param startIndex The starting index
 * @param count How many addresses to derive
 * @returns Array of derived addresses
 */
export const deriveAddresses = (
  mnemonic: string,
  network: bitcoin.networks.Network,
  addressType: 'legacy' | 'segwit' | 'native_segwit' = 'native_segwit',
  startIndex: number = 0,
  count: number = 5
): DerivedAddress[] => {
  try {
    const rootKey = generateRootKeyFromMnemonic(mnemonic, network)
    const basePath = getDerivationPath(addressType)
    const addresses: DerivedAddress[] = []
    
    // BIP44 structure: m/purpose'/coin_type'/account'/change/address_index
    const accountKey = rootKey.derivePath(basePath)
    const externalChainKey = accountKey.derive(0) // 0 for external chain (receiving addresses)
    
    for (let i = startIndex; i < startIndex + count; i++) {
      const keyPair = externalChainKey.derive(i)
      const { address } = getAddressFromKeyPair(keyPair, network, addressType)
      
      addresses.push({
        address,
        path  : `${basePath}/0/${i}`,
        index : i
      })
    }
    
    return addresses
  } catch (error) {
    console.error('Error deriving addresses:', error)
    throw new Error('Failed to derive addresses from wallet')
  }
}

/**
 * Get an address from a key pair based on the address type
 */
const getAddressFromKeyPair = (
  keyPair: any,
  network: bitcoin.networks.Network,
  addressType: 'legacy' | 'segwit' | 'native_segwit'
) => {
  let address: string
  
  if (addressType === 'legacy') {
    // P2PKH address (legacy)
    address = bitcoin.payments.p2pkh({
      pubkey : keyPair.publicKey,
      network
    }).address!
  } else if (addressType === 'segwit') {
    // P2SH-wrapped P2WPKH address (segwit)
    address = bitcoin.payments.p2sh({
      redeem : bitcoin.payments.p2wpkh({
        pubkey : keyPair.publicKey,
        network
      }),
      network
    }).address!
  } else {
    // P2WPKH address (native segwit)
    address = bitcoin.payments.p2wpkh({
      pubkey : keyPair.publicKey,
      network
    }).address!
  }
  
  return { address }
} 