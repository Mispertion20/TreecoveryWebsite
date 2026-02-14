import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import GreenSpaceForm from '../../components/admin/GreenSpaceForm';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GreenSpaceFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const editId = id || searchParams.get('id');
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      loadGreenSpace();
    }
  }, [editId]);

  const loadGreenSpace = async () => {
    try {
      setLoading(true);
      const data = await greenSpacesApi.getGreenSpace(editId!);
      setInitialData(data);
    } catch (error) {
      console.error('Failed to load green space:', error);
      toast.error('Failed to load green space');
      navigate('/admin/records');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success(editId ? 'Green space updated successfully' : 'Green space created successfully');
    navigate('/admin/records');
  };

  const handleCancel = () => {
    navigate('/admin/records');
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading..." fullScreen />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {editId ? 'Edit Green Space' : 'Create New Green Space'}
          </h1>
          <GreenSpaceForm
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

