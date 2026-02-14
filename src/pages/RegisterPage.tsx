import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // After successful registration, redirect to login or map
    navigate('/login');
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-forest mb-2">Create Account</h1>
            <p className="text-neutral-charcoal/70">Join Treecovery today</p>
          </div>
          
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-primary-emerald hover:text-primary-forest transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

