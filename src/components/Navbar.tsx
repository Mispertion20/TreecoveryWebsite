import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Menu, X, LogOut, User, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ThemeToggleDropdown from './ThemeToggleDropdown';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

// Force Vite to reload this module

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      // Silently fail - logout will still clear local state
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <nav
      className="bg-white dark:bg-neutral-dark-surface shadow-sm border-b border-gray-200 dark:border-neutral-dark-border sticky top-0 z-[1000]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-primary-forest dark:text-primary-emerald-dark hover:text-primary-emerald dark:hover:text-primary-sage-dark transition-colors flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Leaf className="w-6 h-6" aria-hidden="true" />
            <span className="text-xl font-bold">Treecovery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-start gap-6 ml-6 min-w-0 overflow-hidden">
            <GlobalSearch />
            <Link
              to="/"
              className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
            >
              {t('common.home')}
            </Link>
            <Link
              to="/map"
              className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
            >
              {t('common.map')}
            </Link>
            <Link
              to="/statistics"
              className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
            >
              {t('common.statistics')}
            </Link>
            <Link
              to="/gallery"
              className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
            >
              {t('common.gallery')}
            </Link>
            {isAuthenticated && (
              <Link
                to="/adopt"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
              >
                {t('nav.myAdoptions')}
              </Link>
            )}
            <Link
              to="/report"
              className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
            >
              {t('nav.reportIssue')}
            </Link>
            <Link
              to="/help"
              className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
            >
              {t('common.help')}
            </Link>
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium whitespace-nowrap"
              >
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Right Section - Theme Toggle and Auth */}
          <div className="hidden md:flex items-center flex-shrink-0 ml-12 gap-4">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="flex-shrink-0">
                <NotificationBell />
              </div>
            )}
            {/* Language Switcher */}
            <div className="flex-shrink-0">
              <LanguageSwitcher />
            </div>
            {/* Theme Toggle Dropdown */}
            <div className="hidden md:block flex-shrink-0">
              <ThemeToggleDropdown />
            </div>

            {/* Auth Section */}
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-neutral-dark-text whitespace-nowrap">
                  <User className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden xl:inline">{user.email}</span>
                  <span className="xl:hidden lg:inline">{user.email.split('@')[0]}</span>
                  <span className="lg:hidden">{user.email.split('@')[0].substring(0, 8)}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-emerald rounded-lg hover:bg-primary-emerald-dark transition-colors flex-shrink-0"
                  aria-label={t('common.logout')}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t('common.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-emerald rounded-lg hover:bg-primary-emerald-dark transition-colors"
              >
                {t('common.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-neutral-dark-text hover:bg-gray-100 dark:hover:bg-neutral-dark-surface-hover transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-neutral-dark-border mt-2 pt-4">
            <div className="flex flex-col gap-4">
              <div className="px-2">
                <GlobalSearch />
              </div>
              {isAuthenticated && (
                <div className="px-2">
                  <Link
                    to="/notifications"
                    className="flex items-center gap-2 text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bell className="w-5 h-5" />
                    {t('nav.notifications')}
                  </Link>
                </div>
              )}
              <div className="px-2">
                <LanguageSwitcher />
              </div>
              <div className="px-2">
                <ThemeToggle />
              </div>
              <Link
                to="/"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.home')}
              </Link>
              <Link
                to="/map"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.map')}
              </Link>
              <Link
                to="/statistics"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.statistics')}
              </Link>
              <Link
                to="/gallery"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.gallery')}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/adopt"
                  className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.myAdoptions')}
                </Link>
              )}
              <Link
                to="/report"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.reportIssue')}
              </Link>
              <Link
                to="/help"
                className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.help')}
              </Link>
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.admin')}
                </Link>
              )}

              {/* Mobile Auth Section */}
              {loading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
              ) : isAuthenticated && user ? (
                <div className="flex flex-col gap-3 pt-2 border-t border-gray-200 dark:border-neutral-dark-border">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-dark-text">
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-emerald rounded-lg hover:bg-primary-emerald-dark transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    {t('common.logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-emerald rounded-lg hover:bg-primary-emerald-dark transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('common.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

