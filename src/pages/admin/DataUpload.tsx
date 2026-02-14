import { useState } from 'react';
import CSVUploader from '../../components/admin/CSVUploader';
import EnhancedCSVUploader from '../../components/admin/EnhancedCSVUploader';
import AdminLayout from '../../components/admin/AdminLayout';

export default function DataUpload() {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Data Upload</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Standard</span>
            <button
              onClick={() => setUseEnhanced(!useEnhanced)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                useEnhanced ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  useEnhanced ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">Enhanced</span>
          </div>
        </div>
        {useEnhanced ? <EnhancedCSVUploader /> : <CSVUploader />}
      </div>
    </AdminLayout>
  );
}

