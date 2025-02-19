// src/types.ts
export interface Location {
  id: string;
  name: string;
  whatsapp: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string; // Adiciona a propriedade 'city' para compatibilidade com LocationList
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

