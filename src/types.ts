// src/types.ts
export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  whatsapp?: string;
  userId: string;
  distance?: number;
}

export interface NewLocationData {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  whatsapp?: string;
}

export interface LocationListProps {
  locations: Location[];
}

export interface LocationMapProps {
  locations: Location[];
  center: { latitude: number; longitude: number };
  selectedLocation?: Location | null;
}

export type SearchBarProps = {
  onSearch: (city: string) => void;
};