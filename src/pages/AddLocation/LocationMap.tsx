// src/pages/AddLocation/LocationMap.tsx
import React from 'react';
import { LatLng } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ClipLoader } from 'react-spinners';
import { Location } from '@/types';
import { MapClickEvent } from '@/components/MapClickEvent';
import { ChangeView, defaultIcon, existingLocationIcon } from '@/utils/leaflet-helpers';

interface LocationMapProps {
  mapCenter: LatLng;
  mapZoom: number;
  isLoading: boolean;
  markerPosition: LatLng | null;
  existingLocations: Location[];
  onMapClick: (latlng: LatLng) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({
  mapCenter,
  mapZoom,
  isLoading,
  markerPosition,
  existingLocations,
  onMapClick,
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <ClipLoader size={40} color="#888" />
      </div>
    );
  }

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      <MapClickEvent onMapClick={onMapClick} />
      {markerPosition && (
        <Marker position={markerPosition} icon={defaultIcon}>
          <Popup>Você selecionou este ponto.</Popup>
        </Marker>
      )}
      {existingLocations.map(loc => (
        <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={existingLocationIcon}>
          <Popup><strong>{loc.name}</strong><br/>{loc.address}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LocationMap;
