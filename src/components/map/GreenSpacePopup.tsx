import { format } from 'date-fns';
import type { GreenSpaceWithCity } from '../../services/mapService';
import { getStatusLabel, getStatusColor } from '../../services/mapService';

interface GreenSpacePopupProps {
  greenSpace: GreenSpaceWithCity;
}

export default function GreenSpacePopup({ greenSpace }: GreenSpacePopupProps) {
  const statusColor = getStatusColor(greenSpace.status);
  const statusLabel = getStatusLabel(greenSpace.status);

  return (
    <div className="min-w-[250px] max-w-[350px] p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-bold text-gray-900">
            {greenSpace.species_en || greenSpace.species_ru}
          </h3>
          {greenSpace.species_scientific && (
            <p className="text-sm text-gray-600 italic">
              {greenSpace.species_scientific}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-gray-700">
            {statusLabel}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium text-gray-900 capitalize">
              {greenSpace.type}
            </span>
          </div>
          <div>
            <span className="text-gray-500">City:</span>
            <span className="ml-2 font-medium text-gray-900">
              {greenSpace.city?.name_en || 'Unknown'}
            </span>
          </div>
          {greenSpace.district && (
            <div className="col-span-2">
              <span className="text-gray-500">District:</span>
              <span className="ml-2 font-medium text-gray-900">
                {greenSpace.district.name_en}
              </span>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-gray-500">Planting Date:</span>
            <span className="ml-2 font-medium text-gray-900">
              {format(new Date(greenSpace.planting_date), 'MMM dd, yyyy')}
            </span>
          </div>
          {greenSpace.responsible_org && (
            <div className="col-span-2">
              <span className="text-gray-500">Organization:</span>
              <span className="ml-2 font-medium text-gray-900">
                {greenSpace.responsible_org}
              </span>
            </div>
          )}
        </div>

        {/* Coordinates */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Coordinates: {greenSpace.latitude.toFixed(6)}, {greenSpace.longitude.toFixed(6)}
          </p>
        </div>

        {/* Notes */}
        {greenSpace.notes && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {greenSpace.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

