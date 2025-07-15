// src/components/MapClickEvent.tsx
import { useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';

interface MapClickEventProps {
  onMapClick: (latlng: LatLng) => void;
}

export function MapClickEvent({ onMapClick }: MapClickEventProps) {
  useMapEvents({
    click: (e) => {
      // Passa o objeto latlng inteiro, em vez de desestruturá-lo
      onMapClick(e.latlng);
    },
  });
  return null;
}
