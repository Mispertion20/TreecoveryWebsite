import Navbar from '../components/Navbar';
import HelpCenter from '../components/help/HelpCenter';
import UserTutorial from '../components/onboarding/UserTutorial';
import AdminWalkthrough from '../components/onboarding/AdminWalkthrough';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <HelpCenter />
      </main>
      <UserTutorial />
      <AdminWalkthrough />
    </div>
  );
}

