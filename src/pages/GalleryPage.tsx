import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryApi } from '../services/galleryApi';
import { citiesApi } from '../services/citiesApi';
import Navbar from '../components/Navbar';
import { Filter, Image as ImageIcon, Calendar, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import LazyImage from '../components/ui/LazyImage';
import { format } from 'date-fns';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    city_id: '',
    year: '',
    type: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [filters, page]);

  const loadCities = async () => {
    try {
      const data = await citiesApi.getCities();
      setCities(data || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit: 20 };
      if (filters.city_id) params.city_id = filters.city_id;
      if (filters.year) params.year = filters.year;
      if (filters.type) params.type = filters.type;

      const response = await galleryApi.getPhotos(params);
      setPhotos(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Failed to load photos:', err);
      setError(err.response?.data?.error || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ city_id: '', year: '', type: '' });
    setPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner fullScreen text="Loading gallery..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <ImageIcon className="w-10 h-10 mr-3 text-green-600" />
              Photo Gallery
            </h1>
            <p className="text-gray-600">
              Explore photos of green spaces across Kazakhstan
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <Filter className="w-5 h-5 mr-2" aria-hidden="true" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {showFilters && (
              <div id="filter-panel" className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4" role="region" aria-label="Filter options">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={filters.city_id}
                    onChange={(e) => handleFilterChange('city_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Photos Found</h2>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <article
                    key={photo.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2"
                    onClick={() => navigate(`/spaces/${photo.green_space.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/spaces/${photo.green_space.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${photo.green_space.species_ru || 'green space'}`}
                  >
                    <LazyImage
                      src={photo.url}
                      alt={`${photo.green_space.species_ru || 'Green space'} in ${photo.green_space.city?.name_en || 'Unknown'}`}
                      className="w-full h-64 object-cover"
                      placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {photo.green_space.species_ru}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {photo.green_space.city?.name_en || 'Unknown'}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(photo.uploaded_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

