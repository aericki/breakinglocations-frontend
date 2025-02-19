// MapClickEvent.tsx
import { useMapEvents } from 'react-leaflet';

interface MapClickEventProps {
  onMapClick: (lat: number, lng: number) => void;
}

export function MapClickEvent({ onMapClick }: MapClickEventProps) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}
