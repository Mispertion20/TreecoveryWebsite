import { useState, useEffect } from 'react';
import Tutorial from './Tutorial';
import { useLocation } from 'react-router-dom';

const USER_TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Treecovery!',
    content:
      'Treecovery is Kazakhstan\'s first transparent platform for monitoring urban green spaces. Let\'s take a quick tour to help you get started.',
    position: 'center' as const,
  },
  {
    id: 'map',
    title: 'Explore the Interactive Map',
    content:
      'Use the map to explore green spaces across Kazakhstan. Click on markers to see details about each tree, park, or garden.',
    target: 'a[href="/map"]',
    position: 'bottom' as const,
  },
  {
    id: 'filters',
    title: 'Use Filters to Find What You Need',
    content:
      'Filter green spaces by city, status, type, and more. Use the search bar to find specific species or locations.',
    target: '[data-tutorial="filters"]',
    position: 'bottom' as const,
  },
  {
    id: 'report',
    title: 'Report Issues',
    content:
      'Found a tree that needs attention? Use the Report button to submit an issue. Your reports help maintain our green spaces.',
    target: 'a[href="/report"]',
    position: 'bottom' as const,
  },
  {
    id: 'statistics',
    title: 'View Statistics',
    content:
      'Check out our statistics page to see the impact of our green space monitoring efforts across Kazakhstan.',
    target: 'a[href="/statistics"]',
    position: 'bottom' as const,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content:
      'You now know the basics of Treecovery. Start exploring the map, report issues, and help us restore Kazakhstan\'s green future!',
    position: 'center' as const,
  },
];

export default function UserTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user has completed tutorial
    const tutorialCompleted = localStorage.getItem('userTutorialCompleted');
    if (!tutorialCompleted && location.pathname === '/') {
      // Show tutorial after a short delay on landing page
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleComplete = () => {
    localStorage.setItem('userTutorialCompleted', 'true');
    setShowTutorial(false);
  };

  const handleSkip = () => {
    localStorage.setItem('userTutorialCompleted', 'true');
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  return (
    <Tutorial
      steps={USER_TUTORIAL_STEPS}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}

// Hook to manually trigger tutorial
export function useUserTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const handleComplete = () => {
    localStorage.setItem('userTutorialCompleted', 'true');
    setShowTutorial(false);
  };

  const handleSkip = () => {
    localStorage.setItem('userTutorialCompleted', 'true');
    setShowTutorial(false);
  };

  return {
    showTutorial,
    startTutorial,
    tutorialComponent: showTutorial ? (
      <Tutorial
        steps={USER_TUTORIAL_STEPS}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    ) : null,
  };
}

