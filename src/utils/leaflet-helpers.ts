// src/utils/leaflet-helpers.ts
import { Icon, LatLng } from 'leaflet';
import { useMap } from 'react-leaflet';

// --- Componente para Mudar a Visualização do Mapa ---
export const ChangeView = ({ center, zoom }: { center: LatLng; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// --- Configuração dos Ícones do Leaflet ---
export const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const existingLocationIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'existing-marker' // Classe para estilização customizada
});
