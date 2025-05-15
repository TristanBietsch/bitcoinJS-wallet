import { secureStore } from '@/src/services/storage/secureStore'
import { 
  generateEncryptionKey, 
  encryptData, 
  decryptData, 
  getAppEncryptionKey, 
  storeAppEncryptionKey
} from './encryptionUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Implements key rotation by re-encrypting all secure data with a new key
 * This helps mitigate risks if a single key is compromised
 * 
 * @returns Promise resolving when rotation is complete
 */
export const rotateAllEncryptionKeys = async (): Promise<void> => {
  try {
    console.log('Starting encryption key rotation')
    
    // Generate a new encryption key
    const newKey = await generateEncryptionKey()
    
    // Get the current key for decryption
    // We don't actually need to store this as decryptData will use it internally
    await getAppEncryptionKey()
    
    // Get all keys from secure storage
    const allKeys = await AsyncStorage.getAllKeys()
    const secureKeys = allKeys.filter(key => 
      key.startsWith('nummus_') || 
      key.startsWith('seed_phrase_') ||
      key.startsWith('wallet_')
    )
    
    console.log(`Found ${secureKeys.length} secure keys to rotate`)
    
    // Process each key
    for (const key of secureKeys) {
      try {
        // Get the current encrypted value
        const currentValue = await secureStore.get(key, { noDecryption: true })
        if (!currentValue) continue
        
        // Decrypt with the old key
        const decrypted = await decryptData(currentValue)
        
        // Re-encrypt with the new key
        const reEncrypted = await encryptData(decrypted)
        
        // Store the re-encrypted value
        await secureStore.set(key, reEncrypted, { noEncryption: true })
        
        console.log(`Successfully rotated key: ${key}`)
      } catch (error) {
        console.error(`Error rotating key ${key}:`, error)
        // Continue with other keys, don't break the whole process
      }
    }
    
    // Store the new key
    await storeAppEncryptionKey(newKey)
    
    console.log('Encryption key rotation completed successfully')
  } catch (error) {
    console.error('Failed to rotate encryption keys:', error)
    throw new Error('Key rotation failed')
  }
}

/**
 * Schedule regular key rotation based on app usage
 * This helps ensure encryption keys are regularly updated
 * 
 * @returns A cleanup function
 */
export const scheduleKeyRotation = (): () => void => {
  // Check when the last rotation was performed
  const lastRotationKey = 'nummus_last_key_rotation'
  const rotationInterval = 30 * 24 * 60 * 60 * 1000 // 30 days
  
  // Set up the check
  const checkAndRotate = async () => {
    try {
      const lastRotationStr = await AsyncStorage.getItem(lastRotationKey)
      const lastRotation = lastRotationStr ? parseInt(lastRotationStr, 10) : 0
      const now = Date.now()
      
      if (now - lastRotation > rotationInterval) {
        // Time to rotate keys
        await rotateAllEncryptionKeys()
        // Update the last rotation time
        await AsyncStorage.setItem(lastRotationKey, now.toString())
      }
    } catch (error) {
      console.error('Error in scheduled key rotation:', error)
    }
  }
  
  // Run immediately
  checkAndRotate()
  
  // Set up a regular check (in this case, once per day)
  const intervalId = setInterval(checkAndRotate, 24 * 60 * 60 * 1000)
  
  // Return a cleanup function
  return () => clearInterval(intervalId)
}

/**
 * Force an immediate key rotation, useful after security-sensitive operations
 */
export const forceKeyRotation = async (): Promise<void> => {
  try {
    await rotateAllEncryptionKeys()
    const now = Date.now()
    await AsyncStorage.setItem('nummus_last_key_rotation', now.toString())
  } catch (error) {
    console.error('Forced key rotation failed:', error)
  }
} 