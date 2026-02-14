import { GreenSpaceStatus } from '../../types/greenSpaces';
import { getStatusColor } from '../../services/mapService';

const STATUS_LABELS: Record<GreenSpaceStatus, string> = {
  alive: 'Alive',
  attention_needed: 'Attention Needed',
  dead: 'Dead',
  removed: 'Removed',
};

const STATUSES: GreenSpaceStatus[] = ['alive', 'attention_needed', 'dead', 'removed'];

interface MapLegendProps {
  className?: string;
}

export default function MapLegend({ className = '' }: MapLegendProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h3>
      <div className="space-y-2">
        {STATUSES.map((status) => {
          const color = getStatusColor(status);
          return (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700">{STATUS_LABELS[status]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

