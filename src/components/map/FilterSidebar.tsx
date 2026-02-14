import { useState, useEffect, useCallback } from 'react';
import { X, Filter, Search, Calendar, XCircle } from 'lucide-react';
import { GreenSpaceFilters } from '../../services/greenSpacesApi';
import { citiesApi } from '../../services/citiesApi';
import { GreenSpaceStatus, GreenSpaceType, City } from '../../types/greenSpaces';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export interface District {
  id: string;
  city_id: string;
  name_ru: string;
  name_kz: string;
  name_en: string;
}

interface FilterSidebarProps {
  filters: GreenSpaceFilters;
  onFiltersChange: (filters: GreenSpaceFilters) => void;
  cities: City[];
  totalResults?: number;
  isOpen?: boolean;
  onToggle?: () => void;
}

const STATUS_OPTIONS: { value: GreenSpaceStatus; label: string }[] = [
  { value: 'alive', label: 'Alive' },
  { value: 'attention_needed', label: 'Attention Needed' },
  { value: 'dead', label: 'Dead' },
  { value: 'removed', label: 'Removed' },
];

const TYPE_OPTIONS: { value: GreenSpaceType; label: string }[] = [
  { value: 'tree', label: 'Tree' },
  { value: 'park', label: 'Park' },
  { value: 'alley', label: 'Alley' },
  { value: 'garden', label: 'Garden' },
];

export default function FilterSidebar({
  filters,
  onFiltersChange,
  cities,
  totalResults,
  isOpen: controlledIsOpen,
  onToggle,
}: FilterSidebarProps) {
  const { isAuthenticated } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (filters.city_id) {
        setLoadingDistricts(true);
        try {
          const data = await citiesApi.getCityDistricts(filters.city_id);
          setDistricts(data || []);
        } catch (error) {
          // Silently fail - districts will be empty
          setDistricts([]);
        } finally {
          setLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [filters.city_id]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        onFiltersChange({ ...filters, search: searchQuery || undefined });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFilterChange = useCallback(
    (key: keyof GreenSpaceFilters, value: any) => {
      onFiltersChange({ ...filters, [key]: value || undefined });
    },
    [filters, onFiltersChange]
  );

  const handleStatusToggle = useCallback(
    (status: GreenSpaceStatus) => {
      const currentStatus = filters.status;
      if (currentStatus === status) {
        handleFilterChange('status', undefined);
      } else {
        handleFilterChange('status', status);
      }
    },
    [filters.status, handleFilterChange]
  );

  const handleTypeToggle = useCallback(
    (type: GreenSpaceType) => {
      const currentTypes = filters.type ? [filters.type] : [];
      if (currentTypes.includes(type)) {
        handleFilterChange('type', undefined);
      } else {
        handleFilterChange('type', type);
      }
    },
    [filters.type, handleFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
    setSearchQuery('');
  }, [onFiltersChange]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.city_id) count++;
    if (filters.district_id) count++;
    if (filters.status) count++;
    if (filters.type) count++;
    if (filters.species_ru) count++;
    if (filters.planting_date_from || filters.planting_date_to) count++;
    if (filters.year) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
          isOpen
            ? 'w-80 md:w-80 translate-x-0'
            : 'w-0 -translate-x-full md:translate-x-0'
        } overflow-hidden flex flex-col fixed md:relative h-full z-50 md:z-auto`}
        role="complementary"
        aria-label="Filter sidebar"
      >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-emerald" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-emerald text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Guest User Message */}
      {!isAuthenticated && (
        <div className="p-4 bg-primary-sage/10 border-b border-primary-sage/20">
          <p className="text-sm text-gray-700 mb-2">
            Register for full access to filters and reports
          </p>
          <Link
            to="/register"
            className="text-sm text-primary-emerald hover:text-primary-forest font-medium underline"
          >
            Create Account →
          </Link>
        </div>
      )}

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or species..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={filters.city_id || ''}
            onChange={(e) => {
              handleFilterChange('city_id', e.target.value);
              handleFilterChange('district_id', undefined); // Clear district when city changes
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        {filters.city_id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>
            <select
              value={filters.district_id || ''}
              onChange={(e) => handleFilterChange('district_id', e.target.value)}
              disabled={loadingDistricts}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Districts</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={filters.status === option.value}
                  onChange={() => handleStatusToggle(option.value)}
                  className="w-4 h-4 text-primary-emerald focus:ring-primary-emerald border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="space-y-2">
            {TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={filters.type === option.value}
                  onChange={() => handleTypeToggle(option.value)}
                  className="w-4 h-4 text-primary-emerald focus:ring-primary-emerald border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Species (for authenticated users only) */}
        {isAuthenticated && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Species
            </label>
            <input
              type="text"
              value={filters.species_ru || ''}
              onChange={(e) => handleFilterChange('species_ru', e.target.value)}
              placeholder="Enter species name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent"
            />
          </div>
        )}

        {/* Date Range (for authenticated users only) */}
        {isAuthenticated && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Planting Date Range
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={filters.planting_date_from || ''}
                  onChange={(e) =>
                    handleFilterChange('planting_date_from', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={filters.planting_date_to || ''}
                  onChange={(e) =>
                    handleFilterChange('planting_date_to', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Year (for authenticated users only) */}
        {isAuthenticated && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              value={filters.year || ''}
              onChange={(e) =>
                handleFilterChange('year', e.target.value || undefined)
              }
              placeholder="e.g., 2023"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-emerald focus:border-transparent"
            />
          </div>
        )}

        {/* Results Count */}
        {totalResults !== undefined && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{totalResults}</span> results
              found
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
    </>
  );
}

