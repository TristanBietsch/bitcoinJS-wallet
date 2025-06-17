import * as SecureStore from 'expo-secure-store'

const MNEMONIC_KEY = 'walletMnemonic'

/**
 * Saves the mnemonic phrase to secure storage.
 * @param mnemonic The mnemonic phrase to save.
 * @throws Error if saving fails.
 */
export const saveMnemonic = async (mnemonic: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic)
    console.log('Mnemonic saved securely.') // Optional: for development logging
  } catch (error) {
    console.error('Failed to save mnemonic securely:', error)
    // Consider using a custom error type or logging more details
    throw new Error('Could not save wallet mnemonic.')
  }
}

/**
 * Retrieves the mnemonic phrase from secure storage.
 * @returns The mnemonic phrase if found, otherwise null.
 * @throws Error if retrieval fails.
 */
export const retrieveMnemonic = async (): Promise<string | null> => {
  try {
    const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY)
    if (mnemonic) {
      console.log('Mnemonic retrieved securely.') // Optional: for development logging
    } else {
      console.log('No mnemonic found in secure storage.') // Optional: for development logging
    }
    return mnemonic
  } catch (error) {
    console.error('Failed to retrieve mnemonic securely:', error)
    throw new Error('Could not retrieve wallet mnemonic.')
  }
}

/**
 * Deletes the mnemonic phrase from secure storage.
 * @throws Error if deletion fails.
 */
export const deleteMnemonic = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(MNEMONIC_KEY)
    console.log('Mnemonic deleted from secure storage.') // Optional: for development logging
  } catch (error) {
    console.error('Failed to delete mnemonic securely:', error)
    throw new Error('Could not delete wallet mnemonic.')
  }
}

/**
 * Checks if a mnemonic phrase is currently stored.
 * @returns True if a mnemonic is stored, otherwise false.
 * @throws Error if the check fails (optional, could also return false on error).
 */
export const hasMnemonic = async (): Promise<boolean> => {
  try {
    const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY)
    return !!mnemonic
  } catch (error) {
    console.error('Failed to check for mnemonic existence:', error)
    // Depending on desired behavior, you might re-throw or return false
    // For now, let's re-throw to make calling code aware of issues.
    throw new Error('Could not check for wallet mnemonic existence.')
  }
} 