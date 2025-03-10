import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking
 * Should be called early in the app lifecycle
 */
export const initSentry = () => {
  if (__DEV__) {
    return; // Don't initialize Sentry in development
  }

  Sentry.init({
    dsn: 'YOUR_DSN_HERE', // Replace with your actual DSN
    debug: false,
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Don't send events in development
      if (__DEV__) {
        return null;
      }
      return event;
    },
  });
};

/**
 * Log an error to Sentry with additional context
 */
export const logError = (
  error: Error, 
  context?: Record<string, any>
) => {
  if (!__DEV__) {
    Sentry.captureException(error, {
      extra: context
    });
  }
};

/**
 * Log a message to Sentry
 */
export const logMessage = (
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  if (!__DEV__) {
    Sentry.captureMessage(message, {
      level: level,
    });
  }
};

/**
 * Set user information for better error context
 */
export const setUserContext = (
  user: {
    id?: string;
    email?: string;
    username?: string;
  } | null
) => {
  if (!__DEV__) {
    if (user) {
      Sentry.setUser(user);
    } else {
      Sentry.setUser(null);
    }
  }
}; 