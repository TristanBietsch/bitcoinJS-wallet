/**
 * Security content and messaging for wallet onboarding
 */

export const SEED_PHRASE_WARNINGS = {
  OWNERSHIP : {
    id   : 'ownershipToggle',
    text : "You alone control your bitcoin through your private keys. No one else—including us—can access your funds."
  },
  RECOVERY : {
    id   : 'recoveryToggle',
    text : "If you lose both app access and your backup phrase, your bitcoin is permanently inaccessible to everyone—including you."
  },
  RESPONSIBILITY : {
    id   : 'responsibilityToggle',
    text : "You are solely responsible for keeping your seed phrase secure. Never share it with anyone."
  }
}

export const SEED_PHRASE_PREPARATION = {
  TITLE         : "Prepare for Backup",
  DESCRIPTION   : "We will ask you to write down your seed.",
  SECURITY_TEXT : `Write down your seed phrase on paper. Store it somewhere safe and
  and never share it with anyone. The seed is the only way to recover your
  wallet.`,
  BUTTON_LABEL : "Generate My Seed"
}

export const SEED_PHRASE_TITLES = {
  WARNING  : "Your Keys, Your Bitcoin, Your Responsibility",
  GENERATE : "Backup Your Seed Phrase",
  VERIFY   : "Verify Your Backup",
  SUCCESS  : "Backup Complete",
  ERROR    : "Backup Failed"
}

/**
 * Educational content about seed phrases
 */
export const SEED_PHRASE_EDUCATION = {
  WHAT_IS_SEED : `A seed phrase (or recovery phrase) is a list of words that can be used to recover your bitcoin wallet
  if you lose access to your device.`,
  
  HOW_IT_WORKS : `The words in your seed phrase represent your private keys in a human-readable form.
  These private keys control access to your bitcoin on the blockchain.`,
  
  SECURITY_TIPS : [
    "Write your seed phrase on paper, never digitally",
    "Store in a secure location protected from fire and water damage",
    "Consider making a second backup stored in a different location",
    "Never share your seed phrase with anyone, even Nummus support"
  ]
} 