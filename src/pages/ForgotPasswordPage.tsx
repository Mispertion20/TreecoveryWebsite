import { useNavigate, Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Success message is shown in the form
    // Optionally redirect after a delay
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-forest mb-2">Reset Password</h1>
            <p className="text-neutral-charcoal/70">Enter your email to receive reset instructions</p>
          </div>
          
          <ForgotPasswordForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />

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

