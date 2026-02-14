import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import { Edit, Trash2, Eye, CheckSquare, Square } from 'lucide-react';
import { GreenSpaceFilters } from '../../services/greenSpacesApi';
import ConfirmDialog from '../ui/ConfirmDialog';
import SkeletonLoader from '../ui/SkeletonLoader';
import ErrorMessage from '../ui/ErrorMessage';

interface GreenSpaceListProps {
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  filters?: GreenSpaceFilters;
}

export default function GreenSpaceList({ onEdit, onView, filters = {} }: GreenSpaceListProps) {
  const [greenSpaces, setGreenSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    loadGreenSpaces();
  }, [filters, pagination.page]);

  const loadGreenSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await greenSpacesApi.getGreenSpaces({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setGreenSpaces(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load green spaces:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load green spaces';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const deleteToast = toast.loading('Deleting green space...');

    try {
      await greenSpacesApi.deleteGreenSpace(itemToDelete);
      toast.success('Green space deleted successfully', { id: deleteToast });
      loadGreenSpaces();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete green space';
      toast.error(errorMessage, { id: deleteToast });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await greenSpacesApi.updateStatus(id, status as any);
      toast.success('Status updated successfully');
      loadGreenSpaces();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === greenSpaces.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(greenSpaces.map((gs) => gs.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one item');
      return;
    }
    setBulkDeleteOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const deleteToast = toast.loading(`Deleting ${selectedIds.size} green spaces...`);

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => greenSpacesApi.deleteGreenSpace(id))
      );
      toast.success(`Successfully deleted ${selectedIds.size} green spaces`, { id: deleteToast });
      setSelectedIds(new Set());
      loadGreenSpaces();
    } catch (error: any) {
      toast.error('Failed to delete some green spaces', { id: deleteToast });
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    const updateToast = toast.loading(`Updating ${selectedIds.size} green spaces...`);

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => greenSpacesApi.updateStatus(id, status as any))
      );
      toast.success(`Successfully updated ${selectedIds.size} green spaces`, { id: updateToast });
      setSelectedIds(new Set());
      loadGreenSpaces();
    } catch (error: any) {
      toast.error('Failed to update some green spaces', { id: updateToast });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive':
        return 'bg-green-100 text-green-800';
      case 'attention_needed':
        return 'bg-yellow-100 text-yellow-800';
      case 'dead':
        return 'bg-red-100 text-red-800';
      case 'removed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && greenSpaces.length === 0) {
    return <SkeletonLoader type="table" className="w-full" />;
  }

  if (error && greenSpaces.length === 0) {
    return (
      <ErrorMessage
        title="Failed to load green spaces"
        message={error}
        onRetry={loadGreenSpaces}
        variant="default"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => handleBulkStatusUpdate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              <option value="alive">Alive</option>
              <option value="attention_needed">Attention Needed</option>
              <option value="dead">Dead</option>
              <option value="removed">Removed</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {greenSpaces.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No green spaces found</div>
          ) : (
            greenSpaces.map((gs) => (
              <div
                key={gs.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{gs.species_ru}</h3>
                    {gs.species_en && (
                      <p className="text-sm text-gray-500 mt-1">{gs.species_en}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectItem(gs.id)}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                    aria-label={selectedIds.has(gs.id) ? 'Deselect' : 'Select'}
                  >
                    {selectedIds.has(gs.id) ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type: </span>
                    <span className="text-gray-900 capitalize">{gs.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location: </span>
                    <span className="text-gray-900">
                      {gs.city?.name_en || 'N/A'}
                      {gs.district && `, ${gs.district.name_en}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Planting Date: </span>
                    <span className="text-gray-900">
                      {new Date(gs.planting_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status: </span>
                    <select
                      value={gs.status}
                      onChange={(e) => handleStatusChange(gs.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(gs.status)}`}
                    >
                      <option value="alive">Alive</option>
                      <option value="attention_needed">Attention Needed</option>
                      <option value="dead">Dead</option>
                      <option value="removed">Removed</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  {onView && (
                    <button
                      onClick={() => onView(gs.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(gs.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(gs.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="text-gray-500 hover:text-gray-700"
                  title="Select all"
                >
                  {selectedIds.size === greenSpaces.length && greenSpaces.length > 0 ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Species
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planting Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {greenSpaces.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No green spaces found
                </td>
              </tr>
            ) : (
              greenSpaces.map((gs) => (
                <tr key={gs.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectItem(gs.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {selectedIds.has(gs.id) ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{gs.species_ru}</div>
                    {gs.species_en && (
                      <div className="text-sm text-gray-500">{gs.species_en}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{gs.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {gs.city?.name_en || 'N/A'}
                    </div>
                    {gs.district && (
                      <div className="text-sm text-gray-500">{gs.district.name_en}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(gs.planting_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={gs.status}
                      onChange={(e) => handleStatusChange(gs.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(gs.status)}`}
                    >
                      <option value="alive">Alive</option>
                      <option value="attention_needed">Attention Needed</option>
                      <option value="dead">Dead</option>
                      <option value="removed">Removed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(gs.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(gs.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(gs.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Green Space"
        message="Are you sure you want to delete this green space? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        title="Delete Multiple Green Spaces"
        message={`Are you sure you want to delete ${selectedIds.size} green space${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => {
          setBulkDeleteOpen(false);
        }}
      />
    </div>
  );
}

