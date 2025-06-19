/**
 * Security Type Definitions (Testnet Ready)
 * 
 * Type definitions for encryption operations and security services.
 * PIN functionality removed for testnet launch.
 */

// Encryption Service Types (Ready for future use)
export interface EncryptedData {
  ciphertext: string      // Base64 encoded encrypted data
  iv: string             // Base64 encoded initialization vector
  salt: string           // Base64 encoded salt for key derivation
  tag: string            // Base64 encoded authentication tag
  iterations: number     // PBKDF2 iterations used
  algorithm: string      // Encryption algorithm identifier
}

export interface EncryptionParams {
  password: string       // User's password or key
  data: string          // Data to encrypt (seed phrase)
  iterations?: number   // PBKDF2 iterations (default: 100,000)
}

export interface DecryptionParams {
  password: string       // User's password or key
  encryptedData: EncryptedData  // Previously encrypted data
}

// Secure Memory Types
export interface SecureSession<T> {
  id: string
  data: T | null
  createdAt: number
  lastAccessed: number
  expiresAt: number
  isLocked: boolean
}

export interface SecureSessionOptions {
  timeoutMs?: number        // Auto-clear timeout (default: 5 minutes)
  maxIdleMs?: number       // Max idle time before clear (default: 2 minutes)
  autoLock?: boolean       // Auto-lock when idle (default: true)
  wipeOnAccess?: boolean   // Wipe data after each access (default: false)
}

// Security Audit Types
export interface SecurityAuditLog {
  timestamp: number
  operation: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  details: string
}

export interface SecurityStatus {
  hasStoredSeed: boolean
  activeSessions: number
  lastAuditEvent: SecurityAuditLog | null
  isTestnetMode: boolean
}

// Storage Metadata Types
export interface StorageMetadata {
  version: string
  stored: number
  encrypted: boolean
  testnetMode: boolean
}

// All types are already exported via their interface declarations above 