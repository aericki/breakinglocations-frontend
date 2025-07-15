// src/hooks/use-geolocation.ts
import { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';

interface GeolocationState {
  coordinates: LatLng | null;
  isLoading: boolean;
  error: GeolocationPositionError | null;
}

export const useGeolocation = (enabled: boolean = true) => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: enabled,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: new LatLng(position.coords.latitude, position.coords.longitude),
        isLoading: false,
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        coordinates: null,
        isLoading: false,
        error,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

  }, [enabled]);

  return state;
};
