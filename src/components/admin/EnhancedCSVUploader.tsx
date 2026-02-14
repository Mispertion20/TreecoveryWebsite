import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface ValidationResult {
  valid: Array<{
    data: any;
    errors: string[];
    warnings: string[];
    qualityScore: number;
  }>;
  invalid: Array<{ row: number; data: any; errors: string[]; warnings: string[] }>;
  duplicates: Array<{ row: number; duplicateOf: number; similarity: number; reason: string }>;
  qualityStats: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    totalRows: number;
  };
}

interface PreviewResult {
  isValid: boolean;
  errors: string[];
  rowCount: number;
  headers: string[];
}

export default function EnhancedCSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [minQualityScore, setMinQualityScore] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced validation
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const validateCSVContent = useCallback(async (content: string) => {
    if (!content || content.trim().length < 10) {
      setPreview(null);
      return;
    }

    try {
      setValidating(true);
      const previewResult = await greenSpacesApi.previewCSV(content);
      setPreview(previewResult);

      // If preview is valid, do full validation
      if (previewResult.isValid && previewResult.rowCount > 0) {
        const validationResult = await greenSpacesApi.validateCSV(content, true);
        setResult(validationResult);
      } else {
        setResult(null);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error('Validation failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setValidating(false);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setPreview(null);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);

      // Clear previous timeout
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }

      // Debounce validation
      const timeout = setTimeout(() => {
        validateCSVContent(content);
      }, 500);
      setValidationTimeout(timeout);
    };
    reader.readAsText(selectedFile);
  };

  const handleManualValidate = async () => {
    if (!csvContent) {
      toast.error('Please select a CSV file first');
      return;
    }

    await validateCSVContent(csvContent);
  };

  const handleUpload = async () => {
    if (!csvContent) {
      toast.error('Please select a CSV file first');
      return;
    }

    const uploadToast = toast.loading('Uploading CSV file with enhanced validation...');

    try {
      setUploading(true);
      setResult(null);

      const response = await greenSpacesApi.bulkUploadEnhanced(csvContent, {
        skipDuplicates,
        minQualityScore,
      });

      toast.success(
        `Successfully uploaded ${response.count} green spaces`,
        { id: uploadToast }
      );

      // Show validation summary
      if (response.validation_summary) {
        const summary = response.validation_summary;
        toast.success(
          `Upload complete: ${summary.valid_count} valid, ${summary.invalid_count} invalid, ${summary.duplicates_found} duplicates found`,
          { duration: 5000 }
        );
      }

      // Reset form
      setFile(null);
      setCsvContent('');
      setPreview(null);
      setResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.invalid_rows) {
        const errorMessage = `Validation failed: ${errorData.invalid_count} invalid rows found`;
        toast.error(errorMessage, { id: uploadToast });
        setResult({
          valid: [],
          invalid: errorData.invalid_rows,
          duplicates: errorData.duplicates || [],
          qualityStats: errorData.quality_stats || {
            averageScore: 0,
            minScore: 0,
            maxScore: 0,
            totalRows: 0,
          },
        });
      } else {
        const errorMessage = errorData?.error || 'Failed to upload CSV file';
        toast.error(errorMessage, { id: uploadToast });
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
      console.error('Failed to download template:', error);
      toast.error('Failed to download template');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced CSV Bulk Upload</h2>
        <p className="text-gray-600">
          Upload a CSV file with real-time validation, duplicate detection, and data quality
          scoring.
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="csv-upload-enhanced"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
              >
                <span>Upload a file</span>
                <input
                  id="csv-upload-enhanced"
                  ref={fileInputRef}
                  name="csv-upload-enhanced"
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
            {validating && (
              <RefreshCw className="w-4 h-4 ml-2 animate-spin text-green-600" />
            )}
          </div>
        )}
      </div>

      {/* Preview Validation */}
      {preview && (
        <div className="mb-6">
          <div
            className={`p-4 rounded-md border ${
              preview.isValid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              {preview.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    preview.isValid ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {preview.isValid
                    ? `CSV file is valid. Found ${preview.rowCount} data rows.`
                    : 'CSV file has validation errors'}
                </p>
                {preview.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                    {preview.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
                {preview.isValid && preview.headers.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    Columns: {preview.headers.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {result && (
        <div className="mb-6 space-y-4">
          {/* Quality Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-blue-900">Data Quality Statistics</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div>
                <p className="text-xs text-blue-700">Average Score</p>
                <p className="text-lg font-bold text-blue-900">
                  {result.qualityStats.averageScore}%
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Min Score</p>
                <p className="text-lg font-bold text-blue-900">{result.qualityStats.minScore}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Max Score</p>
                <p className="text-lg font-bold text-blue-900">{result.qualityStats.maxScore}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Total Rows</p>
                <p className="text-lg font-bold text-blue-900">
                  {result.qualityStats.totalRows}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-xs text-green-700">Valid Rows</p>
              <p className="text-2xl font-bold text-green-900">{result.valid.length}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-xs text-red-700">Invalid Rows</p>
              <p className="text-2xl font-bold text-red-900">{result.invalid.length}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-700">Duplicates</p>
              <p className="text-2xl font-bold text-yellow-900">{result.duplicates.length}</p>
            </div>
          </div>

          {/* Invalid Rows */}
          {result.invalid.length > 0 && (
            <div className="border border-red-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-red-900 mb-2">
                Invalid Rows ({result.invalid.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.invalid.slice(0, 10).map((invalid, index) => (
                  <div key={index} className="text-xs text-red-700 bg-red-100 p-2 rounded">
                    <p className="font-medium">Row {invalid.row}:</p>
                    <ul className="list-disc list-inside mt-1">
                      {invalid.errors.map((error, errIndex) => (
                        <li key={errIndex}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {result.invalid.length > 10 && (
                  <p className="text-xs text-red-700">
                    ... and {result.invalid.length - 10} more errors
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Duplicates */}
          {result.duplicates.length > 0 && (
            <div className="border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">
                Duplicate Rows ({result.duplicates.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.duplicates.slice(0, 10).map((dup, index) => (
                  <div key={index} className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                    <p className="font-medium">
                      Row {dup.row} {dup.duplicateOf > 0 ? `(duplicate of row ${dup.duplicateOf})` : '(duplicate in database)'}
                    </p>
                    <p className="mt-1">{dup.reason}</p>
                    <p className="text-xs mt-1">Similarity: {dup.similarity.toFixed(1)}%</p>
                  </div>
                ))}
                {result.duplicates.length > 10 && (
                  <p className="text-xs text-yellow-700">
                    ... and {result.duplicates.length - 10} more duplicates
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Options */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="skip-duplicates"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="skip-duplicates" className="ml-2 text-sm text-gray-700">
                Skip duplicate rows during upload
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Quality Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={minQualityScore || ''}
                onChange={(e) =>
                  setMinQualityScore(e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="No minimum"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only upload rows with quality score above this threshold
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleManualValidate}
          disabled={!csvContent || validating}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {validating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Validate CSV
            </>
          )}
        </button>
        <button
          onClick={handleUpload}
          disabled={!csvContent || uploading || (result && result.valid.length === 0)}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
      </div>
    </div>
  );
}

