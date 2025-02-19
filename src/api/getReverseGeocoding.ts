import axios from 'axios';

// Configura a base da API com Nominatim do OpenStreetMap
export const api = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org/reverse',
});

export const getReverseGeocoding = async (lat: number, lng: number) => {
  try {
    const response = await api.get('', {
      params: {
        format: 'jsonv2',
        lat,
        lon: lng, // Usa-se `lon` para longitude em vez de `lng`
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter endereço:', error);
    throw error;
  }
};
