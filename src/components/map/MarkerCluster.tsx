import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import DOMPurify from 'dompurify';
import 'leaflet.markercluster';
import type { GreenSpaceWithCity } from '../../services/mapService';
import { getStatusColor } from '../../services/mapService';

interface MarkerClusterProps {
  greenSpaces: GreenSpaceWithCity[];
}

// Sanitize user-generated content to prevent XSS attacks
function sanitize(text: string | null | undefined): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
  });
}

// Create custom icon for markers based on status
function createMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

export default function MarkerCluster({ greenSpaces }: MarkerClusterProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || greenSpaces.length === 0) return;

    // Create marker cluster group
    const markerClusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkDelay: 200,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background-color: #059669;
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: 'marker-cluster',
          iconSize: L.point(40, 40),
        });
      },
    });

    // Create markers for each green space
    greenSpaces.forEach((greenSpace) => {
      const color = getStatusColor(greenSpace.status);
      const icon = createMarkerIcon(color);

      const marker = L.marker([greenSpace.latitude, greenSpace.longitude], {
        icon,
      });

      // Create popup with sanitized content to prevent XSS attacks
      const popupContent = document.createElement('div');
      popupContent.innerHTML = DOMPurify.sanitize(`
        <div class="min-w-[250px] max-w-[350px] p-4">
          <div class="space-y-3">
            <div class="border-b border-gray-200 pb-2">
              <h3 class="text-lg font-bold text-gray-900">
                ${sanitize(greenSpace.species_en || greenSpace.species_ru)}
              </h3>
              ${greenSpace.species_scientific ? `
                <p class="text-sm text-gray-600 italic">
                  ${sanitize(greenSpace.species_scientific)}
                </p>
              ` : ''}
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-3 h-3 rounded-full" style="background-color: ${color}"></span>
              <span class="text-sm font-medium text-gray-700">
                ${greenSpace.status === 'alive' ? 'Alive' :
                  greenSpace.status === 'attention_needed' ? 'Attention Needed' :
                  greenSpace.status === 'dead' ? 'Dead' : 'Removed'}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">Type:</span>
                <span class="ml-2 font-medium text-gray-900 capitalize">${sanitize(greenSpace.type)}</span>
              </div>
              <div>
                <span class="text-gray-500">City:</span>
                <span class="ml-2 font-medium text-gray-900">${sanitize(greenSpace.city?.name_en || 'Unknown')}</span>
              </div>
              ${greenSpace.district ? `
                <div class="col-span-2">
                  <span class="text-gray-500">District:</span>
                  <span class="ml-2 font-medium text-gray-900">${sanitize(greenSpace.district.name_en)}</span>
                </div>
              ` : ''}
              <div class="col-span-2">
                <span class="text-gray-500">Planting Date:</span>
                <span class="ml-2 font-medium text-gray-900">
                  ${new Date(greenSpace.planting_date).toLocaleDateString()}
                </span>
              </div>
              ${greenSpace.responsible_org ? `
                <div class="col-span-2">
                  <span class="text-gray-500">Organization:</span>
                  <span class="ml-2 font-medium text-gray-900">${sanitize(greenSpace.responsible_org)}</span>
                </div>
              ` : ''}
            </div>
            ${greenSpace.notes ? `
              <div class="pt-2 border-t border-gray-200">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">Notes:</span> ${sanitize(greenSpace.notes)}
                </p>
              </div>
            ` : ''}
          </div>
        </div>
      `, {
        ALLOWED_TAGS: ['div', 'h3', 'p', 'span', 'b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: ['class', 'style'],
        ALLOW_DATA_ATTR: false,
      });

      marker.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'green-space-popup',
      });

      markerClusterGroup.addLayer(marker);
    });

    // Add cluster group to map
    map.addLayer(markerClusterGroup);

    // Cleanup function
    return () => {
      map.removeLayer(markerClusterGroup);
      markerClusterGroup.clearLayers();
    };
  }, [map, greenSpaces]);

  return null;
}

