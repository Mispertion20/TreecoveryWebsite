import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MapContainer from '../components/map/MapContainer';
import FilterSidebar from '../components/map/FilterSidebar';
import MapLegend from '../components/map/MapLegend';
import { useGreenSpaces } from '../hooks/useGreenSpaces';
import type { City, MapBounds } from '../services/mapService';
import { Download, Filter } from 'lucide-react';
import { exportApi } from '../services/exportApi';
import { GreenSpaceFilters } from '../services/greenSpacesApi';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { showError, showSuccess, SUCCESS_MESSAGES, ERROR_MESSAGE_STRINGS } from '../utils/toastHelpers';

export default function MapPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<GreenSpaceFilters>({});
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>();
  const [mapBounds, setMapBounds] = useState<MapBounds | undefined>();
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine if we should use API filters
  const hasFilters = filters && Object.keys(filters).length > 0;
  const useApiFilters = hasFilters || !!filters.city_id;

  const { greenSpaces, cities, loading, error, refetch, pagination } = useGreenSpaces({
    cityId: selectedCityId || filters.city_id,
    bounds: mapBounds,
    enabled: true,
    filters,
    useApiFilters,
  });

  const handleCityClick = useCallback((city: City) => {
    setSelectedCityId(city.id);
    setFilters((prev) => ({ ...prev, city_id: city.id }));
    // Clear bounds filter when selecting a city
    setMapBounds(undefined);
  }, []);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    // Only update bounds if no city is selected and no filters
    if (!selectedCityId && !hasFilters) {
      setMapBounds(bounds);
    }
  }, [selectedCityId, hasFilters]);

  const handleClearCityFilter = useCallback(() => {
    setSelectedCityId(undefined);
    setMapBounds(undefined);
    setFilters((prev) => {
      const { city_id, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleFiltersChange = useCallback((newFilters: GreenSpaceFilters) => {
    setFilters(newFilters);
    // Clear selectedCityId if city filter is removed
    if (!newFilters.city_id && selectedCityId) {
      setSelectedCityId(undefined);
    } else if (newFilters.city_id && newFilters.city_id !== selectedCityId) {
      setSelectedCityId(newFilters.city_id);
    }
  }, [selectedCityId]);

  const handleExport = useCallback(async () => {
    if (!isAuthenticated) {
      showError(ERROR_MESSAGE_STRINGS.UNAUTHORIZED);
      return;
    }

    try {
      setExporting(true);
      const exportFilters: GreenSpaceFilters = { ...filters };
      if (selectedCityId && !exportFilters.city_id) {
        exportFilters.city_id = selectedCityId;
      }
      await exportApi.exportAndDownload(exportFilters, 'csv');
      showSuccess(SUCCESS_MESSAGES.EXPORTED);
    } catch (error) {
      showError(error);
    } finally {
      setExporting(false);
    }
  }, [filters, selectedCityId, isAuthenticated]);

  // Determine initial center and zoom based on selected city
  const getInitialCenter = (): [number, number] => {
    if (selectedCityId && cities.length > 0) {
      const city = cities.find((c) => c.id === selectedCityId);
      if (city) {
        return [city.center_lat, city.center_lng];
      }
    }
    return [48.0, 66.0]; // Kazakhstan center
  };

  const getInitialZoom = (): number => {
    if (selectedCityId) {
      return 12; // Zoomed in for city view
    }
    return 6; // Zoomed out for country view
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-emerald focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-emerald"
      >
        Skip to main content
      </a>
      <Navbar />
      {/* Map Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interactive Map</h1>
            <p className="text-sm text-gray-600 mt-1">
              Explore green spaces across Kazakhstan
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle filters"
              aria-expanded={sidebarOpen}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !isAuthenticated}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-emerald rounded-lg hover:bg-primary-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isAuthenticated ? t('map.loginToExport') : ''}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? t('map.exporting') : t('map.exportCSV')}
            </button>
            {(selectedCityId || hasFilters) && (
              <button
                onClick={handleClearCityFilter}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('map.clearFilters')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex overflow-hidden min-h-0">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          cities={cities}
          totalResults={pagination?.total || greenSpaces.length}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Map Container */}
        <div className="flex-1 relative min-h-0" style={{ minHeight: 0 }}>
          {loading && greenSpaces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
              <SkeletonLoader type="map" className="w-full h-full" />
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
              <ErrorMessage
                title="Error loading map"
                message={error.message}
                onRetry={refetch}
              />
            </div>
          )}

          <div className="absolute inset-0 w-full h-full">
            <MapContainer
              greenSpaces={greenSpaces}
              cities={cities}
              onCityClick={handleCityClick}
              selectedCityId={selectedCityId || filters.city_id}
              initialCenter={getInitialCenter()}
              initialZoom={getInitialZoom()}
              onBoundsChange={handleBoundsChange}
            />
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 right-4 z-[1000]">
            <MapLegend />
          </div>
        </div>
      </main>

      {/* Stats Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>
              <span className="font-medium text-gray-900">
                {pagination?.total || greenSpaces.length}
              </span>{' '}
              green spaces
            </span>
            <span>
              <span className="font-medium text-gray-900">{cities.length}</span> cities
            </span>
          </div>
          {(selectedCityId || filters.city_id) && cities.length > 0 && (
            <span className="text-gray-500">
              Viewing:{' '}
              {cities.find((c) => c.id === (selectedCityId || filters.city_id))?.name_en}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

