/**
 * Development-only logger that removes console statements in production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

// For production error reporting, use this function to send errors to a service
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (!isDevelopment) {
    // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error, 'Context:', context);
  }
};

export default logger;
