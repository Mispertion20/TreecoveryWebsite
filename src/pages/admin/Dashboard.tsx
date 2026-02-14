import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminWalkthrough from '../../components/onboarding/AdminWalkthrough';
import { showError } from '../../utils/toastHelpers';
import { 
  Upload, 
  PenSquare, 
  List, 
  BarChart3, 
  FileDown,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    alive: 0,
    attentionNeeded: 0,
    dead: 0,
    removed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [all, alive, attention, dead, removed] = await Promise.all([
        greenSpacesApi.getGreenSpaces({ limit: 1 }),
        greenSpacesApi.getGreenSpaces({ status: 'alive', limit: 1 }),
        greenSpacesApi.getGreenSpaces({ status: 'attention_needed', limit: 1 }),
        greenSpacesApi.getGreenSpaces({ status: 'dead', limit: 1 }),
        greenSpacesApi.getGreenSpaces({ status: 'removed', limit: 1 }),
      ]);

      setStats({
        total: all.pagination.total,
        alive: alive.pagination.total,
        attentionNeeded: attention.pagination.total,
        dead: dead.pagination.total,
        removed: removed.pagination.total,
      });
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const adminActions = [
    {
      title: 'Upload CSV',
      description: 'Bulk import tree data from CSV file',
      icon: Upload,
      link: '/admin/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Manual Entry',
      description: 'Add individual trees with photos',
      icon: PenSquare,
      link: '/admin/manual-entry',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Records',
      description: 'View, edit, and delete green spaces',
      icon: List,
      link: '/admin/records',
      color: 'bg-purple-500',
    },
    {
      title: 'Statistics',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      link: '/admin/statistics',
      color: 'bg-orange-500',
    },
    {
      title: 'Citizen Reports',
      description: 'Review and manage citizen reports',
      icon: ImageIcon,
      link: '/admin/reports',
      color: 'bg-pink-500',
    },
    {
      title: 'Export Data',
      description: 'Download data as CSV or Excel',
      icon: FileDown,
      link: '/admin/export',
      color: 'bg-indigo-500',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading dashboard..." fullScreen />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage green spaces and data</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Green Spaces</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Alive</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{stats.alive}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Attention Needed</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.attentionNeeded}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Dead</div>
            <div className="mt-2 text-3xl font-bold text-red-600">{stats.dead}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Removed</div>
            <div className="mt-2 text-3xl font-bold text-gray-600">{stats.removed}</div>
          </div>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <AdminWalkthrough />
    </AdminLayout>
  );
}

