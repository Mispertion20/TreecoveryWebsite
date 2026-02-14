import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Get returnUrl from location state (set by ProtectedRoute)
  const returnUrl = location.state?.returnUrl || null;

  // Handle redirect after successful login
  useEffect(() => {
    if (user && !authLoading && !redirecting) {
      setRedirecting(true);
      
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        // Redirect to intended page if available, otherwise role-based redirect
        if (returnUrl) {
          navigate(returnUrl, { replace: true });
        } else if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/map', { replace: true });
        }
      }, 100);
    }
  }, [user, authLoading, navigate, returnUrl, redirecting]);

  const handleSuccess = () => {
    // The useEffect will handle the redirect based on AuthContext.user
    // This callback is just a placeholder for the LoginForm's onSuccess prop
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleSwitchToForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Show loading spinner while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <LoadingSpinner text="Redirecting..." />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-neutral-offwhite via-primary-sage/10 to-primary-emerald/5 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-forest mb-2">Sign In</h1>
            <p className="text-neutral-charcoal/70">Welcome back to Treecovery</p>
          </div>
          
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-primary-emerald hover:text-primary-forest transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

