import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GreenSpaceList from '../../components/admin/GreenSpaceList';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Search, Download } from 'lucide-react';
import { exportApi } from '../../services/exportApi';
import { GreenSpaceFilters } from '../../services/greenSpacesApi';
import type { GreenSpaceStatus } from '../../types/greenSpaces';

export default function GreenSpaceListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GreenSpaceFilters>({
    search: '',
    status: undefined,
    type: undefined,
    city_id: undefined,
  });
  const [exporting, setExporting] = useState(false);

  const handleEdit = (id: string) => {
    navigate(`/admin/manual-entry?id=${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/admin/records/${id}`);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportFilters: GreenSpaceFilters = {};
      if (filters.city_id) exportFilters.city_id = filters.city_id;
      if (filters.status) exportFilters.status = filters.status as any;
      if (filters.type) exportFilters.type = filters.type;
      if (filters.search) exportFilters.search = filters.search;
      
      await exportApi.exportAndDownload(exportFilters, 'csv');
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Green Spaces</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={() => navigate('/admin/manual-entry')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search species..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({ ...filters, status: value ? (value as GreenSpaceStatus) : undefined });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="alive">Alive</option>
                <option value="attention_needed">Attention Needed</option>
                <option value="dead">Dead</option>
                <option value="removed">Removed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Types</option>
                <option value="tree">Tree</option>
                <option value="park">Park</option>
                <option value="alley">Alley</option>
                <option value="garden">Garden</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', status: undefined, type: undefined, city_id: undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <GreenSpaceList
          filters={filters}
          onEdit={handleEdit}
          onView={handleView}
        />
      </div>
    </AdminLayout>
  );
}

