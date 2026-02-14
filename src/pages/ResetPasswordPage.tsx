import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSuccess = () => {
    // Redirect to login after successful password reset
    navigate('/login');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-primary-forest mb-4">Invalid Reset Link</h1>
            <p className="text-neutral-charcoal/70 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-primary-emerald hover:text-primary-forest transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-forest mb-2">Set New Password</h1>
            <p className="text-neutral-charcoal/70">Enter your new password below</p>
          </div>
          
          <ResetPasswordForm token={token} onSuccess={handleSuccess} />

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-emerald hover:text-primary-forest transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

