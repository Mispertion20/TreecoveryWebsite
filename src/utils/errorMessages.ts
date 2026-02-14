/**
 * Centralized error message mapping system
 * Provides user-friendly error messages for common error scenarios
 */

export interface ErrorMessageConfig {
  userMessage: string;
  technicalMessage?: string;
  action?: string;
}

/**
 * Maps error codes or patterns to user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, ErrorMessageConfig> = {
  // Authentication errors
  UNAUTHORIZED: {
    userMessage: 'Please log in to continue.',
    action: 'Go to login',
  },
  FORBIDDEN: {
    userMessage: 'You do not have permission to perform this action.',
  },
  TOKEN_EXPIRED: {
    userMessage: 'Your session has expired. Please log in again.',
    action: 'Go to login',
  },
  INVALID_CREDENTIALS: {
    userMessage: 'Invalid email or password. Please try again.',
  },
  EMAIL_EXISTS: {
    userMessage: 'An account with this email already exists.',
  },
  WEAK_PASSWORD: {
    userMessage: 'Password is too weak. Please use a stronger password.',
  },

  // Network errors
  NETWORK_ERROR: {
    userMessage: 'Unable to connect to the server. Please check your internet connection.',
    technicalMessage: 'Network request failed',
  },
  TIMEOUT: {
    userMessage: 'The request took too long. Please try again.',
    technicalMessage: 'Request timeout',
  },
  SERVER_ERROR: {
    userMessage: 'Something went wrong on our end. Please try again later.',
    technicalMessage: 'Internal server error',
  },

  // Data errors
  NOT_FOUND: {
    userMessage: 'The requested item could not be found.',
  },
  VALIDATION_ERROR: {
    userMessage: 'Please check your input and try again.',
    technicalMessage: 'Validation failed',
  },
  DUPLICATE_ENTRY: {
    userMessage: 'This item already exists.',
  },

  // File upload errors
  FILE_TOO_LARGE: {
    userMessage: 'File is too large. Please choose a smaller file.',
  },
  INVALID_FILE_TYPE: {
    userMessage: 'Invalid file type. Please choose a different file.',
  },
  UPLOAD_FAILED: {
    userMessage: 'Failed to upload file. Please try again.',
  },

  // Export errors
  EXPORT_FAILED: {
    userMessage: 'Failed to export data. Please try again.',
  },
  EXPORT_UNAUTHORIZED: {
    userMessage: 'Please log in to export data.',
    action: 'Go to login',
  },

  // Map errors
  MAP_LOAD_ERROR: {
    userMessage: 'Failed to load map. Please refresh the page.',
  },
  LOCATION_ERROR: {
    userMessage: 'Unable to get your location. Please check your browser settings.',
  },

  // Generic fallback
  UNKNOWN_ERROR: {
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: 'Unknown error',
  },
};

/**
 * Extracts user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): ErrorMessageConfig {
  // Handle string errors
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || {
      userMessage: error,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toUpperCase();

    // Check for known error patterns
    for (const [key, config] of Object.entries(ERROR_MESSAGES)) {
      if (message.includes(key) || message.includes(key.replace(/_/g, ' '))) {
        return config;
      }
    }

    // Check for network errors
    if (message.includes('NETWORK') || message.includes('FETCH') || message.includes('CONNECTION')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Check for timeout
    if (message.includes('TIMEOUT')) {
      return ERROR_MESSAGES.TIMEOUT;
    }

    // Return generic error with technical message
    return {
      userMessage: ERROR_MESSAGES.UNKNOWN_ERROR.userMessage,
      technicalMessage: error.message,
    };
  }

  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
    const status = axiosError.response?.status;
    const dataMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;

    // Map HTTP status codes to error messages
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.DUPLICATE_ENTRY;
      case 422:
        return {
          userMessage: dataMessage || ERROR_MESSAGES.VALIDATION_ERROR.userMessage,
          technicalMessage: dataMessage,
        };
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return {
          userMessage: dataMessage || ERROR_MESSAGES.UNKNOWN_ERROR.userMessage,
          technicalMessage: dataMessage,
        };
    }
  }

  // Fallback to unknown error
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Gets a simple user-friendly error message string
 */
export function getUserErrorMessage(error: unknown): string {
  return getErrorMessage(error).userMessage;
}

/**
 * Gets technical error message for debugging (only in development)
 */
export function getTechnicalErrorMessage(error: unknown): string | undefined {
  if (import.meta.env.DEV) {
    const config = getErrorMessage(error);
    return config.technicalMessage || (error instanceof Error ? error.message : String(error));
  }
  return undefined;
}

