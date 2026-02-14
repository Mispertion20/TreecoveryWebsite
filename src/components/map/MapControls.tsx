import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Layers, Maximize2, Minimize2, Ruler } from 'lucide-react';
import { TileLayer } from 'react-leaflet';

interface MapControlsProps {
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function MapControls({ onFullscreenChange }: MapControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const map = useMap();

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = map.getContainer();
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
    onFullscreenChange?.(!isFullscreen);
  };

  // Listen for fullscreen changes
  useState(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      onFullscreenChange?.(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  });

  const layerOptions = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>',
    },
  };

  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
      {/* Layer Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors"
          aria-label="Change map layer"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>

        {showLayers && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {(['standard', 'satellite', 'terrain'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => {
                  setCurrentLayer(layer);
                  setShowLayers(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  currentLayer === layer
                    ? 'bg-green-50 text-green-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5 text-gray-700" />
        ) : (
          <Maximize2 className="w-5 h-5 text-gray-700" />
        )}
      </button>
    </div>
  );
}

