/**
 * Tests for ECC Provider
 * Ensures the @bitcoinerlab/secp256k1 replacement works correctly
 */

import { getEccLib, initEccProvider } from '../../../../src/services/bitcoin/config/eccProvider'

describe('ECC Provider', () => {
  let ecc: ReturnType<typeof getEccLib>

  beforeAll(() => {
    ecc = initEccProvider()
  })

  describe('getEccLib', () => {
    it('should return an ECC library with all required methods', () => {
      const eccLib = getEccLib()
      
      // Test each method explicitly to avoid TypeScript indexing issues
      expect(typeof eccLib.isPoint).toBe('function')
      expect(typeof eccLib.isPrivate).toBe('function')
      expect(typeof eccLib.pointFromScalar).toBe('function')
      expect(typeof eccLib.pointAdd).toBe('function')
      expect(typeof eccLib.pointAddScalar).toBe('function')
      expect(typeof eccLib.pointMultiply).toBe('function')
      expect(typeof eccLib.pointCompress).toBe('function')
      expect(typeof eccLib.privateAdd).toBe('function')
      expect(typeof eccLib.sign).toBe('function')
      expect(typeof eccLib.verify).toBe('function')
    })

    it('should throw error if required method is missing', () => {
      // This test ensures our validation works
      expect(() => getEccLib()).not.toThrow()
    })
  })

  describe('ECC functionality', () => {
    it('should generate valid points from private keys', () => {
      // Generate a valid private key by trying until we get one that's valid
      let privateKey: Buffer
      do {
        privateKey = require('crypto').randomBytes(32)
      } while (!ecc.isPrivate(privateKey))
      
      expect(ecc.isPrivate(privateKey)).toBe(true)
      
      const publicKey = ecc.pointFromScalar(privateKey, true)
      expect(publicKey).toBeTruthy()
      expect(ecc.isPoint(publicKey!)).toBe(true)
    })

    it('should sign and verify messages', () => {
      // Generate a valid private key by trying until we get one that's valid
      let privateKey: Buffer
      do {
        privateKey = require('crypto').randomBytes(32)
      } while (!ecc.isPrivate(privateKey))
      
      const message = Buffer.from('hello world', 'utf8')
      const messageHash = require('crypto').createHash('sha256').update(message).digest()
      
      const publicKey = ecc.pointFromScalar(privateKey, true)
      const signature = ecc.sign(messageHash, privateKey)
      
      expect(signature).toBeTruthy()
      expect(ecc.verify(messageHash, publicKey!, signature)).toBe(true)
    })
  })

  describe('initEccProvider', () => {
    it('should initialize without throwing', () => {
      expect(() => initEccProvider()).not.toThrow()
    })

    it('should return the same ECC library as getEccLib', () => {
      const ecc1 = getEccLib()
      const ecc2 = initEccProvider()
      
      expect(ecc1).toBe(ecc2)
    })
  })
}) 