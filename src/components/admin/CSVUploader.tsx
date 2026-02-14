import { useState, useRef } from 'react';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import { Upload, FileText, CheckCircle2, XCircle, Download } from 'lucide-react';
import { showError, showSuccess, showLoading, showPromise, SUCCESS_MESSAGES } from '../../utils/toastHelpers';

interface UploadResult {
  success: boolean;
  message: string;
  count?: number;
  invalidRows?: Array<{ row: number; errors: string[] }>;
}

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      showError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      
      // Parse preview (first 5 rows)
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const previewData = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        setPreview(previewData);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!csvContent) {
      showError('Please select a CSV file first');
      return;
    }

    try {
      setUploading(true);
      setResult(null);

      const response = await showPromise(
        greenSpacesApi.bulkUpload(csvContent),
        {
          loading: 'Uploading CSV file...',
          success: (data) => `Successfully uploaded ${data.count} green spaces`,
          error: (error: any) => {
            const errorData = error.response?.data;
            if (errorData?.invalid_rows) {
              return `Validation failed: ${errorData.invalid_count} invalid rows found`;
            }
            return errorData?.error || 'Failed to upload CSV file';
          },
        }
      );

      setResult({
        success: true,
        message: `Successfully uploaded ${response.count} green spaces`,
        count: response.count,
      });

      // Reset form
      setFile(null);
      setCsvContent('');
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      
      if (errorData?.invalid_rows) {
        setResult({
          success: false,
          message: `Validation failed: ${errorData.invalid_count} invalid rows found`,
          invalidRows: errorData.invalid_rows,
        });
      } else {
        setResult({
          success: false,
          message: errorData?.error || 'Failed to upload CSV file',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await greenSpacesApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'green-spaces-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CSV Bulk Upload</h2>
        <p className="text-gray-600">
          Upload a CSV file to bulk import green spaces. Make sure your CSV matches the required format.
        </p>
      </div>

      {/* Download Template Button */}
      <div className="mb-6">
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV Template
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="csv-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
              >
                <span>Upload a file</span>
                <input
                  id="csv-upload"
                  ref={fileInputRef}
                  name="csv-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">CSV files only</p>
          </div>
        </div>
        {file && (
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-2" />
            {file.name}
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0] || {}).map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!csvContent || uploading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </>
        )}
      </button>

      {/* Result Message */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-md ${
            result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message}
              </p>
              {result.invalidRows && result.invalidRows.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-800 mb-2">Validation Errors:</p>
                  <div className="space-y-2">
                    {result.invalidRows.slice(0, 5).map((invalid, index) => (
                      <div key={index} className="text-xs text-red-700 bg-red-100 p-2 rounded">
                        <p className="font-medium">Row {invalid.row}:</p>
                        <ul className="list-disc list-inside mt-1">
                          {invalid.errors.map((error, errIndex) => (
                            <li key={errIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {result.invalidRows.length > 5 && (
                      <p className="text-xs text-red-700">
                        ... and {result.invalidRows.length - 5} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

