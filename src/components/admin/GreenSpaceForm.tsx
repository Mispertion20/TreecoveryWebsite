import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import { citiesApi } from '../../services/citiesApi';
import { Save, X, Loader2 } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import type { GreenSpaceType, GreenSpaceStatus } from '../../types/greenSpaces';
import { showPromise, showError, SUCCESS_MESSAGES } from '../../utils/toastHelpers';

const schema = yup.object({
  type: yup.string().oneOf(['tree', 'park', 'alley', 'garden']).required('Type is required'),
  species_ru: yup.string().required('Russian species name is required'),
  species_kz: yup.string(),
  species_en: yup.string(),
  species_scientific: yup.string(),
  latitude: yup
    .number()
    .required('Latitude is required')
    .min(40.9, 'Must be within Kazakhstan bounds')
    .max(55.4, 'Must be within Kazakhstan bounds'),
  longitude: yup
    .number()
    .required('Longitude is required')
    .min(46.5, 'Must be within Kazakhstan bounds')
    .max(87.4, 'Must be within Kazakhstan bounds'),
  city_id: yup.string().required('City is required'),
  district_id: yup.string(),
  planting_date: yup
    .date()
    .required('Planting date is required')
    .max(new Date(), 'Planting date cannot be in the future'),
  status: yup.string().oneOf(['alive', 'attention_needed', 'dead', 'removed']).required('Status is required'),
  notes: yup.string(),
  responsible_org: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

interface GreenSpaceFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GreenSpaceForm({ initialData, onSuccess, onCancel }: GreenSpaceFormProps) {
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: initialData || {
      type: 'tree',
      status: 'alive',
    },
  });

  const watchedCityId = watch('city_id');

  useEffect(() => {
    loadCities();
    if (initialData?.city_id) {
      setSelectedCityId(initialData.city_id);
      loadDistricts(initialData.city_id);
    }
  }, []);

  useEffect(() => {
    if (watchedCityId && watchedCityId !== selectedCityId) {
      setSelectedCityId(watchedCityId);
      loadDistricts(watchedCityId);
    }
  }, [watchedCityId]);

  const loadCities = async () => {
    try {
      const data = await citiesApi.getCities();
      setCities(data);
    } catch (error) {
      // Silently fail - cities will be empty
      setCities([]);
    }
  };

  const loadDistricts = async (cityId: string) => {
    try {
      const data = await citiesApi.getCityDistricts(cityId);
      setDistricts(data);
    } catch (error) {
      setDistricts([]);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // Convert form data to API types
      const apiData = {
        ...data,
        type: data.type as GreenSpaceType,
        status: data.status as GreenSpaceStatus,
      };
      
      if (initialData?.id) {
        await showPromise(
          greenSpacesApi.updateGreenSpace(initialData.id, apiData),
          {
            loading: 'Updating green space...',
            success: SUCCESS_MESSAGES.UPDATED,
            error: (error: any) => error.response?.data?.error || 'Failed to update green space',
          }
        );
      } else {
        await showPromise(
          greenSpacesApi.createGreenSpace(apiData),
          {
            loading: 'Creating green space...',
            success: SUCCESS_MESSAGES.CREATED,
            error: (error: any) => error.response?.data?.error || 'Failed to create green space',
          }
        );
      }

      onSuccess?.();
    } catch (error) {
      // Error already handled by showPromise
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="tree">Tree</option>
            <option value="park">Park</option>
            <option value="alley">Alley</option>
            <option value="garden">Garden</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="alive">Alive</option>
            <option value="attention_needed">Attention Needed</option>
            <option value="dead">Dead</option>
            <option value="removed">Removed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Species RU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species (Russian) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('species_ru')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.species_ru && (
            <p className="mt-1 text-sm text-red-600">{errors.species_ru.message}</p>
          )}
        </div>

        {/* Species KZ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species (Kazakh)
          </label>
          <input
            type="text"
            {...register('species_kz')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Species EN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species (English)
          </label>
          <input
            type="text"
            {...register('species_en')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Scientific Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scientific Name
          </label>
          <input
            type="text"
            {...register('species_scientific')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Latitude */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            {...register('latitude', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
          )}
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            {...register('longitude', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <select
            {...register('city_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name_en} ({city.name_ru})
              </option>
            ))}
          </select>
          {errors.city_id && (
            <p className="mt-1 text-sm text-red-600">{errors.city_id.message}</p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            {...register('district_id')}
            disabled={!selectedCityId || districts.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            <option value="">Select a district</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name_en} ({district.name_ru})
              </option>
            ))}
          </select>
        </div>

        {/* Planting Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planting Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('planting_date', { valueAsDate: true })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.planting_date && (
            <p className="mt-1 text-sm text-red-600">{errors.planting_date.message}</p>
          )}
        </div>

        {/* Responsible Org */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsible Organization
          </label>
          <input
            type="text"
            {...register('responsible_org')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Photo Upload */}
      {initialData?.id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
          <PhotoUpload greenSpaceId={initialData.id} />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData?.id ? 'Update' : 'Create'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

