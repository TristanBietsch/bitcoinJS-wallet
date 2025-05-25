import { SEED_PHRASE_WARNINGS, SEED_PHRASE_EDUCATION } from '@/src/constants/securityContent'

/**
 * Get required warnings for seed phrase setup
 * @param includeResponsibility Whether to include the responsibility warning
 * @returns Array of warning objects with id and text
 */
export const getSeedPhraseWarnings = (
  includeResponsibility: boolean = false
) => {
  const warnings = [
    SEED_PHRASE_WARNINGS.OWNERSHIP,
    SEED_PHRASE_WARNINGS.RECOVERY
  ]
  
  if (includeResponsibility) {
    warnings.push(SEED_PHRASE_WARNINGS.RESPONSIBILITY)
  }
  
  return warnings
}

/**
 * Get an object with toggle state IDs initialized to false
 * @param toggleIds Array of toggle IDs
 * @returns Object with toggle IDs as keys and false as values
 */
export const getInitialToggleState = (
  toggleIds: string[]
) => {
  return toggleIds.reduce((acc, id) => {
    acc[id] = false
    return acc
  }, {} as Record<string, boolean>)
}

/**
 * Get seed phrase warnings initial toggle state
 * @param includeResponsibility Whether to include the responsibility warning
 * @returns Object with toggle IDs as keys and false as values
 */
export const getSeedPhraseWarningToggleState = (
  includeResponsibility: boolean = false
) => {
  const warnings = getSeedPhraseWarnings(includeResponsibility)
  return getInitialToggleState(warnings.map(warning => warning.id))
}

/**
 * Format a security tip with proper prefix
 * @param tip The security tip text
 * @param prefix The prefix to add (default: •)
 * @returns Formatted security tip
 */
export const formatSecurityTip = (
  tip: string,
  prefix: string = '•'
) => {
  return `${prefix} ${tip}`
}

/**
 * Get formatted security tips
 * @param prefix The prefix to add to each tip
 * @returns Array of formatted security tips
 */
export const getFormattedSecurityTips = (
  prefix: string = '•'
) => {
  return SEED_PHRASE_EDUCATION.SECURITY_TIPS.map(tip => 
    formatSecurityTip(tip, prefix)
  )
} 