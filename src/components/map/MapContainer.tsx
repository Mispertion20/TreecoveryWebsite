import { useEffect, useCallback } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerCluster from './MarkerCluster';
import type { GreenSpaceWithCity, City, MapBounds } from '../../services/mapService';

// Fix for default marker icons in React-Leaflet
// Using CDN URLs for marker icons (Vite doesn't handle image imports well for Leaflet)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapContainerProps {
  greenSpaces: GreenSpaceWithCity[];
  cities: City[];
  onCityClick?: (city: City) => void;
  selectedCityId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onBoundsChange?: (bounds: MapBounds) => void;
}

// Kazakhstan approximate center
const KAZAKHSTAN_CENTER: [number, number] = [48.0, 66.0];
const KAZAKHSTAN_ZOOM = 6;

// Component to handle map events and bounds changes
function MapEventHandler({
  onBoundsChange,
  onCityClick,
  cities,
}: {
  onBoundsChange?: (bounds: MapBounds) => void;
  onCityClick?: (city: City) => void;
  cities: City[];
}) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });

  // Add city markers
  useEffect(() => {
    if (!map || cities.length === 0) return;

    const cityMarkers: L.Marker[] = [];

    cities.forEach((city) => {
      const cityMarker = L.marker([city.center_lat, city.center_lng], {
        icon: L.divIcon({
          className: 'city-marker',
          html: `
            <div class="city-marker-label" style="
              background-color: #2D5016;
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
              border: 2px solid white;
              transition: all 0.2s ease;
            ">
              ${city.name_en}
            </div>
          `,
          iconSize: [100, 40],
          iconAnchor: [50, 20],
        }),
      });

      cityMarker.on('click', () => {
        if (onCityClick) {
          onCityClick(city);
          // Zoom to city
          map.setView([city.center_lat, city.center_lng], 12, {
            animate: true,
            duration: 0.5,
          });
        }
      });

      cityMarker.addTo(map);
      cityMarkers.push(cityMarker);
    });

    return () => {
      cityMarkers.forEach((marker) => {
        map.removeLayer(marker);
      });
    };
  }, [map, cities, onCityClick]);

  return null;
}

export default function MapContainer({
  greenSpaces,
  cities,
  onCityClick,
  selectedCityId,
  initialCenter = KAZAKHSTAN_CENTER,
  initialZoom = KAZAKHSTAN_ZOOM,
  onBoundsChange,
}: MapContainerProps) {
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      if (onBoundsChange) {
        onBoundsChange(bounds);
      }
    },
    [onBoundsChange]
  );

  // Zoom to selected city
  useEffect(() => {
    if (!selectedCityId || cities.length === 0) return;

    const city = cities.find((c) => c.id === selectedCityId);
    if (city) {
      // This will be handled by the MapEventHandler component
    }
  }, [selectedCityId, cities]);

  // Component to invalidate map size when container resizes
  function MapResizeHandler() {
    const map = useMap();
    
    useEffect(() => {
      // Get the map container element
      const mapContainer = map.getContainer();
      if (!mapContainer) return;
      
      // Initial invalidation after a short delay to ensure container is rendered
      const timeoutId = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
      // Use ResizeObserver to detect container size changes
      const resizeObserver = new ResizeObserver(() => {
        // Small delay to ensure DOM has updated
        setTimeout(() => {
          map.invalidateSize();
        }, 50);
      });
      
      resizeObserver.observe(mapContainer);
      
      // Also listen to window resize as fallback
      const handleResize = () => {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Listen for scroll events on parent containers (in case of nested scrolling)
      const handleScroll = () => {
        setTimeout(() => {
          map.invalidateSize();
        }, 50);
      };
      
      // Check all parent elements for scroll containers
      // Store references to properly clean up later
      const parentsWithListeners: HTMLElement[] = [];
      let parent: HTMLElement | null = mapContainer.parentElement;
      while (parent && parent !== document.body) {
        const overflow = window.getComputedStyle(parent).overflow;
        if (overflow === 'auto' || overflow === 'scroll') {
          parent.addEventListener('scroll', handleScroll, { passive: true });
          parentsWithListeners.push(parent);
        }
        parent = parent.parentElement;
      }

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        // Clean up scroll listeners using stored references
        parentsWithListeners.forEach((p) => {
          p.removeEventListener('scroll', handleScroll);
        });
      };
    }, [map]);
    
    return null;
  }

  return (
    <div className="w-full h-full relative">
      <LeafletMapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeHandler />
        <MapEventHandler
          onBoundsChange={handleBoundsChange}
          onCityClick={onCityClick}
          cities={cities}
        />
        <MarkerCluster greenSpaces={greenSpaces} />
      </LeafletMapContainer>
    </div>
  );
}

