import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_COMPLETE_KEY = '@nummus_wallet_onboarding_complete'

export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
  } catch (error) {
    console.error('Error saving onboarding status:', error)
  }
}

export const isOnboardingComplete = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
    return value === 'true'
  } catch (error) {
    console.error('Error reading onboarding status:', error)
    return false
  }
}

export const resetOnboardingStatus = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY)
  } catch (error) {
    console.error('Error resetting onboarding status:', error)
  }
} 