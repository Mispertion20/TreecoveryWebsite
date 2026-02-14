import StatisticsDashboard from '../components/statistics/StatisticsDashboard';
import Navbar from '../components/Navbar';

export default function PublicStatisticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Public Statistics</h1>
          <p className="text-gray-600">
            Explore transparent data about green spaces across Kazakhstan
          </p>
        </div>
        <StatisticsDashboard />
      </main>
    </div>
  );
}

