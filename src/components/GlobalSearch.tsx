import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, MapPin, Calendar, Tag } from 'lucide-react';
import { greenSpacesApi } from '../services/greenSpacesApi';
import { citiesApi } from '../services/citiesApi';

interface SearchResult {
  id: string;
  type: 'green_space' | 'city';
  title: string;
  subtitle?: string;
  location?: string;
  url: string;
}

interface SearchFilters {
  city_id?: string;
  district_id?: string;
  status?: string;
  type?: string;
  species_ru?: string;
  planting_date_from?: string;
  planting_date_to?: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [cities, setCities] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await citiesApi.getCities();
        setCities(data || []);
      } catch (error) {
        console.error('Failed to load cities:', error);
      }
    };
    loadCities();

    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchFilters: any = { ...filters };
      if (searchQuery.trim()) {
        searchFilters.search = searchQuery.trim();
      }

      const response = await greenSpacesApi.getGreenSpaces({
        ...searchFilters,
        limit: 10,
        page: 1,
      });

      const searchResults: SearchResult[] = [];

      // Add green spaces results
      response.data.forEach((gs: any) => {
        searchResults.push({
          id: gs.id,
          type: 'green_space',
          title: gs.species_ru || gs.species_en || 'Unknown Species',
          subtitle: `${gs.type} • ${gs.status}`,
          location: gs.city?.name_en || gs.district?.name_en,
          url: `/spaces/${gs.id}`,
        });
      });

      // Add city matches if query matches city names
      if (searchQuery.trim()) {
        cities.forEach((city) => {
          const cityNameLower = city.name_en?.toLowerCase() || '';
          const queryLower = searchQuery.toLowerCase();
          if (cityNameLower.includes(queryLower)) {
            searchResults.push({
              id: city.id,
              type: 'city',
              title: city.name_en || city.name_ru,
              subtitle: 'City',
              url: `/map?city=${city.id}`,
            });
          }
        });
      }

      setResults(searchResults);

      // Save to search history
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        const newHistory = [searchQuery.trim(), ...searchHistory].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400"
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Mobile Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-neutral-charcoal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open search"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-start justify-center pt-20 md:pt-32 px-4">
          <div
            ref={searchRef}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search green spaces, cities..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                autoFocus
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-primary-emerald text-white'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Toggle filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <select
                      value={filters.city_id || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, city_id: e.target.value || undefined })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">All Cities</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name_en || city.name_ru}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value || undefined })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="alive">Alive</option>
                      <option value="attention_needed">Attention Needed</option>
                      <option value="dead">Dead</option>
                      <option value="removed">Removed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={filters.type || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, type: e.target.value || undefined })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {result.type === 'green_space' ? (
                          <Tag className="w-5 h-5 text-primary-emerald mt-0.5 flex-shrink-0" />
                        ) : (
                          <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {result.subtitle}
                            </p>
                          )}
                          {result.location && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {result.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() || Object.keys(filters).length > 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              ) : searchHistory.length > 0 ? (
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Recent Searches
                  </p>
                  <div className="space-y-1">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Start typing to search...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

