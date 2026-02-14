import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { statisticsApi, OverviewStats, CityStats, TrendsResponse, SpeciesDistribution } from '../../services/statisticsApi';
import { citiesApi } from '../../services/citiesApi';
import { TrendingUp, TreePine, MapPin, Leaf, Download, Calendar, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { showError } from '../../utils/toastHelpers';
import ChartCard from './ChartCard';

const COLORS = {
  alive: '#10b981',
  attention_needed: '#f59e0b',
  dead: '#ef4444',
  removed: '#6b7280',
  tree: '#059669',
  park: '#0891b2',
  alley: '#7c3aed',
  garden: '#ec4899',
};


export default function StatisticsDashboard() {
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [cityStats, setCityStats] = useState<CityStats | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [speciesDistribution, setSpeciesDistribution] = useState<SpeciesDistribution[]>([]);
  const [cities, setCities] = useState<Array<{ id: string; name_ru: string; name_en: string }>>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      loadCityStats(selectedCityId);
    } else {
      setCityStats(null);
    }
  }, [selectedCityId]);

  useEffect(() => {
    loadTrends();
  }, [selectedYear, selectedCityId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, citiesData, species] = await Promise.all([
        statisticsApi.getOverviewStats(),
        citiesApi.getCities(),
        statisticsApi.getSpeciesDistribution(),
      ]);

      setOverviewStats(overview);
      setCities(citiesData || []);
      setSpeciesDistribution(species);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load statistics';
      setError(errorMessage);
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCityStats = async (cityId: string) => {
    try {
      const stats = await statisticsApi.getCityStats(cityId);
      setCityStats(stats);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load city statistics';
      setError(errorMessage);
      showError(err);
    }
  };

  const loadTrends = async () => {
    try {
      const trendsData = await statisticsApi.getTrends(selectedYear, selectedCityId || undefined);
      setTrends(trendsData);
    } catch (err: any) {
      // Silently fail - trends will remain unchanged
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading statistics..." />
      </div>
    );
  }

  if (error && !overviewStats) {
    return (
      <ErrorMessage
        title="Failed to load statistics"
        message={error}
        onRetry={loadData}
        variant="fullscreen"
      />
    );
  }

  // Prepare chart data
  const statusData = overviewStats
    ? [
        { name: 'Alive', value: overviewStats.byStatus.alive, color: COLORS.alive },
        { name: 'Attention Needed', value: overviewStats.byStatus.attention_needed, color: COLORS.attention_needed },
        { name: 'Dead', value: overviewStats.byStatus.dead, color: COLORS.dead },
        { name: 'Removed', value: overviewStats.byStatus.removed, color: COLORS.removed },
      ].filter((item) => item.value > 0)
    : [];

  const typeData = overviewStats
    ? [
        { name: 'Tree', value: overviewStats.byType.tree, color: COLORS.tree },
        { name: 'Park', value: overviewStats.byType.park, color: COLORS.park },
        { name: 'Alley', value: overviewStats.byType.alley, color: COLORS.alley },
        { name: 'Garden', value: overviewStats.byType.garden, color: COLORS.garden },
      ].filter((item) => item.value > 0)
    : [];

  const cityData = overviewStats?.byCity || [];
  const yearlyTrends = trends?.yearly || [];
  const monthlyTrends = trends?.monthly || [];

  // Calculate survival rate
  const survivalRate =
    overviewStats && overviewStats.total > 0
      ? ((overviewStats.byStatus.alive / overviewStats.total) * 100).toFixed(1)
      : '0';

  // Get available years from trends
  const availableYears = yearlyTrends.map((t) => t.year);
  const minYear = availableYears.length > 0 ? Math.min(...availableYears) : new Date().getFullYear() - 5;
  const maxYear = availableYears.length > 0 ? Math.max(...availableYears) : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Statistics Dashboard</h1>
          <p className="mt-2 text-gray-600">Comprehensive analytics and insights</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City Filter</label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name_ru || city.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year for Trends</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
                  .reverse()
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {overviewStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Green Spaces</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{overviewStats.total.toLocaleString()}</div>
                </div>
                <TreePine className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Cities</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{overviewStats.totalCities}</div>
                </div>
                <MapPin className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Survival Rate</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">{survivalRate}%</div>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Alive</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">
                    {overviewStats.byStatus.alive.toLocaleString()}
                  </div>
                </div>
                <Leaf className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution Pie Chart */}
          <ChartCard title="Status Distribution">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </ChartCard>

          {/* Type Distribution Pie Chart */}
          <ChartCard title="Type Distribution">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </ChartCard>

          {/* Cities Bar Chart */}
          <ChartCard title="Green Spaces by City">
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </ChartCard>

          {/* Species Distribution */}
          <ChartCard title="Top Species">
            {speciesDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={speciesDistribution.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="species" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </ChartCard>
        </div>

        {/* Trends Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Yearly Trends */}
          <ChartCard title="Planting Trends by Year">
            {yearlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Total Planted" />
                  <Bar dataKey="alive" fill="#059669" name="Alive" />
                  <Bar dataKey="dead" fill="#ef4444" name="Dead" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </ChartCard>

          {/* Monthly Trends */}
          <ChartCard title={`Monthly Planting Trends (${selectedYear})`}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10b981" name="Total Planted" />
                  <Line type="monotone" dataKey="alive" stroke="#059669" name="Alive" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No monthly data available for {selectedYear}
              </div>
            )}
          </ChartCard>
        </div>

        {/* City-Specific Stats */}
        {cityStats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">City Statistics: {cityStats.city_name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alive:</span>
                    <span className="font-semibold text-green-600">{cityStats.byStatus.alive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attention Needed:</span>
                    <span className="font-semibold text-yellow-600">{cityStats.byStatus.attention_needed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dead:</span>
                    <span className="font-semibold text-red-600">{cityStats.byStatus.dead}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Removed:</span>
                    <span className="font-semibold text-gray-600">{cityStats.byStatus.removed}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Type Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trees:</span>
                    <span className="font-semibold">{cityStats.byType.tree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parks:</span>
                    <span className="font-semibold">{cityStats.byType.park}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alleys:</span>
                    <span className="font-semibold">{cityStats.byType.alley}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gardens:</span>
                    <span className="font-semibold">{cityStats.byType.garden}</span>
                  </div>
                </div>
              </div>
              {cityStats.byDistrict.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">District Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cityStats.byDistrict.map((district) => (
                      <div key={district.district_id} className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-600">{district.district_name}</div>
                        <div className="text-lg font-semibold text-gray-900">{district.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

