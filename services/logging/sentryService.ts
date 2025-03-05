import * as Sentry from 'sentry-expo';

/**
 * Initialize Sentry for error tracking
 * Should be called early in the app lifecycle
 */
export const initSentry = () => {
  Sentry.init({
    dsn: 'YOUR_DSN_HERE', // Replace with your actual DSN
    enableInExpoDevelopment: false,
    debug: __DEV__,
    tracesSampleRate: 1.0,
  });
};

/**
 * Log an error to Sentry with additional context
 */
export const logError = (
  error: Error, 
  context?: Record<string, any>
) => {
  Sentry.Native.captureException(error, {
    extra: context
  });
};

/**
 * Log a message to Sentry
 */
export const logMessage = (
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  Sentry.Native.captureMessage(message, {
    level: Sentry.Native.Severity[level.toUpperCase() as 'INFO' | 'WARNING' | 'ERROR'],
  });
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
  if (user) {
    Sentry.Native.setUser(user);
  } else {
    Sentry.Native.setUser(null);
  }
}; 