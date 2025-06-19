/**
 * Encryption Service
 * 
 * Provides military-grade AES-256-GCM encryption for sensitive data like seed phrases.
 * Uses Web Crypto API for proven, audited cryptographic operations.
 * 
 * Security Features:
 * - AES-256-GCM encryption (industry standard)
 * - PBKDF2 key derivation (100,000+ iterations)
 * - Secure random salt generation
 * - Memory wiping after operations
 * - Authenticated encryption with integrity protection
 */

import { Buffer } from 'buffer'

// Types for encryption operations
export interface EncryptedData {
  ciphertext: string      // Base64 encoded encrypted data
  iv: string             // Base64 encoded initialization vector
  salt: string           // Base64 encoded salt for key derivation
  tag: string            // Base64 encoded authentication tag
  iterations: number     // PBKDF2 iterations used
  algorithm: string      // Encryption algorithm identifier
}

export interface EncryptionParams {
  password: string       // User's PIN or password
  data: string          // Data to encrypt (seed phrase)
  iterations?: number   // PBKDF2 iterations (default: 100,000)
}

export interface DecryptionParams {
  password: string       // User's PIN or password
  encryptedData: EncryptedData  // Previously encrypted data
}

/**
 * Encryption Service - Handles all cryptographic operations
 */
export class EncryptionService {
  
  // Security constants
  private static readonly DEFAULT_ITERATIONS = 100000  // PBKDF2 iterations
  private static readonly KEY_LENGTH = 256            // AES-256 key length in bits
  private static readonly IV_LENGTH = 12              // GCM IV length in bytes
  private static readonly SALT_LENGTH = 32           // Salt length in bytes
  private static readonly TAG_LENGTH = 16            // GCM tag length in bytes
  private static readonly ALGORITHM = 'AES-GCM'      // Encryption algorithm
  
  /**
   * Generate cryptographically secure random bytes
   */
  private static generateRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return bytes
  }
  
  /**
   * Convert Uint8Array to Base64 string
   */
  private static bytesToBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64')
  }
  
  /**
   * Convert Base64 string to Uint8Array
   */
  private static base64ToBytes(base64: string): Uint8Array {
    // Create ArrayBuffer-backed Uint8Array for Web Crypto API compatibility
    const buffer = Buffer.from(base64, 'base64')
    const arrayBuffer = new ArrayBuffer(buffer.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    uint8Array.set(buffer)
    return uint8Array
  }
  
  /**
   * Derive encryption key from password using PBKDF2
   */
  private static async deriveKey(
    password: string, 
    salt: Uint8Array, 
    iterations: number = this.DEFAULT_ITERATIONS
  ): Promise<CryptoKey> {
    try {
      // Import password as key material
      const passwordBuffer = new TextEncoder().encode(password)
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        [ 'deriveKey' ]
      )
      
      // Derive AES key using PBKDF2
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name       : 'PBKDF2',
          salt       : salt,
          iterations : iterations,
          hash       : 'SHA-256'
        },
        passwordKey,
        {
          name   : 'AES-GCM',
          length : this.KEY_LENGTH
        },
        false,
        [ 'encrypt', 'decrypt' ]
      )
      
      return derivedKey
    } catch (error) {
      throw new Error(`Key derivation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Securely wipe sensitive data from memory
   */
  private static wipeMemory(data: any): void {
    if (data instanceof Uint8Array) {
      data.fill(0)
    } else if (typeof data === 'string') {
      // Can't directly wipe string in JS, but clear reference
      data = ''
    } else if (data instanceof ArrayBuffer) {
      new Uint8Array(data).fill(0)
    }
  }
  
  /**
   * Encrypt sensitive data (like seed phrases)
   */
  static async encrypt(params: EncryptionParams): Promise<EncryptedData> {
    const { password, data, iterations = this.DEFAULT_ITERATIONS } = params
    
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters')
    }
    
    if (!data || data.trim().length === 0) {
      throw new Error('Data to encrypt cannot be empty')
    }
    
    let salt: Uint8Array | null = null
    let iv: Uint8Array | null = null
    let key: CryptoKey | null = null
    
    try {
      // Generate secure random salt and IV
      salt = this.generateRandomBytes(this.SALT_LENGTH)
      iv = this.generateRandomBytes(this.IV_LENGTH)
      
      // Derive encryption key
      key = await this.deriveKey(password, salt, iterations)
      
      // Convert data to bytes
      const dataBytes = new TextEncoder().encode(data.trim())
      
      // Encrypt data with AES-256-GCM
      const encryptResult = await crypto.subtle.encrypt(
        {
          name      : 'AES-GCM',
          iv        : iv,
          tagLength : this.TAG_LENGTH * 8 // Tag length in bits
        },
        key,
        dataBytes
      )
      
      // Extract ciphertext and authentication tag
      const encryptedBytes = new Uint8Array(encryptResult)
      const ciphertext = encryptedBytes.slice(0, -this.TAG_LENGTH)
      const tag = encryptedBytes.slice(-this.TAG_LENGTH)
      
      // Create encrypted data object
      const encryptedData: EncryptedData = {
        ciphertext : this.bytesToBase64(ciphertext),
        iv         : this.bytesToBase64(iv),
        salt       : this.bytesToBase64(salt),
        tag        : this.bytesToBase64(tag),
        iterations,
        algorithm  : this.ALGORITHM
      }
      
      return encryptedData
      
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // Securely wipe sensitive data from memory
      if (salt) this.wipeMemory(salt)
      if (iv) this.wipeMemory(iv)
      // Note: Can't wipe CryptoKey as it's managed by Web Crypto API
    }
  }
  
  /**
   * Decrypt previously encrypted data
   */
  static async decrypt(params: DecryptionParams): Promise<string> {
    const { password, encryptedData } = params
    
    if (!password) {
      throw new Error('Password is required for decryption')
    }
    
    if (!encryptedData || !encryptedData.ciphertext) {
      throw new Error('Invalid encrypted data provided')
    }
    
    // Validate algorithm
    if (encryptedData.algorithm !== this.ALGORITHM) {
      throw new Error(`Unsupported encryption algorithm: ${encryptedData.algorithm}`)
    }
    
    let salt: Uint8Array | null = null
    let iv: Uint8Array | null = null
    let key: CryptoKey | null = null
    
    try {
      // Convert Base64 strings back to bytes
      salt = this.base64ToBytes(encryptedData.salt)
      iv = this.base64ToBytes(encryptedData.iv)
      const ciphertext = this.base64ToBytes(encryptedData.ciphertext)
      const tag = this.base64ToBytes(encryptedData.tag)
      
      // Derive decryption key
      key = await this.deriveKey(password, salt, encryptedData.iterations)
      
      // Combine ciphertext and tag for GCM decryption
      const encryptedBytes = new Uint8Array(ciphertext.length + tag.length)
      encryptedBytes.set(ciphertext)
      encryptedBytes.set(tag, ciphertext.length)
      
      // Decrypt data
      const decryptedBytes = await crypto.subtle.decrypt(
        {
          name      : 'AES-GCM',
          iv        : iv,
          tagLength : this.TAG_LENGTH * 8
        },
        key,
        encryptedBytes
      )
      
      // Convert decrypted bytes back to string
      const decryptedData = new TextDecoder().decode(decryptedBytes)
      
      return decryptedData
      
    } catch (error) {
      // Authentication failure or wrong password
      if (error instanceof Error && error.name === 'OperationError') {
        throw new Error('Decryption failed: Invalid password or corrupted data')
      }
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // Securely wipe sensitive data from memory
      if (salt) this.wipeMemory(salt)
      if (iv) this.wipeMemory(iv)
    }
  }
  
  /**
   * Validate encrypted data structure
   */
  static validateEncryptedData(data: any): data is EncryptedData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.ciphertext === 'string' &&
      typeof data.iv === 'string' &&
      typeof data.salt === 'string' &&
      typeof data.tag === 'string' &&
      typeof data.iterations === 'number' &&
      typeof data.algorithm === 'string' &&
      data.algorithm === this.ALGORITHM &&
      data.iterations >= 10000 // Minimum security requirement
    )
  }
  
  /**
   * Generate secure random password/PIN
   */
  static generateSecurePin(length: number = 6): string {
    if (length < 4 || length > 12) {
      throw new Error('PIN length must be between 4 and 12 characters')
    }
    
    const digits = '0123456789'
    let pin = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % digits.length
      pin += digits[randomIndex]
    }
    
    return pin
  }
  
  /**
   * Estimate encryption/decryption performance
   */
  static async benchmarkPerformance(testData: string = 'test seed phrase for benchmarking'): Promise<{
    encryptionTime: number
    decryptionTime: number
    memoryUsage: number
  }> {
    const testPassword = 'test123'
    
    // Measure encryption time
    const encryptStart = performance.now()
    const encrypted = await this.encrypt({ password: testPassword, data: testData })
    const encryptEnd = performance.now()
    
    // Measure decryption time
    const decryptStart = performance.now()
    await this.decrypt({ password: testPassword, encryptedData: encrypted })
    const decryptEnd = performance.now()
    
    // Estimate memory usage (rough approximation)
    const estimatedMemory = (
      testData.length * 2 + // Original data + encrypted data
      this.SALT_LENGTH + 
      this.IV_LENGTH + 
      this.TAG_LENGTH
    )
    
    return {
      encryptionTime : encryptEnd - encryptStart,
      decryptionTime : decryptEnd - decryptStart,
      memoryUsage    : estimatedMemory
    }
  }
}

// Export singleton-style static methods as default
export default EncryptionService 