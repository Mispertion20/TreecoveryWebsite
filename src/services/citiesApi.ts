import api from './api';

export const citiesApi = {
  /**
   * Get all cities
   */
  async getCities() {
    const response = await api.get('/cities');
    return response.data;
  },

  /**
   * Get city by ID
   */
  async getCity(id: string) {
    const response = await api.get(`/cities/${id}`);
    return response.data;
  },

  /**
   * Get districts for a city
   */
  async getCityDistricts(cityId: string) {
    const response = await api.get(`/cities/${cityId}/districts`);
    return response.data;
  },
};

