import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { fetchLocations, fetchCities } from '../../api/locationApi';
import 'leaflet/dist/leaflet.css';
import { Button, Container, Title } from './styles';
import { Location } from '@/types';
import { LatLngExpression } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const LocationsMap = () => {
  // Estado para a cidade selecionada e lista de cidades
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([-22.9278, -46.9937]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Carrega as cidades cadastradas ao montar o componente
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await fetchCities();
        setCities(data);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
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

  // Componente auxiliar para mover o mapa
  const FlyToLocation: React.FC<{ center: LatLngExpression }> = ({ center }) => {
    const map = useMap();
    map.flyTo(center, 13);
    return null;
  };

  return (
    <Container>
      <Title>Localizações</Title>
      <div className="flex w-full items-center justify-between gap-3 mb-4 max-w-[700px]">
        {/* Substitui o input por um select com as cidades */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-gray-100 placeholder:text-gray-400 placeholder:font-light font-normal p-2"
        >
          <option value="">Selecione uma cidade</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Pesquisando..." : "Pesquisar"}
        </Button>
        <Button style={{ width: '200px', backgroundColor: 'black' }} onClick={() => navigate('/register')}>
          Novo local
        </Button>
        <Button style={{ backgroundColor: 'black', gap: '5px' }} onClick={() => navigate('/')}>
          <HomeIcon /> Home
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-2xl">Buscando localizações...</p>
        </div>
      ) : message ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-2xl">{message}</p>
        </div>
      ) : (
        <MapContainer id="map" center={mapCenter} zoom={12} style={{ height: '80vh', width: '100%', zIndex: 0 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToLocation center={mapCenter} />
          {locations.map((location) => (
            <Marker key={location.name} position={[location.latitude, location.longitude]}>
              <Popup>
                <strong>{location.name}</strong>
                <br />
                {location.address}
                <br />
                {location.city}, {location.state}
                <br />
                <a href={`https://wa.me/${location.whatsapp}`}>WhatsApp</a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </Container>
  );
};

export default LocationsMap;
