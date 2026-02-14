import { useState, useEffect } from 'react';
import { greenSpacesApi } from '../../services/greenSpacesApi';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import ConfirmDialog from '../ui/ConfirmDialog';
import { showError, showPromise, showSuccess, SUCCESS_MESSAGES } from '../../utils/toastHelpers';

interface PhotoUploadProps {
  greenSpaceId: string;
}

interface Photo {
  id: string;
  url: string;
  uploaded_at: string;
}

export default function PhotoUpload({ greenSpaceId }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [greenSpaceId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const greenSpace = await greenSpacesApi.getGreenSpace(greenSpaceId);
      setPhotos(greenSpace.photos || []);
    } catch (error) {
      // Silently fail - photos will be empty
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      showError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      
      // Compress image if it's larger than 1MB
      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        fileToUpload = await compressImage(file);
      }

      const newPhoto = await showPromise(
        greenSpacesApi.uploadPhoto(greenSpaceId, fileToUpload),
        {
          loading: 'Uploading photo...',
          success: SUCCESS_MESSAGES.PHOTO_UPLOADED,
          error: (error: any) => error.response?.data?.error || 'Failed to upload photo',
        }
      );
      
      setPhotos([...photos, newPhoto]);
      
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    } catch (error) {
      // Error already handled by showPromise
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (photoId: string) => {
    setPhotoToDelete(photoId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;

    try {
      // Note: Delete photo endpoint needs to be implemented in backend
      // For now, just remove from local state
      setPhotos(photos.filter((p) => p.id !== photoToDelete));
      showSuccess(SUCCESS_MESSAGES.PHOTO_DELETED);
    } catch (error) {
      showError(error);
    } finally {
      setDeleteConfirmOpen(false);
      setPhotoToDelete(null);
    }
  };

  const handlePreview = (url: string) => {
    setPreview(url);
  };

  if (loading) {
    return <div className="text-gray-500">Loading photos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Photo'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
        <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <LazyImage
                src={photo.url}
                alt={`Green space photo ${photo.id}`}
                className="w-full h-32 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handlePreview(photo.url)}
                placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3C/svg%3E"
              />
              <button
                onClick={() => handleDeleteClick(photo.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No photos uploaded yet</p>
        </div>
      )}

      {/* Photo Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setPreview(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPhotoToDelete(null);
        }}
      />
    </div>
  );
}

