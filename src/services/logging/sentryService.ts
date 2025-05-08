import * as Sentry from '@sentry/react-native'

// Logging level type
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal'

// User context type
export interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: string | undefined;
}

/**
 * Centralized logging service using Sentry
 */
export const loggingService = {
  /**
   * Initialize Sentry for error tracking
   * Should be called early in the app lifecycle
   * @param options Optional configuration options
   */
  initialize : (options?: {
    dsn?: string;
    environment?: string;
    debug?: boolean;
    tracesSampleRate?: number;
  }) => {
    // Don't initialize in development unless explicitly requested
    const isDev = __DEV__
    if (isDev && !options?.debug) {
      console.log('Sentry initialization skipped in development mode')
      return false
    }

    try {
      Sentry.init({
        dsn              : options?.dsn || 'YOUR_DSN_HERE', // Replace with your actual DSN
        environment      : options?.environment || (isDev ? 'development' : 'production'),
        debug            : options?.debug || false,
        tracesSampleRate : options?.tracesSampleRate || 1.0,
        beforeSend(event) {
          // Skip sending events in development
          if (isDev && !options?.debug) {
            return null
          }
          return event
        },
      })
      return true
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
      return false
    }
  },

  /**
   * Log an error to Sentry with additional context
   * @param error Error object to log
   * @param context Additional context data
   */
  logError : (error: Error, context?: Record<string, any>) => {
    if (!__DEV__ || context?.forceLog) {
      Sentry.captureException(error, {
        extra : context
      })
    }
    
    // Always log to console in development
    if (__DEV__) {
      console.error(error, context)
    }
  },

  /**
   * Log a message to Sentry
   * @param message Message to log
   * @param level Severity level
   * @param context Additional context data
   */
  logMessage : (
    message: string, 
    level: LogLevel = 'info',
    context?: Record<string, any>
  ) => {
    if (!__DEV__ || context?.forceLog) {
      Sentry.captureMessage(message, {
        level : level as Sentry.SeverityLevel
      })
    }
    
    // Always log to console in development
    if (__DEV__) {
      switch (level) {
        case 'debug':
          console.debug(message, context)
          break
        case 'info':
          console.info(message, context)
          break
        case 'warning':
          console.warn(message, context)
          break
        case 'error':
        case 'fatal':
          console.error(message, context)
          break
      }
    }
  },

  /**
   * Set user information for better error context
   * @param user User information or null to clear
   */
  setUserContext : (user: UserContext | null) => {
    if (!__DEV__ || user?.forceLog) {
      Sentry.setUser(user)
    }
  },
  
  /**
   * Add breadcrumb for tracking user actions
   * @param message Breadcrumb message
   * @param category Breadcrumb category
   * @param level Severity level
   */
  addBreadcrumb : (
    message: string, 
    category: string = 'action',
    level: LogLevel = 'info'
  ) => {
    if (!__DEV__) {
      Sentry.addBreadcrumb({
        message,
        category,
        level : level as Sentry.SeverityLevel
      })
    }
  }
} 