export const getReverseGeocoding = async (lat: number, lng: number): Promise<any> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BreakingLocationsApp/1.0' // Nominatim requires a User-Agent
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reverse geocoding data. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Reverse geocoding response:', data);
    return data;

  } catch (error) {
    console.error("Error in getReverseGeocoding:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
};
