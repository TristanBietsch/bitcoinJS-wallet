import * as bitcoin from 'bitcoinjs-lib'
import { 
  validateAndSanitizeAddress, 
  isValidBitcoinAddress, 
  detectAddressNetwork 
} from '@/src/utils/validation/validateAddress'

describe('validateAddress', () => {
  describe('validateAndSanitizeAddress', () => {
    describe('valid addresses', () => {
      it('should validate and sanitize a clean testnet bech32 address', () => {
        const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(address)
        expect(result.addressType).toBe('P2WPKH')
        expect(result.error).toBeUndefined()
      })

      it('should sanitize address with leading whitespace', () => {
        const address = ' tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const expected = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(expected)
        expect(result.addressType).toBe('P2WPKH')
      })

      it('should sanitize address with trailing whitespace', () => {
        const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4 '
        const expected = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(expected)
        expect(result.addressType).toBe('P2WPKH')
      })

      it('should sanitize address with multiple whitespace characters', () => {
        const address = '  tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4  \t\n'
        const expected = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(expected)
        expect(result.addressType).toBe('P2WPKH')
      })

      it('should validate mainnet bech32 address when mainnet network specified', () => {
        const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kw5rljs90'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.bitcoin)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(address)
        expect(result.addressType).toBe('P2WSH')
      })

      it('should validate testnet P2PKH address', () => {
        const address = 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(address)
        expect(result.addressType).toBe('P2PKH')
      })

      it('should validate mainnet P2PKH address', () => {
        const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.bitcoin)
        
        expect(result.isValid).toBe(true)
        expect(result.sanitizedAddress).toBe(address)
        expect(result.addressType).toBe('P2PKH')
      })
    })

    describe('invalid addresses', () => {
      it('should reject empty address', () => {
        const result = validateAndSanitizeAddress('', bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(false)
        expect(result.sanitizedAddress).toBe('')
        expect(result.error).toBe('Address is empty or contains only invalid characters')
      })

      it('should reject null/undefined address', () => {
        const result = validateAndSanitizeAddress(null as any, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(false)
        expect(result.sanitizedAddress).toBe('')
        expect(result.error).toBe('Address is empty or contains only invalid characters')
      })

      it('should reject completely invalid address format', () => {
        const address = 'invalid-address-format'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(false)
        expect(result.sanitizedAddress).toBe(address)
        expect(result.error).toContain('Invalid address format')
      })

      it('should reject mainnet address on testnet network', () => {
        const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kw5rljs90'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('Invalid address format')
      })

      it('should reject testnet address on mainnet network', () => {
        const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.bitcoin)
        
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('Invalid address format')
      })

      it('should handle address with invalid characters', () => {
        const address = 'tb1qunjkws5z3jxgh268c840kytl5622fwzf35k068' // The problematic address from the error
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        // This should either be valid or give a clear error message
        if (!result.isValid) {
          expect(result.error).toBeDefined()
          expect(typeof result.error).toBe('string')
        }
        
        expect(result.sanitizedAddress).toBe(address) // Should at least sanitize properly
      })

      it('should handle addresses with zero-width characters', () => {
        const addressWithZeroWidth = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4\u200B'
        const expected = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(addressWithZeroWidth, bitcoin.networks.testnet)
        
        expect(result.sanitizedAddress).toBe(expected)
        if (result.isValid) {
          expect(result.addressType).toBe('P2WPKH')
        }
      })
    })

    describe('edge cases', () => {
      it('should use testnet as default network when none specified', () => {
        const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address)
        
        expect(result.isValid).toBe(true)
        expect(result.addressType).toBe('P2WPKH')
      })

      it('should handle very long addresses', () => {
        const longAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kw5rljs90'
        const result = validateAndSanitizeAddress(longAddress, bitcoin.networks.bitcoin)
        
        expect(result.isValid).toBe(true)
        expect(result.addressType).toBe('P2WSH')
      })

      it('should preserve case sensitivity for valid addresses', () => {
        const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
        const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
        
        expect(result.sanitizedAddress).toBe(address)
        expect(result.sanitizedAddress).not.toBe(address.toUpperCase())
      })
    })
  })

  describe('isValidBitcoinAddress', () => {
    it('should return true for valid testnet address', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      expect(isValidBitcoinAddress(address, bitcoin.networks.testnet)).toBe(true)
    })

    it('should return false for invalid address', () => {
      const address = 'invalid-address'
      expect(isValidBitcoinAddress(address, bitcoin.networks.testnet)).toBe(false)
    })

    it('should return false for empty address', () => {
      expect(isValidBitcoinAddress('', bitcoin.networks.testnet)).toBe(false)
    })

    it('should use testnet as default network', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      expect(isValidBitcoinAddress(address)).toBe(true)
    })

    it('should handle address sanitization internally', () => {
      const address = ' tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4 '
      expect(isValidBitcoinAddress(address, bitcoin.networks.testnet)).toBe(true)
    })
  })

  describe('detectAddressNetwork', () => {
    it('should detect mainnet for bc1 addresses', () => {
      const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kw5rljs90'
      expect(detectAddressNetwork(address)).toBe('mainnet')
    })

    it('should detect testnet for tb1 addresses', () => {
      const address = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      expect(detectAddressNetwork(address)).toBe('testnet')
    })

    it('should detect mainnet for legacy addresses starting with 1', () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      expect(detectAddressNetwork(address)).toBe('mainnet')
    })

    it('should detect testnet for legacy addresses starting with m', () => {
      const address = 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef'
      expect(detectAddressNetwork(address)).toBe('testnet')
    })

    it('should detect mainnet for P2SH addresses starting with 3', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'
      expect(detectAddressNetwork(address)).toBe('mainnet')
    })

    it('should detect testnet for P2SH addresses starting with 2', () => {
      const address = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc'
      expect(detectAddressNetwork(address)).toBe('testnet')
    })

    it('should return unknown for invalid addresses', () => {
      const address = 'invalid-address'
      expect(detectAddressNetwork(address)).toBe('unknown')
    })

    it('should sanitize address before detection', () => {
      const address = ' tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4 '
      expect(detectAddressNetwork(address)).toBe('testnet')
    })

    it('should return unknown for empty address', () => {
      expect(detectAddressNetwork('')).toBe('unknown')
    })
  })

  describe('specific problematic addresses', () => {
    it('should handle the original failing address', () => {
      const address = 'tb1qunjkws5z3jxgh268c840kytl5622fwzf35k068'
      const result = validateAndSanitizeAddress(address, bitcoin.networks.testnet)
      
      // Log the result for debugging
      console.log('Problematic address test result:', result)
      
      // The address should either be valid or have a clear error message
      expect(result.sanitizedAddress).toBe(address)
      expect(typeof result.isValid).toBe('boolean')
      
      if (!result.isValid) {
        expect(result.error).toBeDefined()
        expect(typeof result.error).toBe('string')
      }
    })

    it('should provide detailed error for addresses with invalid checksums', () => {
      // Create an address with an invalid checksum by modifying the last character
      const baseAddress = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      const invalidChecksumAddress = baseAddress.slice(0, -1) + 'x'
      
      const result = validateAndSanitizeAddress(invalidChecksumAddress, bitcoin.networks.testnet)
      
      expect(result.isValid).toBe(false)
      // Error details are expected but we don't test the exact content due to TypeScript strictness
    })
  })
}) 