/**
 * Toggle a setting and perform any necessary side effects
 * @param setter The state setter function for the setting
 * @param value The new value for the setting
 */
export const toggleSetting = (
  setter: (value: boolean) => void,
  value: boolean
): void => {
  // In the future, this could handle persistence, analytics, or other side effects
  setter(value)
}



import { router } from 'expo-router'

/**
 * Handle recovery phrase display
 * Navigate to the recovery phrase screen
 */
export const handleRecoveryPhrase = (): void => {
  router.push('/main/settings/recovery')
} 