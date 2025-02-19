// src/hooks/useGetLocation.ts
import { useEffect, useState } from "react";

const defaultCoords = [-23.550520, -46.633309];

export default function useGetLocation() {
  const [coords, setCoords] = useState<number[] | null>();

  useEffect(() => {

    function OnSucess (position: GeolocationPosition) {
      setCoords([position.coords.latitude, position.coords.longitude]);
    }
    function OnError () {
      setCoords(defaultCoords);
    }

    try {
      navigator.geolocation.getCurrentPosition( OnSucess, OnError );
    } catch (error) {
      setCoords(defaultCoords);
      console.error(error);
    }
  }, []);


  return {coords};

}