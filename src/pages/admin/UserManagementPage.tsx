import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { usersApi, User, UsersFilters } from '../../services/usersApi';
import toast from 'react-hot-toast';
import { Search, Filter, ChevronDown, ChevronUp, Shield, ShieldCheck, User as UserIcon, Eye, Edit2, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error(error?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      await usersApi.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error(error?.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleStatusChange = async (userId: string, active: boolean) => {
    try {
      await usersApi.updateUserStatus(userId, active);
      toast.success(active ? 'User activated' : 'User deactivated');
      loadUsers();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error?.response?.data?.error || 'Failed to update user status');
    }
  };

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } else {
      newExpanded.add(userId);
      loadUserDetails(userId);
    }
    setExpandedRows(newExpanded);
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const userDetails = await usersApi.getUserDetails(userId);
      setSelectedUser(userDetails as any);
    } catch (error: any) {
      console.error('Failed to load user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      role: roleFilter || undefined,
      search: searchQuery || undefined,
      page: 1,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <>
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.email}</div>
                              <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1 capitalize">{user.role.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.city?.name_en || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.activity ? (
                            <div className="flex gap-2">
                              <span title="Adoptions">{user.activity.adoptions}</span>
                              <span>•</span>
                              <span title="Reports">{user.activity.reports}</span>
                              <span>•</span>
                              <span title="Comments">{user.activity.comments}</span>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRowExpansion(user.id)}
                              className="text-green-600 hover:text-green-900"
                              title="View Details"
                            >
                              {expandedRows.has(user.id) ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(user.id) && selectedUser?.id === user.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Recent Adoptions</h4>
                                {selectedUser.activity?.adoptions && Array.isArray(selectedUser.activity.adoptions) && selectedUser.activity.adoptions.length > 0 ? (
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {selectedUser.activity.adoptions.slice(0, 5).map((adoption: any) => (
                                      <li key={adoption.id}>
                                        {new Date(adoption.adoption_date).toLocaleDateString()} - {adoption.is_active ? 'Active' : 'Inactive'}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No adoptions</p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Recent Reports</h4>
                                {selectedUser.activity?.reports && Array.isArray(selectedUser.activity.reports) && selectedUser.activity.reports.length > 0 ? (
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {selectedUser.activity.reports.slice(0, 5).map((report: any) => (
                                      <li key={report.id}>
                                        {report.report_type} - {report.status} ({new Date(report.created_at).toLocaleDateString()})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No reports</p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Recent Comments</h4>
                                {selectedUser.activity?.comments && Array.isArray(selectedUser.activity.comments) && selectedUser.activity.comments.length > 0 ? (
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {selectedUser.activity.comments.slice(0, 5).map((comment: any) => (
                                      <li key={comment.id}>
                                        {comment.content.substring(0, 50)}... ({new Date(comment.created_at).toLocaleDateString()})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No comments</p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Audit Log</h4>
                                {selectedUser.activity?.auditLogs && Array.isArray(selectedUser.activity.auditLogs) && selectedUser.activity.auditLogs.length > 0 ? (
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {selectedUser.activity.auditLogs.slice(0, 5).map((log: any) => (
                                      <li key={log.id}>
                                        {log.action} by {log.admin?.email} ({new Date(log.created_at).toLocaleDateString()})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No audit logs</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page! + 1) })}
                  disabled={filters.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page! + 1) })}
                      disabled={filters.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

