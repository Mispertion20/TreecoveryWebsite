import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'fullscreen';
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try again',
  className = '',
  variant = 'default',
}: ErrorMessageProps) {
  const content = (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 text-sm text-red-800 underline hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">{content}</div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-700">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                {retryText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return content;
}

