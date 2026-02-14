import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { citizenReportsApi, ReportType } from '../services/citizenReportsApi';
import Navbar from '../components/Navbar';
import { MapPin, Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to invalidate map size when container resizes
function MapResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    // Get the map container element
    const mapContainer = map.getContainer();
    if (!mapContainer) return;
    
    let rafId: number | null = null;
    let lastInvalidateTime = 0;
    const INVALIDATE_THROTTLE = 100; // Throttle invalidate calls
    
    const invalidateSize = () => {
      const now = Date.now();
      if (now - lastInvalidateTime < INVALIDATE_THROTTLE) {
        return;
      }
      lastInvalidateTime = now;
      
      // Use requestAnimationFrame for better timing
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        map.invalidateSize(false); // false = don't reset zoom
        rafId = null;
      });
    };
    
    // Initial invalidation after a short delay to ensure container is rendered
    const timeoutId = setTimeout(() => {
      invalidateSize();
    }, 100);
    
    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      invalidateSize();
    });
    
    resizeObserver.observe(mapContainer);
    
    // Use IntersectionObserver to detect when map enters/exits viewport
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Map is visible, invalidate size
            invalidateSize();
          }
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% is visible
        rootMargin: '50px', // Trigger slightly before fully visible
      }
    );
    
    intersectionObserver.observe(mapContainer);
    
    // Also listen to window resize as fallback
    const handleResize = () => {
      invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Listen for scroll events on window (for page scrolling)
    // Use a more aggressive approach - invalidate whenever scrolling and map is partially visible
    const handleWindowScroll = () => {
      const rect = mapContainer.getBoundingClientRect();
      const isPartiallyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isPartiallyVisible) {
        invalidateSize();
      }
    };
    
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    
    // Listen for scroll events on parent containers (in case of nested scrolling)
    const handleParentScroll = () => {
      invalidateSize();
    };
    
    // Check all parent elements for scroll containers
    const scrollListeners: Array<{ element: HTMLElement; handler: () => void }> = [];
    let parent: HTMLElement | null = mapContainer.parentElement;
    while (parent && parent !== document.body) {
      const overflow = window.getComputedStyle(parent).overflow;
      if (overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden') {
        parent.addEventListener('scroll', handleParentScroll, { passive: true });
        scrollListeners.push({ element: parent, handler: handleParentScroll });
      }
      parent = parent.parentElement;
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleWindowScroll);
      // Clean up scroll listeners
      scrollListeners.forEach(({ element, handler }) => {
        element.removeEventListener('scroll', handler);
      });
    };
  }, [map]);
  
  return null;
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('dead_tree');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedGreenSpaceId, setSelectedGreenSpaceId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.1694, 71.4491]); // Astana default

  // Fix Leaflet default icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5);
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      toast.error('Please select a location on the map');
      return;
    }

    if (description.length < 10) {
      toast.error('Please provide a detailed description (at least 10 characters)');
      return;
    }

    if (!isAuthenticated && (!reporterName || !reporterEmail)) {
      toast.error('Please provide your name and email, or log in');
      return;
    }

    try {
      setSubmitting(true);

      await citizenReportsApi.createReport({
        report_type: reportType,
        description,
        latitude,
        longitude,
        green_space_id: selectedGreenSpaceId || undefined,
        reporter_email: isAuthenticated ? undefined : reporterEmail,
        reporter_name: isAuthenticated ? undefined : reporterName,
        photos: photos.length > 0 ? photos : undefined,
      });

      toast.success('Report submitted successfully! We will review it soon.');
      navigate('/map');
    } catch (error: any) {
      console.error('Report submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-600 mb-8">
            Help us monitor green spaces by reporting dead trees, damaged vegetation, or other issues.
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="dead_tree">Dead Tree</option>
                <option value="damaged_tree">Damaged Tree</option>
                <option value="missing_tree">Missing Tree</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Click on the map to select the location of the issue
              </p>
              <div className="border border-gray-300 rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
                <LeafletMapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapResizeHandler />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {latitude && longitude && (
                    <Marker position={[latitude, longitude]} />
                  )}
                </LeafletMapContainer>
              </div>
              {latitude && longitude && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  Selected: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Please provide a detailed description of the issue..."
                required
                minLength={10}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (optional, max 5)
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photos.length > 0 && (
                  <span className="text-sm text-gray-600">{photos.length} photo(s) selected</span>
                )}
              </div>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Info (if not authenticated) */}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !latitude || !longitude}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

