// src/pages/Locations/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom"; // Import Link
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { fetchLocations } from "@/api/locationApi";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types";
import { LatLngExpression } from "leaflet";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- Configuração dos Ícones do Leaflet ---
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Componente Auxiliar para Mover o Mapa ---
const FlyToLocation: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

// --- Componente Principal da Página ---
const LocationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("city") || ""
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    -14.235, -51.925,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    "Digite uma cidade para começar a busca."
  );

  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const handleSearch = useCallback(
    async (city: string) => {
      if (!city.trim()) {
        toast({
          variant: "destructive",
          title: "Atenção",
          description: "Por favor, digite o nome da cidade.",
        });
        return;
      }
      setIsLoading(true);
      setMessage(null);
      setLocations([]);
      setSearchParams({ city: city });
      try {
        const data = await fetchLocations(firebaseUser, city);
        setLocations(data);
        if (data.length === 0) {
          setMessage("Nenhuma localização encontrada para esta cidade.");
        } else {
          setMapCenter([data[0].latitude, data[0].longitude]);
        }
      } catch (error) {
        console.error("Erro ao buscar localizações:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao buscar as localizações.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [firebaseUser, toast, setSearchParams]
  );

  useEffect(() => {
    const city = searchParams.get("city");
    if (city) {
      setSearchQuery(city);
      handleSearch(city);
    }
  }, [searchParams, handleSearch]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/3 xl:w-1/4 p-4 sm:p-6 bg-white border-r overflow-y-auto">
        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o nome da cidade"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="mr-2 h-4 w-4" />
            )}
            <span>{isLoading ? "Buscando..." : "Buscar"}</span>
          </Button>
        </form>

        <div>
          {locations.length > 0 && (
            <h2 className="text-xl font-semibold mb-4">
              Resultados ({locations.length})
            </h2>
          )}
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="p-3 border rounded-lg hover:shadow-md hover:border-primary transition-all cursor-pointer"
                onClick={() =>
                  setMapCenter([location.latitude, location.longitude])
                }
              >
                <h3 className="font-bold text-md text-primary">
                  {location.name}
                </h3>
                <p className="text-sm text-muted-foreground">{location.address}</p>
                {firebaseUser && location.whatsapp && (
                  <p className="text-sm text-muted-foreground mt-1">
                    WhatsApp: {location.whatsapp}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-grow h-[50vh] lg:h-full">
        {isLoading && locations.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-muted">
            <Loader2Icon className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={locations.length > 0 ? 12 : 4}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {locations.length > 0 && <FlyToLocation center={mapCenter} />}
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <div className="p-1 space-y-2">
                    <h3 className="font-bold text-lg text-primary mb-1">
                      {location.name}
                    </h3>
                    <p className="text-muted-foreground mb-1">{location.address}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {location.city}, {location.state}
                    </p>
                    <Link
                      to={`/locations/${location.id}`}
                      className="block !text-white text-center py-2 px-3 rounded-lg font-semibold shadow transition-colors bg-primary hover:bg-primary/90"
                    >
                      Ver Detalhes
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block !text-white text-center py-2 px-3 rounded-lg font-semibold shadow transition-colors bg-blue-600 hover:bg-blue-700"
                    >
                      Como chegar
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
            {message && locations.length === 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-[1000]">
                <p className="text-lg text-foreground">{message}</p>
              </div>
            )}
          </MapContainer>
        )}
      </main>
    </div>
  );
};

export default LocationsPage;
