import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, BarChart3, Image, PlusCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useRef } from 'react';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/statistics', icon: BarChart3, label: 'Stats' },
    { path: '/gallery', icon: Image, label: 'Gallery' },
    { path: '/report', icon: PlusCircle, label: 'Report' },
  ];

  // Swipe gesture for quick navigation
  useSwipeGesture(navRef, {
    onSwipeLeft: () => {
      const currentIndex = navItems.findIndex((item) => item.path === location.pathname);
      if (currentIndex < navItems.length - 1) {
        navigate(navItems[currentIndex + 1].path);
      }
    },
    onSwipeRight: () => {
      const currentIndex = navItems.findIndex((item) => item.path === location.pathname);
      if (currentIndex > 0) {
        navigate(navItems[currentIndex - 1].path);
      }
    },
  });

  // Only show on mobile and for non-admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive
                  ? 'text-primary-emerald'
                  : 'text-gray-600 hover:text-primary-emerald'
              } transition-colors`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        {isAuthenticated && (
          <Link
            to="/adopt"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              location.pathname === '/adopt'
                ? 'text-primary-emerald'
                : 'text-gray-600 hover:text-primary-emerald'
            } transition-colors`}
            aria-label="My Adoptions"
          >
            <User className="w-6 h-6" aria-hidden="true" />
            <span className="text-xs mt-1">Adopt</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

