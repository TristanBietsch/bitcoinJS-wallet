import CryptoJS from 'crypto-js'
import { Platform } from 'react-native'
import * as Crypto from 'expo-crypto'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Key size in bytes for AES encryption
const KEY_SIZE = 32 // 256 bits
const IV_SIZE = 16  // 128 bits
const ITERATION_COUNT = 10000

// Prefix for storing app keys securely
const APP_KEY_STORAGE_PREFIX = 'nummus_app_key_'

// Generate a random encryption key
export const generateEncryptionKey = async (): Promise<string> => {
  try {
    // Generate random bytes using expo-crypto
    const randomBytes = await Crypto.getRandomBytesAsync(KEY_SIZE)
    // Convert to a hex string for storage
    return Array.from(randomBytes)
      .map((byte: number) => byte.toString(16).padStart(2, '0'))
      .join('')
  } catch (error) {
    console.error('Failed to generate encryption key:', error)
    throw new Error('Encryption key generation failed')
  }
}

// Generate a random initialization vector for AES
export const generateIV = async (): Promise<string> => {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(IV_SIZE)
    return Array.from(randomBytes)
      .map((byte: number) => byte.toString(16).padStart(2, '0'))
      .join('')
  } catch (error) {
    console.error('Failed to generate IV:', error)
    throw new Error('IV generation failed')
  }
}

// Store the current app encryption key
export const storeAppEncryptionKey = async (key: string): Promise<void> => {
  try {
    const keyId = new Date().toISOString()
    await AsyncStorage.setItem(`${APP_KEY_STORAGE_PREFIX}current`, keyId)
    await AsyncStorage.setItem(`${APP_KEY_STORAGE_PREFIX}${keyId}`, key)
  } catch (error) {
    console.error('Failed to store app encryption key:', error)
    throw new Error('Could not store encryption key')
  }
}

// Get the current app encryption key
export const getAppEncryptionKey = async (): Promise<string> => {
  try {
    // Get the current key ID
    const keyId = await AsyncStorage.getItem(`${APP_KEY_STORAGE_PREFIX}current`)
    if (!keyId) {
      // No key found, generate a new one
      const newKey = await generateEncryptionKey()
      await storeAppEncryptionKey(newKey)
      return newKey
    }
    
    // Get the key with the current ID
    const key = await AsyncStorage.getItem(`${APP_KEY_STORAGE_PREFIX}${keyId}`)
    if (!key) {
      throw new Error('Current encryption key not found')
    }
    
    return key
  } catch (error) {
    console.error('Failed to get app encryption key:', error)
    throw new Error('Could not retrieve encryption key')
  }
}

// Rotate encryption keys and re-encrypt all data
export const rotateEncryptionKey = async (): Promise<void> => {
  try {
    // Generate a new key
    const newKey = await generateEncryptionKey()
    
    // We don't need to store the old key since it's retrieved internally by encryption functions
    
    // TODO: Add logic to re-encrypt all sensitive data with the new key
    // This will require enumerating all secure storage keys and re-encrypting
    
    // Store the new key
    await storeAppEncryptionKey(newKey)
    
    console.log('Encryption key rotated successfully')
  } catch (error) {
    console.error('Failed to rotate encryption key:', error)
    throw new Error('Key rotation failed')
  }
}

// Derive a storage key from user identifier and purpose
export const deriveStorageKey = (baseKey: string, purpose: string): string => {
  try {
    // Use PBKDF2 to derive a key
    const salt = CryptoJS.SHA256(purpose).toString()
    const derivedKey = CryptoJS.PBKDF2(baseKey, salt, {
      keySize    : KEY_SIZE / 4, // keySize is in words (4 bytes each)
      iterations : ITERATION_COUNT,
    }).toString()
    
    return `nummus_${CryptoJS.SHA256(derivedKey + purpose).toString().substring(0, 16)}`
  } catch (error) {
    console.error('Failed to derive storage key:', error)
    throw new Error('Key derivation failed')
  }
}

// Encrypt data with the app encryption key
export const encryptData = async (data: string): Promise<string> => {
  try {
    if (!data) return ''
    
    const key = await getAppEncryptionKey()
    const iv = await generateIV()
    
    // Encrypt using AES
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv      : CryptoJS.enc.Hex.parse(iv),
      mode    : CryptoJS.mode.CBC,
      padding : CryptoJS.pad.Pkcs7
    })
    
    // Store the IV with the encrypted data
    return iv + ':' + encrypted.toString()
  } catch (error) {
    console.error('Data encryption failed:', error)
    throw new Error('Could not encrypt data')
  }
}

// Decrypt data with the app encryption key
export const decryptData = async (encryptedData: string): Promise<string> => {
  try {
    if (!encryptedData) return ''
    
    const key = await getAppEncryptionKey()
    
    // Extract the IV from the stored data
    const parts = encryptedData.split(':')
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format')
    }
    
    const iv = parts[0]
    const ciphertext = parts[1]
    
    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv      : CryptoJS.enc.Hex.parse(iv),
      mode    : CryptoJS.mode.CBC,
      padding : CryptoJS.pad.Pkcs7
    })
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Data decryption failed:', error)
    throw new Error('Could not decrypt data')
  }
}

// Web platform specific encryption using Web Crypto API
export const encryptWithWebCrypto = async (data: string): Promise<string> => {
  if (Platform.OS !== 'web' || !data) return ''
  
  try {
    // For web, use the Web Crypto API
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    
    // Get or generate a key
    let key
    const storedKey = localStorage.getItem('nummus_webcrypto_key')
    
    if (!storedKey) {
      // Generate a new key
      key = await window.crypto.subtle.generateKey(
        {
          name   : 'AES-GCM',
          length : 256,
        },
        true, // extractable
        [ 'encrypt', 'decrypt' ]
      )
      
      // Export and store the key
      const exportedKey = await window.crypto.subtle.exportKey('jwk', key)
      localStorage.setItem('nummus_webcrypto_key', JSON.stringify(exportedKey))
    } else {
      // Import the stored key
      const keyData = JSON.parse(storedKey)
      key = await window.crypto.subtle.importKey(
        'jwk',
        keyData,
        {
          name   : 'AES-GCM',
          length : 256,
        },
        true,
        [ 'encrypt', 'decrypt' ]
      )
    }
    
    // Generate a random IV (96 bits for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name : 'AES-GCM',
        iv,
      },
      key,
      dataBuffer
    )
    
    // Convert to Base64 for storage
    const ivString = Array.from(iv)
      .map(b => String.fromCharCode(b))
      .join('')
    
    const encryptedArray = new Uint8Array(encryptedBuffer)
    const encryptedString = Array.from(encryptedArray)
      .map(b => String.fromCharCode(b))
      .join('')
    
    return btoa(ivString + encryptedString)
  } catch (error) {
    console.error('Web Crypto encryption failed:', error)
    
    // Fallback to CryptoJS if Web Crypto fails
    return encryptData(data)
  }
}

// Web platform specific decryption using Web Crypto API
export const decryptWithWebCrypto = async (encryptedData: string): Promise<string> => {
  if (Platform.OS !== 'web' || !encryptedData) return ''
  
  try {
    // Decode Base64
    const decoded = atob(encryptedData)
    
    // Extract IV (first 12 bytes) and ciphertext
    const ivString = decoded.slice(0, 12)
    const encryptedString = decoded.slice(12)
    
    const iv = new Uint8Array(ivString.length)
    for (let i = 0; i < ivString.length; i++) {
      iv[i] = ivString.charCodeAt(i)
    }
    
    const encryptedArray = new Uint8Array(encryptedString.length)
    for (let i = 0; i < encryptedString.length; i++) {
      encryptedArray[i] = encryptedString.charCodeAt(i)
    }
    
    // Get the stored key
    const storedKey = localStorage.getItem('nummus_webcrypto_key')
    if (!storedKey) {
      throw new Error('Encryption key not found')
    }
    
    // Import the key
    const keyData = JSON.parse(storedKey)
    const key = await window.crypto.subtle.importKey(
      'jwk',
      keyData,
      {
        name   : 'AES-GCM',
        length : 256,
      },
      true,
      [ 'encrypt', 'decrypt' ]
    )
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name : 'AES-GCM',
        iv,
      },
      key,
      encryptedArray
    )
    
    // Convert to string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    console.error('Web Crypto decryption failed:', error)
    
    // Fallback to CryptoJS if Web Crypto fails
    return decryptData(encryptedData)
  }
}

// Generate random data for secure deletion
export const generateRandomGarbageData = async (size: number = 1024): Promise<string> => {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(size)
    return Array.from(randomBytes)
      .map((byte: number) => byte.toString(16).padStart(2, '0'))
      .join('')
  } catch (error) {
    console.error('Failed to generate garbage data:', error)
    
    // Fallback to less secure but functional method
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < size; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }
} 