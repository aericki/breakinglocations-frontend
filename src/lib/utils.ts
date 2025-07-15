import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LatLng } from "leaflet";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the distance between two geographical coordinates in meters.
 * Uses the Haversine formula for accuracy.
 * @param point1 - The first coordinate (LatLng).
 * @param point2 - The second coordinate (LatLng).
 * @returns The distance in meters.
 */
export function getDistanceInMeters(point1: LatLng, point2: LatLng): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = point1.lat * Math.PI / 180; // φ, λ in radians
  const phi2 = point2.lat * Math.PI / 180;
  const deltaPhi = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLambda = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Removes diacritics (accents) from a string.
 * @param str The string to normalize.
 * @returns The string without accents.
 */
export function unidecode(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
