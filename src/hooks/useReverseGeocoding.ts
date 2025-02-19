// useReverseGeocoding.ts
import { useState, useCallback } from 'react';
import { getReverseGeocoding } from '@/api/getReverseGeocoding';

export function useReverseGeocoding() {
  const [cachedAddresses, setCachedAddresses] = useState<{ [key: string]: any }>({});

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    const key = `${lat},${lng}`;
    if (cachedAddresses[key]) {
      return cachedAddresses[key];
    }
    try {
      const data = await getReverseGeocoding(lat, lng);
      const addressData = {
        address: data.address.road || '',
        city: data.address.city || '',
        state: data.address.state || '',
        country: data.address.country || '',
        latitude: lat,
        longitude: lng,
      };
      setCachedAddresses(prev => ({ ...prev, [key]: addressData }));
      return addressData;
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      throw error;
    }
  }, [cachedAddresses]);

  return { fetchAddress };
}
