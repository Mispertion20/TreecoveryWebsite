import { supabaseAdmin } from '../config/supabase';
import { GreenSpaceType, GreenSpaceStatus } from '../types/database';

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

export interface SpeciesDistribution {
  species: string;
  count: number;
  percentage: number;
}

/**
 * Get overview statistics for all green spaces
 * OPTIMIZED: Uses database function to eliminate N+1 queries
 */
export async function getOverviewStats(cityId?: string): Promise<OverviewStats> {
  // Use optimized database function instead of multiple queries
  const { data, error } = await supabaseAdmin.rpc('get_overview_stats', {
    p_city_id: cityId || null,
  });

  if (error) {
    throw new Error(`Failed to fetch overview stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    // Return empty stats if no data
    return {
      total: 0,
      byStatus: { alive: 0, attention_needed: 0, dead: 0, removed: 0 },
      byType: { tree: 0, park: 0, alley: 0, garden: 0 },
      byCity: [],
      totalCities: 0,
    };
  }

  const stats = data[0];

  // If cityId is provided, get city data
  let byCity: Array<{ city_id: string; city_name: string; count: number }> = [];
  let totalCities = 0;

  if (!cityId) {
    // Get city breakdown from materialized view
    const { data: cityStats, error: cityError } = await supabaseAdmin
      .from('mv_city_statistics')
      .select('city_id, name_en, total_green_spaces')
      .order('total_green_spaces', { ascending: false });

    if (!cityError && cityStats) {
      byCity = cityStats.map((city: any) => ({
        city_id: city.city_id,
        city_name: city.name_en,
        count: city.total_green_spaces,
      }));
      totalCities = cityStats.length;
    }
  }

  return {
    total: Number(stats.total),
    byStatus: {
      alive: Number(stats.alive),
      attention_needed: Number(stats.attention_needed),
      dead: Number(stats.dead),
      removed: Number(stats.removed),
    },
    byType: {
      tree: Number(stats.tree_count),
      park: Number(stats.park_count),
      alley: Number(stats.alley_count),
      garden: Number(stats.garden_count),
    },
    byCity,
    totalCities,
  };
}

/**
 * Get city-specific statistics
 * OPTIMIZED: Uses database function for single-query aggregation
 */
export async function getCityStats(cityId: string): Promise<CityStats> {
  // Use optimized database function
  const { data, error } = await supabaseAdmin.rpc('get_city_stats', {
    p_city_id: cityId,
  });

  if (error) {
    throw new Error(`Failed to fetch city stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`City not found: ${cityId}`);
  }

  const stats = data[0];

  // Get districts breakdown
  const { data: districtsData, error: districtsError } = await supabaseAdmin
    .from('green_spaces')
    .select('district_id, districts!left(name_en, name_ru)')
    .eq('city_id', cityId)
    .not('district_id', 'is', null);

  const districtMap = new Map<string, { name: string; count: number }>();
  districtsData?.forEach((gs: any) => {
    if (gs.district_id && gs.districts) {
      const districtName = gs.districts.name_en || gs.districts.name_ru || 'Unknown';
      const current = districtMap.get(gs.district_id) || { name: districtName, count: 0 };
      districtMap.set(gs.district_id, { name: districtName, count: current.count + 1 });
    }
  });

  const byDistrict = Array.from(districtMap.entries()).map(([district_id, info]) => ({
    district_id,
    district_name: info.name,
    count: info.count,
  }));

  return {
    city_id: stats.city_id,
    city_name: stats.city_name_en || stats.city_name_ru || stats.city_name_kz,
    total: Number(stats.total_green_spaces),
    byStatus: {
      alive: Number(stats.alive_count),
      attention_needed: Number(stats.attention_needed_count),
      dead: Number(stats.dead_count),
      removed: Number(stats.removed_count),
    },
    byType: {
      tree: Number(stats.tree_count),
      park: Number(stats.park_count),
      alley: 0, // Not in function result, would need to add
      garden: 0, // Not in function result, would need to add
    },
    byDistrict,
  };
}

/**
 * Get planting trends over time
 */
export async function getTrends(year?: number, cityId?: string): Promise<{
  yearly: TrendData[];
  monthly: TrendData[];
}> {
  let query = supabaseAdmin
    .from('green_spaces')
    .select('planting_date, status');

  if (cityId) {
    query = query.eq('city_id', cityId);
  }

  if (year) {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    query = query.gte('planting_date', yearStart).lte('planting_date', yearEnd);
  }

  const { data, error } = await query.order('planting_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch trends: ${error.message}`);
  }

  // Process yearly trends
  const yearlyMap = new Map<number, { count: number; alive: number; dead: number; removed: number }>();
  data?.forEach((gs: any) => {
    const plantingDate = new Date(gs.planting_date);
    const year = plantingDate.getFullYear();
    const current = yearlyMap.get(year) || { count: 0, alive: 0, dead: 0, removed: 0 };
    current.count += 1;
    if (gs.status === 'alive') current.alive += 1;
    if (gs.status === 'dead') current.dead += 1;
    if (gs.status === 'removed') current.removed += 1;
    yearlyMap.set(year, current);
  });

  const yearly: TrendData[] = Array.from(yearlyMap.entries())
    .map(([year, stats]) => ({
      year,
      count: stats.count,
      alive: stats.alive,
      dead: stats.dead,
      removed: stats.removed,
    }))
    .sort((a, b) => a.year - b.year);

  // Process monthly trends (only if year is specified)
  const monthly: TrendData[] = [];
  if (year) {
    const monthlyMap = new Map<number, { count: number; alive: number; dead: number; removed: number }>();
    data?.forEach((gs: any) => {
      const plantingDate = new Date(gs.planting_date);
      if (plantingDate.getFullYear() === year) {
        const month = plantingDate.getMonth() + 1; // 1-12
        const current = monthlyMap.get(month) || { count: 0, alive: 0, dead: 0, removed: 0 };
        current.count += 1;
        if (gs.status === 'alive') current.alive += 1;
        if (gs.status === 'dead') current.dead += 1;
        if (gs.status === 'removed') current.removed += 1;
        monthlyMap.set(month, current);
      }
    });

    monthly.push(
      ...Array.from(monthlyMap.entries())
        .map(([month, stats]) => ({
          year,
          month,
          count: stats.count,
          alive: stats.alive,
          dead: stats.dead,
          removed: stats.removed,
        }))
        .sort((a, b) => (a.month || 0) - (b.month || 0))
    );
  }

  return { yearly, monthly };
}

/**
 * Get species distribution
 */
export async function getSpeciesDistribution(cityId?: string, limit: number = 10): Promise<SpeciesDistribution[]> {
  let query = supabaseAdmin
    .from('green_spaces')
    .select('species_ru, species_en, species_kz');

  if (cityId) {
    query = query.eq('city_id', cityId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch species distribution: ${error.message}`);
  }

  const total = count || 0;
  if (total === 0) {
    return [];
  }

  // Count species
  const speciesMap = new Map<string, number>();
  data?.forEach((gs: any) => {
    const species = gs.species_ru || gs.species_en || gs.species_kz || 'Unknown';
    const current = speciesMap.get(species) || 0;
    speciesMap.set(species, current + 1);
  });

  // Convert to array and sort by count
  const distribution = Array.from(speciesMap.entries())
    .map(([species, count]) => ({
      species,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return distribution;
}

