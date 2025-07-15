// src/pages/Locations/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchLocations } from '@/api/locationApi';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';
import { LatLngExpression } from 'leaflet';
import { SearchIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// --- Configuração dos Ícones do Leaflet ---
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Componente Auxiliar para Mover o Mapa ---
const FlyToLocation: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

// --- Componente Principal da Página ---
const LocationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('city') || '');
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([-14.235, -51.925]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>('Digite uma cidade para começar a busca.');

  const { user } = useAuth();
  const { toast } = useToast();

  const handleSearch = useCallback(async (city: string) => {
    if (!city.trim()) {
      toast({ variant: 'destructive', title: 'Atenção', description: 'Por favor, digite o nome da cidade.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    setLocations([]);
    setSearchParams({ city: city });
    try {
      const data = await fetchLocations(user, city);
      setLocations(data);
      if (data.length === 0) {
        setMessage('Nenhuma localização encontrada para esta cidade.');
      } else {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (error) {
      console.error("Erro ao buscar localizações:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Ocorreu um erro ao buscar as localizações.' });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, setSearchParams]);

  useEffect(() => {
    const city = searchParams.get('city');
    if (city) {
      setSearchQuery(city);
      handleSearch(city);
    }
  }, [searchParams, handleSearch]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 p-4 bg-white border-r border-gray-200 overflow-y-auto">
          <form onSubmit={onSearchSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome da cidade"
              className="w-full"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2Icon className="animate-spin" size={16} /> : <SearchIcon size={16} />}
              <span>{isLoading ? 'Pesquisando...' : 'Pesquisar'}</span>
            </Button>
          </form>

          <div className="mt-6">
            {locations.length > 0 && (
              <h2 className="text-xl font-semibold mb-3">Resultados ({locations.length})</h2>
            )}
            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="bg-gray-50 p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer" onClick={() => setMapCenter([location.latitude, location.longitude])}>
                  <h3 className="font-bold text-md text-blue-700">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  {user && location.whatsapp && (
                    <p className="text-sm text-gray-600">WhatsApp: {location.whatsapp}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          {isLoading && locations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2Icon className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={locations.length > 0 ? 12 : 4} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              {locations.length > 0 && <FlyToLocation center={mapCenter} />}
              {locations.map((location) => (
                <Marker key={location.id} position={[location.latitude, location.longitude]}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-lg text-blue-700 mb-1">{location.name}</h3>
                      <p className="text-gray-700 mb-1">{location.address}</p>
                      <p className="text-gray-600 mb-2">{location.city}, {location.state}</p>
                      {user && location.whatsapp && (
                        <a 
                          href={`https://wa.me/${location.whatsapp.replace(/\D/g, '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block bg-green-500 text-white text-center py-1 px-2 rounded mt-2 hover:bg-green-600 transition-colors"
                        >
                          Contato via WhatsApp
                        </a>
                      )}
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-blue-500 text-white text-center py-1 px-2 rounded mt-1 hover:bg-blue-600 transition-colors"
                      >
                        Como chegar
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {message && locations.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md shadow-lg z-[1000]">
                  <p className="text-lg text-gray-700">{message}</p>
                </div>
              )}
            </MapContainer>
          )}
        </main>
      </div>
    </div>
  );
};

export default LocationsPage;
