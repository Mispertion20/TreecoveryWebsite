import { useQuery } from '@tanstack/react-query';
import { greenSpacesApi, type GreenSpaceFilters } from '../services/greenSpacesApi';
import { citiesApi } from '../services/citiesApi';
import { fetchGreenSpaces, fetchGreenSpacesByCity, fetchCities, type GreenSpaceWithCity, type City, type MapBounds } from '../services/mapService';

interface UseGreenSpacesQueryOptions {
  cityId?: string;
  bounds?: MapBounds;
  enabled?: boolean;
  filters?: GreenSpaceFilters;
  useApiFilters?: boolean;
}

/**
 * React Query hook for fetching green spaces with caching
 */
export function useGreenSpacesQuery(options: UseGreenSpacesQueryOptions = {}) {
  const { cityId, bounds, enabled = true, filters, useApiFilters = false } = options;

  // Query for cities (cached)
  const citiesQuery = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      try {
        return await citiesApi.getCities();
      } catch {
        return await fetchCities();
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled,
  });

  // Query for green spaces
  const greenSpacesQuery = useQuery({
    queryKey: [
      'greenSpaces',
      cityId,
      bounds,
      filters,
      useApiFilters,
    ],
    queryFn: async () => {
      if (useApiFilters || (filters && Object.keys(filters).length > 0)) {
        const apiFilters: GreenSpaceFilters = {
          ...filters,
          city_id: cityId || filters?.city_id,
          page: filters?.page || 1,
          limit: filters?.limit || 1000,
        };
        const response = await greenSpacesApi.getGreenSpaces(apiFilters);
        return {
          data: response.data || [],
          pagination: response.pagination,
        };
      } else {
        let greenSpacesData: GreenSpaceWithCity[];
        if (cityId) {
          greenSpacesData = await fetchGreenSpacesByCity(cityId);
        } else if (bounds) {
          greenSpacesData = await fetchGreenSpaces(bounds);
        } else {
          greenSpacesData = await fetchGreenSpaces();
        }
        return {
          data: greenSpacesData,
          pagination: undefined,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });

  return {
    greenSpaces: greenSpacesQuery.data?.data || [],
    cities: citiesQuery.data || [],
    loading: greenSpacesQuery.isLoading || citiesQuery.isLoading,
    error: greenSpacesQuery.error || citiesQuery.error,
    refetch: async () => {
      await Promise.all([greenSpacesQuery.refetch(), citiesQuery.refetch()]);
    },
    pagination: greenSpacesQuery.data?.pagination,
  };
}

