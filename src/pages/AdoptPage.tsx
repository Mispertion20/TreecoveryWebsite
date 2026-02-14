import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adoptionsApi } from '../services/adoptionsApi';
import { greenSpacesApi } from '../services/greenSpacesApi';
import Navbar from '../components/Navbar';
import { Heart, MapPin, TreePine, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { format } from 'date-fns';

export default function AdoptPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to view your adoptions');
      navigate('/login');
      return;
    }
    loadAdoptions();
  }, [isAuthenticated, navigate]);

  const loadAdoptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adoptionsApi.getAdoptions({ is_active: true });
      setAdoptions(response.data);
    } catch (err: any) {
      console.error('Failed to load adoptions:', err);
      setError(err.response?.data?.error || 'Failed to load adoptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAdoption = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this adoption?')) return;

    try {
      setCancellingId(id);
      await adoptionsApi.cancelAdoption(id);
      setAdoptions(adoptions.filter((a) => a.id !== id));
      toast.success('Adoption cancelled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel adoption');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner fullScreen text="Loading your adoptions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <Heart className="w-10 h-10 mr-3 text-green-600 fill-current" />
              My Adopted Trees
            </h1>
            <p className="text-gray-600">
              View and manage the trees you've adopted
            </p>
          </div>

          {adoptions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <TreePine className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Adoptions Yet</h2>
              <p className="text-gray-600 mb-6">
                Start adopting trees to help monitor and care for green spaces in Kazakhstan
              </p>
              <button
                onClick={() => navigate('/map')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Browse Trees on Map
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adoptions.map((adoption) => (
                <div key={adoption.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {adoption.green_space?.photos?.[0] && (
                    <img
                      src={adoption.green_space.photos[0].url}
                      alt={adoption.green_space.species_ru}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {adoption.green_space?.species_ru || 'Unknown Species'}
                    </h3>
                    {adoption.green_space?.species_en && (
                      <p className="text-gray-600 mb-4">{adoption.green_space.species_en}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      {adoption.green_space?.city && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {adoption.green_space.city.name_en}
                        </div>
                      )}
                      {adoption.green_space?.planting_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Planted {format(new Date(adoption.green_space.planting_date), 'MMM yyyy')}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <TreePine className="w-4 h-4 mr-2 text-green-600" />
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          adoption.green_space?.status === 'alive' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {adoption.green_space?.status || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {adoption.notes && (
                      <p className="text-sm text-gray-600 mb-4 italic">"{adoption.notes}"</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <button
                        onClick={() => navigate(`/spaces/${adoption.green_space_id}`)}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleCancelAdoption(adoption.id)}
                        disabled={cancellingId === adoption.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {cancellingId === adoption.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

