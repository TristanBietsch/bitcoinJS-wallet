import { initSentry } from '../logging/sentryService'

export const initializeApp = async () => {
  // Initialize Sentry after splash screen is hidden
  initSentry()
} 