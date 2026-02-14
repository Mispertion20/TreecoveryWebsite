import { useState } from 'react';
import { BarChart3, X } from 'lucide-react';

interface City {
  id: string;
  name_ru: string;
  name_en: string;
}

interface ComparisonToolProps {
  cities: City[];
  onCompare: (cityIds: string[]) => void;
  onClear: () => void;
  selectedCities: string[];
}

export default function ComparisonTool({
  cities,
  onCompare,
  onClear,
  selectedCities,
}: ComparisonToolProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCities);

  const handleCityToggle = (cityId: string) => {
    setTempSelection((prev) => {
      if (prev.includes(cityId)) {
        return prev.filter((id) => id !== cityId);
      }
      if (prev.length < 3) {
        // Limit to 3 cities for comparison
        return [...prev, cityId];
      }
      return prev;
    });
  };

  const handleApply = () => {
    if (tempSelection.length > 0) {
      onCompare(tempSelection);
    }
  };

  const hasComparison = selectedCities.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Compare Cities</h3>
        </div>
        {hasComparison && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {cities.map((city) => {
            const isSelected = tempSelection.includes(city.id);
            return (
              <button
                key={city.id}
                onClick={() => handleCityToggle(city.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-green-50 border-green-500 text-green-900'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={!isSelected && tempSelection.length >= 3}
              >
                {city.name_ru || city.name_en}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-gray-600">
            {tempSelection.length > 0
              ? `${tempSelection.length} city${tempSelection.length > 1 ? 'ies' : ''} selected`
              : 'Select up to 3 cities to compare'}
          </p>
          <button
            onClick={handleApply}
            disabled={tempSelection.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

