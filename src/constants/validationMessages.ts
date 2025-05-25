/**
 * Validation error messages used throughout the application
 * These messages provide user-friendly feedback for various validation errors
 */

export const validationMessages = {
  // Seed phrase validation
  seedPhrase : {
    empty                     : 'Please enter your seed phrase.',
    invalidLength             : 'Seed phrase must contain 12, 15, 18, 21, or 24 words.',
    invalidWord               : 'Contains invalid word(s). Please check your seed phrase.',
    invalidWordWithSuggestion : (word: string, suggestion: string) => 
      `"${word}" is not a valid word. Did you mean "${suggestion}"?`,
    invalidChecksum    : 'Invalid seed phrase. The words don\'t form a valid seed phrase.',
    generalError       : 'Invalid seed phrase. Please check your words and try again.',
    notBIP39Compatible : 'This seed phrase is not BIP-39 compatible.',
    incorrectWordCount : (count: number) => 
      `Found ${count} word(s). Seed phrase must contain 12, 15, 18, 21, or 24 words.`,
  },
  
  // Address validation
  address : {
    empty              : 'Please enter a Bitcoin address.',
    invalidFormat      : 'Invalid Bitcoin address format.',
    unsupportedNetwork : 'Address belongs to an unsupported network.',
    invalidChecksum    : 'Invalid address checksum. Please check for typos.',
    wrongAddressType   : 'Incorrect address type for this transaction.',
  },
  
  // Amount validation
  amount : {
    empty             : 'Please enter an amount.',
    invalid           : 'Please enter a valid amount.',
    exceedsBalance    : 'Amount exceeds your available balance.',
    belowMinimum      : 'Amount is below minimum required for a transaction.',
    insufficientFunds : 'Insufficient funds to cover amount plus network fee.',
    zero              : 'Amount must be greater than zero.',
  },
  
  // Transaction validation
  transaction : {
    invalidFee       : 'Invalid fee rate.',
    feeExceedsAmount : 'Fee exceeds transaction amount.',
    noOutputs        : 'Transaction must have at least one output.',
    noInputs         : 'No available inputs for this transaction.',
    tooManyInputs    : 'Transaction has too many inputs.',
    tooManyOutputs   : 'Transaction has too many outputs.',
    dustOutput       : 'Output amount is too small (dust output).',
  },
  
  // Password/passphrase validation
  password : {
    empty         : 'Please enter a password.',
    tooShort      : 'Password must be at least 8 characters long.',
    noUppercase   : 'Password must include at least one uppercase letter.',
    noLowercase   : 'Password must include at least one lowercase letter.',
    noNumber      : 'Password must include at least one number.',
    noSpecialChar : 'Password must include at least one special character.',
    mismatch      : 'Passwords do not match.',
    incorrect     : 'Incorrect password. Please try again.',
  },
  
  // Input validation
  input : {
    required             : 'This field is required.',
    invalidFormat        : 'Invalid format.',
    tooLong              : 'Input exceeds maximum length.',
    tooShort             : 'Input is too short.',
    containsInvalidChars : 'Input contains invalid characters.',
  },
  
  // Network validation
  network : {
    offline  : 'You appear to be offline. Please check your connection.',
    apiError : 'Error communicating with server. Please try again later.',
    timeout  : 'Request timed out. Please try again.',
  },
  
  // Import/Export validation
  importExport : {
    invalidFormat       : 'Invalid file format.',
    corruptedFile       : 'File appears to be corrupted or invalid.',
    incompatibleVersion : 'Incompatible wallet version.',
    walletAlreadyExists : 'A wallet with this name already exists.',
    walletNotFound      : 'Wallet not found.',
  }
}

// Enhance normalizeMnemonic to remove special characters
export function normalizeMnemonic(mnemonic: string): string {
  return mnemonic
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove non-alphabetic chars except spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
} 