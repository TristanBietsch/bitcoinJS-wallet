import { loggingService } from '../logging/sentryService'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

/**
 * Application initialization service
 * Handles startup tasks like initializing logging, loading preferences, etc.
 */
export const appService = {
  /**
   * Initialize all required app services 
   */
  initialize : async (options?: {
    enableLogging?: boolean;
    sentryDsn?: string;
  }): Promise<boolean> => {
    try {
      // Get app environment/build info
      const extra = Constants?.expoConfig?.extra || {}
      const buildEnv = extra.nodeEnv || process.env.NODE_ENV || 'development'
      const appVersion = Constants?.expoConfig?.version || '0.0.0'
      
      // Initialize logging with app info
      const initOptions = {
        dsn              : options?.sentryDsn,
        environment      : buildEnv,
        debug            : options?.enableLogging || false,
        tracesSampleRate : buildEnv === 'production' ? 0.2 : 1.0
      }
      loggingService.initialize(initOptions)
      
      // Log app startup
      loggingService.logMessage(
        `App initializing: ${appVersion} (${buildEnv}) on ${Platform.OS}`,
        'info',
        { forceLog: true }
      )
      
      // TODO: Add other initialization tasks here
      // e.g., load user preferences, initialize APIs, etc.
      
      return true
    } catch (error) {
      console.error('Failed to initialize app:', error)
      return false
    }
  },
  
  /**
   * Clean up app resources on shutdown
   */
  cleanup : async (): Promise<void> => {
    // Perform any cleanup tasks here
    loggingService.logMessage('App shutting down', 'info')
  }
} 