import { useState } from 'react';
import { default as RenamedCaptcha } from '../../utils/captcha';
import { InputStyled } from '@/components/InputStyled';
import { Container, Form, FormTitle, MapContainer, Section, Button } from './styles';
import { Marker, TileLayer, useMapEvents } from 'react-leaflet';
import useGetLocation from '@/hooks/useGetLocation';
import { useToast } from '@/hooks/use-toast';
import { getReverseGeocoding } from '@/api/getReverseGeocoding';
import { createLocation } from '@/api/locationApi';
import { Link, useNavigate } from 'react-router-dom';
import { SyncLoader, ClipLoader } from 'react-spinners';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

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

  const { toast } = useToast();
  const { coords } = useGetLocation();
  const navigate = useNavigate();

  const getAddress = async (lat:number, lng: number) => {
    const key = `${lat},${lng}`;
    if (cachedAddresses[key]) {
      setFormValues(prev => ({ ...prev, ...cachedAddresses[key] }));
      return;
    }
    try {
      const data = await getReverseGeocoding(lat, lng);

      const addressData = {
        address: data.address.road || '',
        // Tenta obter o campo 'city', se não existir, tenta 'town', 'village' ou 'suburb'
        city: data.address.city || data.address.town || data.address.village || data.address.suburb || '',
        state: data.address.state || '',
        country: data.address.country || '',
        latitude: lat,
        longitude: lng,
      };

      console.log(addressData);

      setCachedAddresses(prev => ({ ...prev, [key]: addressData }));
      setFormValues(prev => ({ ...prev, ...addressData }));
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hcaptchaToken) {
      return toast({ title: 'Erro', description: 'Verifique o captcha', color: 'red' });
    }

    if (!formValues.latitude || !formValues.longitude) {
      return toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Defina um ponto no mapa',
        color: 'red',
      });
    }

    setIsSubmitting(true);
    try {
      await createLocation(formValues);
      toast({ variant: 'default', description: 'Local cadastrado com sucesso', color: 'green' });
      setTimeout(() => navigate('/localization'), 2000);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao cadastrar local', color: 'red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!coords) {
    return (
      <div className="flex flex-row gap-5 items-center justify-center h-screen">
        <p className="text-6xl text-[#6C63FF] font-bold">Carregando</p>
        <SyncLoader color="#6C63FF" size={20} />
      </div>
    );
  }

  const MapClickEvent = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setFormValues(prev => ({ ...prev, latitude: lat, longitude: lng }));
        await getAddress(lat, lng);
      },
    });
    return null;
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormTitle className='font-bold'>Cadastro do Local de Treino</FormTitle>

        <Section id='map'>
          <MapContainer center={[coords[0], coords[1]]} zoom={13}>
            <MapClickEvent />
            <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <Marker position={[formValues.latitude, formValues.longitude]} />
          </MapContainer>
        </Section>

        <Section className='section flex flex-col gap-5'>
          <InputStyled label="Nome do Local" name="name" placeholder="Centro de Treinamento" value={formValues.name} onChange={setFormValues} />
          <InputStyled label="Endereço" name="address" placeholder="Rua X, 99" value={formValues.address} onChange={setFormValues} />
          <InputStyled label="Cidade" name="city" placeholder='Ex: Londrina' value={formValues.city} onChange={setFormValues} disabled />
          <InputStyled label='Telefone' name="whatsapp" placeholder="11 99999-9999" value={formValues.whatsapp} onChange={setFormValues} type='tel' pattern='^\d{2} \d{5}-\d{4}$' />
        </Section>

        <RenamedCaptcha sitekey='b25a2b2a-c218-47fa-abb2-9a1a8942fb90' onVerify={setHcaptchaToken} />

        <div className='flex flex-row mt-4 w-full justify-between gap-4'>
          <Button style={{ width: '150px' }} type='submit' disabled={isSubmitting}>
            {isSubmitting ? <ClipLoader size={15} color="#fff" /> : 'Cadastrar'}
          </Button>
          <Link to="/localization">
            <Button style={{ width: '150px', backgroundColor: 'black' }}>Ir para a Pesquisa</Button>
          </Link>
        </div>
      </Form>
    </Container>
  );
}
