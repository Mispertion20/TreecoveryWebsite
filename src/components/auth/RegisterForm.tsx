import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../services/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return t('auth.passwordRequirements.minLength');
    }
    if (!/[A-Z]/.test(pwd)) {
      return t('auth.passwordRequirements.uppercase');
    }
    if (!/[a-z]/.test(pwd)) {
      return t('auth.passwordRequirements.lowercase');
    }
    if (!/[0-9]/.test(pwd)) {
      return t('auth.passwordRequirements.number');
    }
    return null;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    const strength = validatePassword(pwd);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    // Validate password strength
    const strengthError = validatePassword(password);
    if (strengthError) {
      setError(strengthError);
      return;
    }

    setLoading(true);

    try {
      const registerData: RegisterData = { email, password, role };
      await register(registerData);
      onSuccess?.();
    } catch (err: any) {
      // Handle network errors more gracefully
      if (!err.response) {
        // Network error - server might be down or unreachable
        // Check for various network error codes and messages
        const isNetworkError = 
          err.code === 'ERR_NETWORK' ||
          err.code === 'ECONNREFUSED' ||
          err.code === 'ERR_CONNECTION_REFUSED' ||
          err.code === 'ERR_CONNECTION_RESET' ||
          err.message === 'Network Error' ||
          err.message?.includes('ECONNREFUSED') ||
          err.message?.includes('connect') ||
          (err.request && !err.response);
        
        if (isNetworkError) {
          setError(t('auth.networkError'));
          console.error('Network error details:', {
            code: err.code,
            message: err.message,
            request: err.request
          });
          return;
        }
      }
      
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.details?.[0]?.message ||
        err.message ||
        t('auth.registrationFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {t('auth.signUp')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {passwordStrength && password.length > 0 && (
              <p className="mt-1 text-xs text-red-600">{passwordStrength}</p>
            )}
            {!passwordStrength && password.length >= 8 && (
              <p className="mt-1 text-xs text-green-600">Password strength: Good</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{t('auth.passwordsDoNotMatch')}</p>
            )}
          </div>

          <div>
            <label htmlFor="register-role" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.role')}
            </label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'super_admin')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="user">{t('auth.roles.user')}</option>
              <option value="admin">{t('auth.roles.admin')}</option>
              <option value="super_admin">{t('auth.roles.superAdmin')}</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">{t('auth.roleDescription')}</p>
          </div>

          <button
            type="submit"
            disabled={loading || !!passwordStrength || password !== confirmPassword}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('auth.signingUp') : t('auth.signUp')}
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {t('auth.signIn')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

