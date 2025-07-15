import Axios from 'axios';
import { User } from 'firebase/auth';

import { Location, NewLocationData, Rating, Comment, Photo } from '@/types';

export const api = Axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const fetchLocations = async (user: User | null, city: string = ''): Promise<Location[]> => {
  const headers: Record<string, string> = {};
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await api.get('/api/locations', {
    params: { city },
    headers,
  });
  return response.data;
}

export const createLocation = async (locationData: NewLocationData, user: User): Promise<Location> => {
  const token = await user.getIdToken();
  const response = await api.post('/api/locations', locationData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export const deleteLocation = async (locationId: number, user: User): Promise<void> => {
  const token = await user.getIdToken();
  await api.delete(`/api/locations/${locationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const updateLocation = async (locationId: number, locationData: NewLocationData, user: User): Promise<Location> => {
  const token = await user.getIdToken();
  const response = await api.put(`/api/locations/${locationId}`, locationData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export const fetchCities = async (user: User | null) => {
  const headers: Record<string, string> = {};
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await api.get('/api/locations/cities', {
    headers,
  });
  return response.data;
};

export const fetchAllLocations = async (user: User | null): Promise<Location[]> => {
  const headers: Record<string, string> = {};
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await api.get('/api/locations', {
    headers,
  });
  return response.data;
};

export const postComment = async (locationId: number, text: string, user: User): Promise<Comment> => {
  const token = await user.getIdToken();
  const response = await api.post(`/api/locations/${locationId}/comments`, { text }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const toggleLike = async (locationId: number, user: User): Promise<{ liked: boolean }> => {
  const token = await user.getIdToken();
  const response = await api.post(`/api/locations/${locationId}/like`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const rateLocation = async (locationId: number, ratingData: Omit<Rating, 'locationId' | 'userId'>, user: User): Promise<Rating> => {
  const token = await user.getIdToken();
  const response = await api.post(`/api/locations/${locationId}/rate`, ratingData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const addPhotoByUrl = async (locationId: number, url: string, user: User): Promise<Photo> => {
  const token = await user.getIdToken();
  const response = await api.post(`/api/locations/${locationId}/photos`, { url }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
