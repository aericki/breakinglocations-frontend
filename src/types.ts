// src/types.ts

// --- Core Location & User Types ---
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
  distance?: number; // Optional field for distance calculations
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  locations?: Location[];
}

// --- Rating-related Types ---
export interface Rating {
  userId: string;
  locationId: number;
  floor: number;
  space: number;
  safety: number;
  sound: number;
  vibe: number;
}

export interface RatingAverages {
  averageFloor: number;
  averageSpace: number;
  averageSafety: number;
  averageSound: number;
  averageVibe: number;
  overallAverage: number;
  ratingsCount: number;
}

// --- API & Page-specific Types ---
export interface NominatimAddress {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
}

export interface NominatimReverseGeocodingResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
  boundingbox: string[];
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

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profilePictureUrl: string | null;
  };
}

export interface Photo {
  id: number;
  url: string;
  userId: string;
}

export interface Like {
  userId: string;
  locationId: number;
}

// The comprehensive type for the location detail page
export type LocationDetail = Location & RatingAverages & {
  user: { id: string; name: string; };
  photos: Photo[];
  comments: Comment[];
  likes: Like[];
  ratings: Rating[];
  likesCount: number;
};

// --- Component Prop Types ---
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