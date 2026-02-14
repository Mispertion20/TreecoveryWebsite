import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import MobileBottomNav from './components/MobileBottomNav';
import SkipLink from './components/ui/SkipLink';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const DataUpload = lazy(() => import('./pages/admin/DataUpload'));
const GreenSpaceFormPage = lazy(() => import('./pages/admin/GreenSpaceFormPage'));
const GreenSpaceList = lazy(() => import('./pages/admin/GreenSpaceList'));
const StatisticsPage = lazy(() => import('./pages/admin/StatisticsPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const GreenSpaceDetailPage = lazy(() => import('./pages/GreenSpaceDetailPage'));
const PublicStatisticsPage = lazy(() => import('./pages/PublicStatisticsPage'));
const AdoptPage = lazy(() => import('./pages/AdoptPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const CitizenReportsPage = lazy(() => import('./pages/admin/CitizenReportsPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const ModelPage = lazy(() => import('./pages/ModelPage'));

function App() {
  return (
    <ErrorBoundary>
      <SkipLink />
      <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/spaces/:id" element={<GreenSpaceDetailPage />} />
        <Route path="/statistics" element={<PublicStatisticsPage />} />
        <Route path="/adopt" element={<AdoptPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/model" element={<ModelPage />} />
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <DataUpload />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manual-entry"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <GreenSpaceFormPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/records"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <GreenSpaceList />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/statistics"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <StatisticsPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <CitizenReportsPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <UserManagementPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        </Routes>
      </Suspense>
      <MobileBottomNav />
    </ErrorBoundary>
  );
}

export default App
