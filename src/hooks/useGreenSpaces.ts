import { useState, useEffect } from 'react';
import { fetchGreenSpaces, fetchGreenSpacesByCity, fetchCities, type GreenSpaceWithCity, type City, type MapBounds } from '../services/mapService';
import { greenSpacesApi, type GreenSpaceFilters } from '../services/greenSpacesApi';
import { citiesApi } from '../services/citiesApi';

export interface UseGreenSpacesOptions {
  cityId?: string;
  bounds?: MapBounds;
  enabled?: boolean;
  filters?: GreenSpaceFilters;
  useApiFilters?: boolean; // If true, use API filters instead of mapService
}

export interface UseGreenSpacesReturn {
  greenSpaces: GreenSpaceWithCity[];
  cities: City[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch green spaces and cities data
 */
export function useGreenSpaces(options: UseGreenSpacesOptions = {}): UseGreenSpacesReturn {
  const { cityId, bounds, enabled = true, filters, useApiFilters = false } = options;
  
  const [greenSpaces, setGreenSpaces] = useState<GreenSpaceWithCity[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseGreenSpacesReturn['pagination']>();

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch cities (only once)
      if (cities.length === 0) {
        try {
          const citiesData = await citiesApi.getCities();
          setCities(citiesData || []);
        } catch (err) {
          // Fallback to mapService if API fails
          const citiesData = await fetchCities();
          setCities(citiesData);
        }
      }

      // Use API filters if specified or if filters are provided
      if (useApiFilters || (filters && Object.keys(filters).length > 0)) {
        const apiFilters: GreenSpaceFilters = {
          ...filters,
          city_id: cityId || filters?.city_id,
          page: filters?.page || 1,
          limit: filters?.limit || 1000, // Large limit for map view
        };

        const response = await greenSpacesApi.getGreenSpaces(apiFilters);
        setGreenSpaces(response.data || []);
        setPagination(response.pagination);
      } else {
        // Use mapService for bounds-based fetching (no filters)
        let greenSpacesData: GreenSpaceWithCity[];
        if (cityId) {
          greenSpacesData = await fetchGreenSpacesByCity(cityId);
        } else if (bounds) {
          greenSpacesData = await fetchGreenSpaces(bounds);
        } else {
          // Fetch all green spaces (may be slow for large datasets)
          greenSpacesData = await fetchGreenSpaces();
        }
        setGreenSpaces(greenSpacesData);
        setPagination(undefined);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch green spaces');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, enabled, useApiFilters, filters?.city_id, filters?.district_id, filters?.status, filters?.type, filters?.species_ru, filters?.planting_date_from, filters?.planting_date_to, filters?.year, filters?.search, filters?.page, filters?.limit]);

  // Refetch when bounds change (with debounce) - only if not using API filters
  useEffect(() => {
    if (!bounds || !enabled || useApiFilters || (filters && Object.keys(filters).length > 0)) return;

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds?.north, bounds?.south, bounds?.east, bounds?.west, enabled, useApiFilters]);

  return {
    greenSpaces,
    cities,
    loading,
    error,
    refetch: fetchData,
    pagination,
  };
}

