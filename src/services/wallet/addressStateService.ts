import AsyncStorage from '@react-native-async-storage/async-storage'

const NEXT_RECEIVE_ADDRESS_INDEX_KEY = 'walletNextReceiveAddressIndex'
// const NEXT_CHANGE_ADDRESS_INDEX_KEY = 'walletNextChangeAddressIndex' // For future use

/**
 * Retrieves the next available receive address index from AsyncStorage.
 * Defaults to 0 if not found or if an error occurs during parsing.
 * @returns Promise<number> The next receive address index.
 */
export const getNextReceiveAddressIndex = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(NEXT_RECEIVE_ADDRESS_INDEX_KEY)
    if (value !== null) {
      const index = parseInt(value, 10)
      // Return index if it's a valid number, otherwise default to 0
      return isNaN(index) ? 0 : index
    }
    // Default to 0 if no value is stored yet
    return 0
  } catch (error) {
    console.error('Failed to get next receive address index from AsyncStorage:', error)
    // Fallback to 0 in case of an error
    return 0
  }
}

/**
 * Stores the given receive address index in AsyncStorage.
 * This should typically be the (current index + 1).
 * @param index The receive address index to store.
 * @throws Error if storing fails.
 */
export const storeNextReceiveAddressIndex = async (index: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(NEXT_RECEIVE_ADDRESS_INDEX_KEY, index.toString())
    console.log(`Stored next receive address index: ${index}`) // Optional: for development logging
  } catch (error) {
    console.error('Failed to store next receive address index in AsyncStorage:', error)
    throw new Error('Could not store next receive address index.')
  }
}

/**
 * Initializes address indexes in AsyncStorage.
 * Should be called when a new wallet is created or imported.
 * Sets the next receive address index to 0.
 */
export const initializeAddressIndexes = async (): Promise<void> => {
  try {
    await storeNextReceiveAddressIndex(0)
    // await storeNextChangeAddressIndex(0) // For future use with change addresses
    console.log('Address indexes initialized.') // Optional: for development logging
  } catch (error) {
    console.error('Failed to initialize address indexes:', error)
    // Potentially throw to indicate failure, or handle appropriately
    throw new Error('Could not initialize address indexes.')
  }
} 