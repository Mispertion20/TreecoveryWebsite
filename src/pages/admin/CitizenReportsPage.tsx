import { useState, useEffect } from 'react';
import { citizenReportsApi, CitizenReport, ReportStatus } from '../../services/citizenReportsApi';
import AdminLayout from '../../components/admin/AdminLayout';
import { AlertCircle, CheckCircle, XCircle, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { format } from 'date-fns';

export default function CitizenReportsPage() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const response = await citizenReportsApi.getReports(params);
      setReports(response.data);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    try {
      setUpdating(true);
      await citizenReportsApi.updateReportStatus(reportId, {
        status: newStatus,
        admin_response: adminResponse || undefined,
      });
      await loadReports();
      setSelectedReport(null);
      setAdminResponse('');
      toast.success('Report status updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update report');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading reports..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Citizen Reports</h1>
            <p className="text-gray-600 mt-1">Review and manage reports from citizens</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && <ErrorMessage message={error} />}

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reports Found</h2>
            <p className="text-gray-600">No reports match the current filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(report.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(report.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 capitalize">
                  {report.report_type.replace('_', ' ')}
                </h3>

                <p className="text-gray-700 mb-4">{report.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </div>
                  {report.reporter_name && (
                    <div className="text-sm text-gray-600">
                      Reporter: {report.reporter_name}
                      {report.reporter_email && ` (${report.reporter_email})`}
                    </div>
                  )}
                  {report.city && (
                    <div className="text-sm text-gray-600">
                      City: {report.city.name_en}
                    </div>
                  )}
                </div>

                {report.photos && report.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {report.photos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt="Report photo"
                          className="w-24 h-24 object-cover rounded border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {report.admin_response && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                    <p className="text-sm text-gray-600">{report.admin_response}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Review
                  </button>
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        disabled={updating}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Review Report</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Response (optional)
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Add a response to the reporter..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, 'under_review')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReport.id, 'rejected')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

