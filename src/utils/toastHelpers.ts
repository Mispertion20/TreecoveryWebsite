/**
 * Toast notification helper utilities
 * Provides consistent toast notifications throughout the application
 */

import toast, { ToastOptions } from 'react-hot-toast';
import { getErrorMessage, getUserErrorMessage } from './errorMessages';

/**
 * Toast configuration defaults
 */
const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    background: '#fff',
    color: '#1f2937',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
};

/**
 * Success toast notification
 */
export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, {
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
    iconTheme: {
      primary: '#059669',
      secondary: '#fff',
    },
  });
}

/**
 * Error toast notification with user-friendly error handling
 */
export function showError(error: unknown, options?: ToastOptions) {
  const errorConfig = getErrorMessage(error);
  const message = errorConfig.userMessage;

  return toast.error(message, {
    ...DEFAULT_TOAST_OPTIONS,
    duration: 5000, // Longer duration for errors
    ...options,
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fff',
    },
  });
}

/**
 * Info toast notification
 */
export function showInfo(message: string, options?: ToastOptions) {
  return toast(message, {
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
    iconTheme: {
      primary: '#0ea5e9',
      secondary: '#fff',
    },
  });
}

/**
 * Warning toast notification
 */
export function showWarning(message: string, options?: ToastOptions) {
  return toast(message, {
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
    icon: '⚠️',
    iconTheme: {
      primary: '#f59e0b',
      secondary: '#fff',
    },
  });
}

/**
 * Loading toast notification (returns toast ID for dismissal)
 */
export function showLoading(message: string, options?: ToastOptions): string {
  return toast.loading(message, {
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
  });
}

/**
 * Promise toast - automatically shows loading, then success/error
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
  options?: ToastOptions
): Promise<T> {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: (data) => {
        if (typeof messages.success === 'function') {
          return messages.success(data);
        }
        return messages.success;
      },
      error: (error) => {
        if (typeof messages.error === 'function') {
          return messages.error(error);
        }
        return getUserErrorMessage(error);
      },
    },
    {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
    }
  );
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  DELETED: 'Item deleted successfully',
  UPLOADED: 'File uploaded successfully',
  EXPORTED: 'Data exported successfully',
  CREATED: 'Item created successfully',
  UPDATED: 'Item updated successfully',
  LOGGED_IN: 'Welcome back!',
  LOGGED_OUT: 'Logged out successfully',
  REGISTERED: 'Account created successfully',
  PASSWORD_RESET: 'Password reset email sent',
  PASSWORD_CHANGED: 'Password changed successfully',
  PHOTO_UPLOADED: 'Photo uploaded successfully',
  PHOTO_DELETED: 'Photo deleted successfully',
  REPORT_SUBMITTED: 'Report submitted successfully',
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
} as const;

/**
 * Common error messages (for direct use when error object is not available)
 */
export const ERROR_MESSAGE_STRINGS = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested item could not be found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

