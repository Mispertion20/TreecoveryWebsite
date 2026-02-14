import { useState } from 'react';
import Tutorial from './Tutorial';
import { useLocation } from 'react-router-dom';

const ADMIN_WALKTHROUGH_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Admin Dashboard!',
    content:
      'As an administrator, you have access to powerful tools for managing green spaces. Let\'s explore the key features.',
    position: 'center' as const,
  },
  {
    id: 'upload',
    title: 'Bulk Data Upload',
    content:
      'Use the Data Upload page to import multiple green spaces at once via CSV. The enhanced uploader includes validation and duplicate detection.',
    target: 'a[href="/admin/upload"]',
    position: 'bottom' as const,
  },
  {
    id: 'manual',
    title: 'Manual Entry',
    content:
      'Add individual green spaces manually with photos and detailed information. Perfect for single entries or corrections.',
    target: 'a[href="/admin/manual-entry"]',
    position: 'bottom' as const,
  },
  {
    id: 'records',
    title: 'Manage Records',
    content:
      'View, search, filter, and edit all green space records. Use advanced filters to find specific entries quickly.',
    target: 'a[href="/admin/records"]',
    position: 'bottom' as const,
  },
  {
    id: 'statistics',
    title: 'View Statistics',
    content:
      'Monitor platform activity, track planting progress, and analyze data trends with comprehensive statistics.',
    target: 'a[href="/admin/statistics"]',
    position: 'bottom' as const,
  },
  {
    id: 'reports',
    title: 'Citizen Reports',
    content:
      'Review and manage reports submitted by citizens. Approve valid reports and track resolution status.',
    target: 'a[href="/admin/reports"]',
    position: 'bottom' as const,
  },
  {
    id: 'complete',
    title: 'Ready to Manage Green Spaces!',
    content:
      'You\'re now familiar with the admin tools. Start by uploading data or managing existing records. Need help? Check the help center anytime.',
    position: 'center' as const,
  },
];

export default function AdminWalkthrough() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const location = useLocation();

  // Check if admin has completed walkthrough
  const walkthroughCompleted = localStorage.getItem('adminWalkthroughCompleted');

  // Show walkthrough on first admin page visit
  if (!walkthroughCompleted && location.pathname.startsWith('/admin') && !showWalkthrough) {
    setTimeout(() => {
      setShowWalkthrough(true);
    }, 1000);
  }

  const handleComplete = () => {
    localStorage.setItem('adminWalkthroughCompleted', 'true');
    setShowWalkthrough(false);
  };

  const handleSkip = () => {
    localStorage.setItem('adminWalkthroughCompleted', 'true');
    setShowWalkthrough(false);
  };

  if (!showWalkthrough) return null;

  return (
    <Tutorial
      steps={ADMIN_WALKTHROUGH_STEPS}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}

// Hook to manually trigger walkthrough
export function useAdminWalkthrough() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const handleComplete = () => {
    localStorage.setItem('adminWalkthroughCompleted', 'true');
    setShowWalkthrough(false);
  };

  const handleSkip = () => {
    localStorage.setItem('adminWalkthroughCompleted', 'true');
    setShowWalkthrough(false);
  };

  return {
    showWalkthrough,
    startWalkthrough,
    walkthroughComponent: showWalkthrough ? (
      <Tutorial
        steps={ADMIN_WALKTHROUGH_STEPS}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    ) : null,
  };
}

