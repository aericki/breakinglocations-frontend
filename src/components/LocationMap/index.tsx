import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchLocations, fetchCities } from '../../api/locationApi';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';
import { LatLngExpression } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, MapPinIcon, PlusCircleIcon, SearchIcon, Loader2Icon } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect'; // Importe o componente que criamos

// Correção para os ícones do Leaflet em ambiente de produção
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuração do ícone padrão do Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente auxiliar para mover o mapa
const FlyToLocation: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  
  return null;
};

const LocationsMap = () => {
  // Estado para a cidade selecionada e lista de cidades
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([-22.9278, -46.9937]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mapHeight, setMapHeight] = useState('80vh');

  const navigate = useNavigate();

  // Ajusta a altura do mapa com base no tamanho da tela
  useEffect(() => {
    const updateMapHeight = () => {
      // Em telas pequenas, o mapa ocupa menos espaço vertical
      if (window.innerWidth < 768) {
        setMapHeight('60vh');
      } else {
        setMapHeight('80vh');
      }
    };

    // Configura a altura inicial
    updateMapHeight();

    // Adiciona listener para redimensionamento
    window.addEventListener('resize', updateMapHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateMapHeight);
    };
  }, []);

  // Carrega as cidades cadastradas ao montar o componente
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCities();
        setCities(data);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        setMessage('Não foi possível carregar a lista de cidades.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, []);

  // Função para pesquisar as localizações pela cidade selecionada
  const handleSearch = useCallback(async () => {
    if (!selectedCity.trim()) {
      alert("Por favor, selecione uma cidade para pesquisar.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const data = await fetchLocations(selectedCity);
      setLocations(data);

      if (data.length === 0) {
        setMessage('Nenhuma localização encontrada para a cidade informada.');
      } else {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (error) {
      console.error("Erro ao buscar localizações:", error);
      setMessage('Ocorreu um erro ao buscar localizações.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  return (
    <section className='flex flex-col w-full min-h-screen p-4 md:p-6 bg-gray-50'>
      <header className="mb-6">
        <h1 className='text-2xl md:text-3xl font-bold flex items-center gap-2 mb-2'>
          <MapPinIcon className="text-blue-600" />
          Mapa de Localizações
        </h1>
        <p className="text-gray-600 md:max-w-2xl">
          Selecione uma cidade para ver todos os locais disponíveis no mapa.
        </p>
      </header>

      <div className="flex flex-col md:flex-row w-full items-center justify-between gap-3 mb-6">
        <div className="flex flex-col md:flex-row items-center w-full md:w-auto gap-3">
          {/* Substitui o select padrão pelo SearchableSelect */}
          <SearchableSelect
            options={cities}
            value={selectedCity}
            onChange={(value) => setSelectedCity(value)}
            placeholder="Selecione uma cidade"
            className="w-full md:w-64"
          />
          
          <button 
            className='w-full md:w-auto bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-md shadow-sm flex items-center justify-center gap-2'
            onClick={handleSearch}
            disabled={isLoading}
            aria-label="Pesquisar localizações"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="animate-spin" size={16} />
                <span>Pesquisando...</span>
              </>
            ) : (
              <>
                <SearchIcon size={16} />
                <span>Pesquisar</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
          <button 
            className='flex-1 md:flex-none bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2 rounded-md shadow-sm flex items-center justify-center gap-2'
            onClick={() => navigate('/register')}
            aria-label="Adicionar novo local"
          >
            <PlusCircleIcon size={16} />
            <span className="whitespace-nowrap">Novo local</span>
          </button>
          
          <button 
            className='flex-1 md:flex-none bg-gray-800 hover:bg-gray-900 transition-colors text-white px-4 py-2 rounded-md shadow-sm flex items-center justify-center gap-2'
            onClick={() => navigate('/')}
            aria-label="Voltar para a página inicial"
          >
            <HomeIcon size={16} />
            <span className="whitespace-nowrap md:inline">Home</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full rounded-lg overflow-hidden shadow-md bg-white border border-gray-200">
        {isLoading && !locations.length ? (
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <Loader2Icon className="animate-spin mb-4 text-blue-600" size={48} />
            <p className="text-xl text-gray-700">Buscando localizações...</p>
          </div>
        ) : message ? (
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-lg text-yellow-700">{message}</p>
            </div>
            {!selectedCity && (
              <p className="text-gray-600">Selecione uma cidade para começar.</p>
            )}
          </div>
        ) : (
          <MapContainer 
            id="map" 
            center={mapCenter} 
            zoom={12} 
            style={{ height: mapHeight, width: '100%' }}
            className="z-0"
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FlyToLocation center={mapCenter} />
            {locations.map((location) => (
              <Marker 
                key={`${location.name}-${location.latitude}-${location.longitude}`} 
                position={[location.latitude, location.longitude]}
              >
                <Popup className="location-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-lg text-blue-700 mb-1">{location.name}</h3>
                    <p className="text-gray-700 mb-1">{location.address}</p>
                    <p className="text-gray-600 mb-2">{location.city}, {location.state}</p>
                    
                    <a 
                      href={`https://wa.me/${location.whatsapp}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-green-600 text-white text-center py-1 px-2 rounded mt-2 hover:bg-green-700 transition-colors"
                    >
                      Contato via WhatsApp
                    </a>
                    
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-blue-600 text-white text-center py-1 px-2 rounded mt-1 hover:bg-blue-700 transition-colors"
                    >
                      Como chegar
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {locations.length > 0 && (
        <div className="mt-6 hidden md:block">
          <h2 className="text-xl font-semibold mb-3">Locais encontrados ({locations.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div 
                key={`card-${location.name}`} 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg text-blue-700">{location.name}</h3>
                <p className="text-gray-700 mb-1">{location.address}</p>
                <p className="text-gray-600 mb-3">{location.city}, {location.state}</p>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={`https://wa.me/${location.whatsapp}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <button 
                    onClick={() => setMapCenter([location.latitude, location.longitude])}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <MapPinIcon size={14} />
                    Ver no mapa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default LocationsMap;