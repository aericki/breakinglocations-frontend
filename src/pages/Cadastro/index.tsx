import { useState, useEffect } from 'react';
import { default as RenamedCaptcha } from '../../utils/captcha';
import { InputStyled } from '@/components/InputStyled';
import { Marker, TileLayer, MapContainer } from 'react-leaflet';
import { MapClickEvent } from '@/components/MapClickEvent';
import useGetLocation from '@/hooks/useGetLocation';
import { useToast } from '@/hooks/use-toast';
import { getReverseGeocoding } from '@/api/getReverseGeocoding';
import { createLocation } from '@/api/locationApi';
import { Link, useNavigate } from 'react-router-dom';
import { SyncLoader, ClipLoader } from 'react-spinners';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { MapPinIcon, ArrowLeftIcon, HomeIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Configuração do ícone do marcador
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export default function Cadastrar() {
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const [formValues, setFormValues] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    whatsapp: '',
    latitude: 0,
    longitude: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cachedAddresses, setCachedAddresses] = useState<{ [key: string]: any }>({});
  const [mapHeight, setMapHeight] = useState('50vh');

  const { toast } = useToast();
  const { coords } = useGetLocation();
  const navigate = useNavigate();

  // Ajusta a altura do mapa com base no tamanho da tela
  useEffect(() => {
    const updateMapHeight = () => {
      if (window.innerWidth < 768) {
        setMapHeight('40vh');
      } else {
        setMapHeight('50vh');
      }
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    
    return () => {
      window.removeEventListener('resize', updateMapHeight);
    };
  }, []);

  const getAddress = async (lat: number, lng: number) => {
    const key = `${lat},${lng}`;
    if (cachedAddresses[key]) {
      setFormValues(prev => ({ ...prev, ...cachedAddresses[key] }));
      return;
    }
    try {
      const data = await getReverseGeocoding(lat, lng);

      const addressData = {
        address: data.address.road || '',
        city: data.address.city || data.address.town || data.address.village || data.address.suburb || '',
        state: data.address.state || '',
        country: data.address.country || '',
        latitude: lat,
        longitude: lng,
      };

      setCachedAddresses(prev => ({ ...prev, [key]: addressData }));
      setFormValues(prev => ({ ...prev, ...addressData }));
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro', 
        description: 'Não foi possível obter o endereço deste local', 
        color: 'red' 
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormValues(prev => ({ ...prev, latitude: lat, longitude: lng }));
    void getAddress(lat, lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!hcaptchaToken) {
      return toast({ title: 'Erro', description: 'Verifique o captcha', color: 'red' });
    }

    if (!formValues.latitude || !formValues.longitude) {
      return toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Defina um ponto no mapa clicando na localização desejada',
        color: 'red',
      });
    }

    if (!formValues.name.trim()) {
      return toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha o nome do local',
        color: 'red',
      });
    }

    if (!formValues.whatsapp.trim()) {
      return toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha o telefone para contato',
        color: 'red',
      });
    }

    setIsSubmitting(true);
    try {
      await createLocation(formValues);
      toast({ 
        variant: 'default', 
        description: 'Local cadastrado com sucesso!', 
        color: 'green' 
      });
      setTimeout(() => navigate('/localization'), 2000);
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Erro ao cadastrar local. Tente novamente.', 
        color: 'red' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!coords) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center h-screen bg-gray-50">
        <p className="text-3xl md:text-5xl text-blue-600 font-bold">Carregando</p>
        <SyncLoader color="#4F46E5" size={20} />
        <p className="text-gray-600 mt-4">Obtendo sua localização atual...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 md:p-8 lg:p-10">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 flex items-center gap-2">
            <MapPinIcon />
            Cadastro de Local de Treino
          </h1>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link to="/localization" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeftIcon size={16} />
              <span>Voltar para o mapa</span>
            </Link>
            <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors ml-4">
              <HomeIcon size={16} />
              <span>Home</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <p className="text-blue-700 text-sm">
              <span className="font-bold">Como cadastrar:</span> Clique no mapa para selecionar a localização exata do centro de treinamento. Preencha os dados complementares no formulário abaixo.
            </p>
          </div>

          {/* Seção do Mapa */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPinIcon size={18} className="text-blue-600" />
              Selecione a localização no mapa
            </h2>
            <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300">
              <MapContainer 
                center={[coords[0], coords[1]]} 
                zoom={13} 
                style={{ height: mapHeight, width: '100%' }}
                className="z-0"
              >
                <MapClickEvent onMapClick={handleMapClick} />
                <TileLayer 
                  attribution='&copy; OpenStreetMap' 
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' 
                />
                {formValues.latitude !== 0 && formValues.longitude !== 0 && (
                  <Marker position={[formValues.latitude, formValues.longitude]} />
                )}
              </MapContainer>
            </div>
            
            {/* Informações da localização selecionada */}
            {formValues.latitude !== 0 && formValues.longitude !== 0 && (
              <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                <p className="text-green-700 text-sm font-medium">
                  Localização selecionada: {formValues.address}, {formValues.city}
                </p>
              </div>
            )}
          </div>

          {/* Seção do Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <InputStyled 
                label="Nome do Local" 
                name="name" 
                placeholder="Ex: Centro de Treinamento ABC" 
                value={formValues.name} 
                onChange={setFormValues} 
              />
            </div>
            
            <div>
              <InputStyled 
                label="Endereço" 
                name="address" 
                placeholder="Rua, número" 
                value={formValues.address} 
                onChange={setFormValues} 
              />
            </div>
            
            <div>
              <InputStyled 
                label="Cidade" 
                name="city" 
                placeholder="Cidade" 
                value={formValues.city} 
                onChange={setFormValues} 
                disabled 
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <InputStyled 
                label="Telefone/WhatsApp" 
                name="whatsapp" 
                placeholder="xx xxxxx-xxxx (Ex: 11 99999-9999)" 
                value={formValues.whatsapp} 
                onChange={setFormValues} 
                type="tel" 
                pattern="^\d{2} \d{5}-\d{4}$"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: xx xxxxx-xxxx (Ex: 11 99999-9999)
              </p>
            </div>
          </div>

          {/* Captcha */}
          <div className="flex justify-center mb-6">
            <RenamedCaptcha 
              sitekey="b25a2b2a-c218-47fa-abb2-9a1a8942fb90" 
              onVerify={setHcaptchaToken} 
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <ClipLoader size={16} color="#ffffff" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <MapPinIcon size={18} />
                  <span>Cadastrar Local</span>
                </>
              )}
            </button>
            
            <Link 
              to="/localization"
              className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <span>Ver Todos os Locais</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}