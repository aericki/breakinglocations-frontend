// src/pages/AddLocation/index.tsx
import React, { useState, useEffect } from 'react';
import { LatLng, Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getReverseGeocoding } from '@/api/getReverseGeocoding';
import { createLocation, fetchAllLocations } from '@/api/locationApi';
import { NewLocationData } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import InputMask from 'react-input-mask';
import { MapPin, ArrowLeft, AlertTriangle, CheckCircle, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapClickEvent } from '@/components/MapClickEvent';
import { Location } from '@/types';
import { getDistanceInMeters } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// --- Componente para Mudar a Visualização do Mapa ---
const ChangeView = ({ center, zoom }: { center: LatLng; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// --- Configuração dos Ícones do Leaflet ---
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const existingLocationIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'existing-marker' // Classe para estilização customizada
});

const AddLocationPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Estados do Componente ---
  const [formValues, setFormValues] = useState<NewLocationData>({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    whatsapp: '',
    latitude: 0,
    longitude: 0,
  });
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [existingLocations, setExistingLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLng>(new LatLng(-14.235, -51.925));
  const [mapZoom, setMapZoom] = useState(4);
  
  // --- Carregamento Inicial dos Locais ---
  useEffect(() => {
    if (!user) return;

    const loadExistingLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const locations = await fetchAllLocations(user);
        setExistingLocations(locations);
      } catch (error) {
        console.error("Erro ao carregar locais existentes:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os locais existentes.' });
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadExistingLocations();
  }, [user, toast]);

  // --- Efeito para Injetar Estilos dos Marcadores ---
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.existing-marker { filter: hue-rotate(120deg) saturate(0.8); }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // --- Lógica de Clique no Mapa e Geocodificação ---
  const handleMapClick = async (latlng: LatLng) => {
    if (!latlng) return;

    setMarkerPosition(latlng);
    setIsGeocoding(true);
    setFormValues((prev: NewLocationData) => ({ ...prev, name: '', address: '', city: '', state: '', country: '', latitude: latlng.lat, longitude: latlng.lng }));

    try {
      const data = await getReverseGeocoding(latlng.lat, latlng.lng);
      if (data && data.address) {
        setFormValues((prev: NewLocationData) => ({
          ...prev,
          address: data.address.road || 'Endereço não encontrado',
          city: data.address.city || data.address.town || '',
          state: data.address.state || '',
          country: data.address.country || '',
        }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({ variant: "destructive", title: "Erro de Geocodificação", description: "Não foi possível buscar o endereço." });
    } finally {
      setIsGeocoding(false);
    }
  };

  // --- Lógica para Localizar o Usuário ---
  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLatLng = new LatLng(latitude, longitude);
          setMapCenter(userLatLng);
          setMapZoom(15); // Zoom in on the user's location
          handleMapClick(userLatLng); // Reuse the existing logic to set marker and geocode
          toast({ title: "Sucesso", description: "Localização encontrada!" });
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível obter sua localização. Verifique as permissões do navegador." });
        }
      );
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Geolocalização não é suportada por este navegador." });
    }
  };

  // --- Verificação de Locais Próximos ---
  useEffect(() => {
    if (!markerPosition) {
      setNearbyLocations([]);
      return;
    }
    const nearby = existingLocations
      .map(location => ({
        ...location,
        distance: markerPosition ? getDistanceInMeters(markerPosition, new LatLng(location.latitude, location.longitude)) : Infinity
      }))
      .filter(location => location.distance < 500) // Raio de 500 metros
      .sort((a, b) => a.distance - b.distance);
    
    setNearbyLocations(nearby);
  }, [markerPosition, existingLocations]);

  // --- Submissão do Formulário ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !markerPosition) {
      toast({ variant: "destructive", title: "Erro", description: "Por favor, clique no mapa para definir um local." });
      return;
    }
    if (!formValues.name.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do local é obrigatório." });
      return;
    }
    if (nearbyLocations.length > 0) {
      const confirmed = window.confirm(`Atenção: Existem ${nearbyLocations.length} locais próximos. Deseja continuar com o cadastro?`);
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      await createLocation(formValues, user);
      toast({ title: "Sucesso!", description: "Local cadastrado com sucesso." });
      navigate('/localization'); // Navega para a lista de locais
    } catch (error) {
      console.error("Erro ao criar local:", error);
      toast({ variant: "destructive", title: "Erro ao Salvar", description: "Não foi possível salvar a localização." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev: NewLocationData) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2"><MapPin /> Adicionar Novo Local</h1>
        <div className="flex gap-4">
          <Link to="/localization" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft size={16} /> Voltar para o Mapa
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna da Esquerda: Formulário e Avisos */}
        <div className="space-y-6">
          {/* Aviso de Duplicata */}
          {nearbyLocations.length > 0 && (
            <div className="p-4 border rounded-lg bg-amber-50 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Aviso de Duplicata Potencial</h4>
                <p className="text-sm">O ponto selecionado está próximo de locais existentes. Verifique o mapa e a lista abaixo.</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detalhes do Local</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleLocateUser}>
                <LocateFixed className="mr-2 h-4 w-4" />
                Usar minha localização
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Local</Label>
              <Input id="name" name="name" placeholder="Ex: Posto Central" value={formValues.name} onChange={handleInputChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" placeholder={isGeocoding ? "Buscando..." : "Preenchido pelo mapa"} value={formValues.address} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Município</Label>
              <Input id="city" name="city" placeholder={isGeocoding ? "Buscando..." : "Preenchido pelo mapa"} value={formValues.city} disabled readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
              <InputMask
                mask="(99) 99999-9999"
                value={formValues.whatsapp}
                onChange={handleInputChange}
              >
                {(inputProps: any) => <Input {...inputProps} id="whatsapp" name="whatsapp" placeholder="(99) 99999-9999" />}
              </InputMask>
            </div>
            {markerPosition && (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Localização selecionada no mapa.</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting || isGeocoding || !markerPosition}>
              {isSubmitting ? <><ClipLoader size={16} color="#fff" className="mr-2" /> Salvando...</> : 'Salvar Local'}
            </Button>
          </form>

          {/* Lista de Locais Próximos */}
          {nearbyLocations.length > 0 && (
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Locais Próximos Encontrados</h3>
              <ul className="space-y-2">
                {nearbyLocations.map(loc => (
                  <li key={loc.id} className="text-sm">
                    <strong>{loc.name}</strong> ({loc.distance ? Math.round(loc.distance) : 0}m)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Coluna da Direita: Mapa */}
        <div className="lg:order-last order-first h-[400px] lg:h-full border rounded-lg shadow-sm overflow-hidden">
          {isLoadingLocations ? (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ClipLoader size={40} color="#888" />
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              <MapClickEvent onMapClick={handleMapClick} />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLocationPage;
