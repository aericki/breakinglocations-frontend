

import Axios from 'axios'

export interface Location {
  name: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
  whatsapp: string
}

export const api = Axios.create({
  baseURL: "https://breaking-locations-production.up.railway.app/"
});

export const fetchLocations = async (city: string = '') => {
  const response = await api.get('/api/locations', {
    params: {
      city
    }
  })
  return response.data;
}

export const createLocation = async (locationData: Location) => {

  const response = await api.post('/api/locations', locationData);
  return response.data
}

export const fetchCities = async () => {
  const response = await api.get('/api/locations/cities');
  return response.data;
};