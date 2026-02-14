import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { useMap } from 'react-leaflet';

interface MapShareProps {
  filters?: Record<string, any>;
}

export default function MapShare({ filters }: MapShareProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const map = useMap();

  const generateShareUrl = () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const params = new URLSearchParams({
      lat: center.lat.toFixed(6),
      lng: center.lng.toFixed(6),
      zoom: zoom.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(`filter_${key}`, String(value));
        }
      });
    }

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    const url = generateShareUrl();
    const shareData = {
      title: 'Treecovery Map View',
      text: 'Check out this view of green spaces in Kazakhstan',
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const shareUrl = generateShareUrl();

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors"
          aria-label="Share map"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
        </button>

        {showShareMenu && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Share Map View</h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share via...
              </button>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  This link includes the current map view and filters. Anyone with the link can see this view.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

