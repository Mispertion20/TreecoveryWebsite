import { ReactNode } from 'react';
import { Download } from 'lucide-react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  onExport?: () => void;
  className?: string;
}

export default function ChartCard({ title, children, onExport, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onExport && (
          <button
            onClick={onExport}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export chart"
            aria-label="Export chart"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

