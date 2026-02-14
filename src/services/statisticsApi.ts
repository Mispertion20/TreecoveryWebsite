import api from './api';

export interface OverviewStats {
  total: number;
  byStatus: {
    alive: number;
    attention_needed: number;
    dead: number;
    removed: number;
  };
  byType: {
    tree: number;
    park: number;
    alley: number;
    garden: number;
  };
  byCity: Array<{
    city_id: string;
    city_name: string;
    count: number;
  }>;
  totalCities: number;
}

export interface CityStats {
  city_id: string;
  city_name: string;
  total: number;
  byStatus: {
    alive: number;
    attention_needed: number;
    dead: number;
    removed: number;
  };
  byType: {
    tree: number;
    park: number;
    alley: number;
    garden: number;
  };
  byDistrict: Array<{
    district_id: string;
    district_name: string;
    count: number;
  }>;
}

export interface TrendData {
  year: number;
  month?: number;
  count: number;
  alive: number;
  dead: number;
  removed: number;
}

export interface TrendsResponse {
  yearly: TrendData[];
  monthly: TrendData[];
}

export interface SpeciesDistribution {
  species: string;
  count: number;
  percentage: number;
}

export const statisticsApi = {
  /**
   * Get overview statistics
   */
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await api.get('/statistics/overview');
    return response.data;
  },

  /**
   * Get city-specific statistics
   */
  async getCityStats(cityId: string): Promise<CityStats> {
    const response = await api.get(`/statistics/city/${cityId}`);
    return response.data;
  },

  /**
   * Get planting trends
   * @param year Optional year filter
   * @param cityId Optional city filter
   */
  async getTrends(year?: number, cityId?: string): Promise<TrendsResponse> {
    const params: Record<string, string> = {};
    if (year) params.year = year.toString();
    if (cityId) params.cityId = cityId;
    
    const response = await api.get('/statistics/trends', { params });
    return response.data;
  },

  /**
   * Get species distribution
   * @param cityId Optional city filter
   * @param limit Maximum number of species to return (default 10, max 50)
   */
  async getSpeciesDistribution(cityId?: string, limit: number = 10): Promise<SpeciesDistribution[]> {
    const params: Record<string, string> = {};
    if (cityId) params.cityId = cityId;
    if (limit) params.limit = limit.toString();
    
    const response = await api.get('/statistics/species', { params });
    return response.data;
  },
};

