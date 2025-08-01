// src/pages/Locations/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { fetchLocations } from "@/api/locationApi";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types";
import { LatLngExpression } from "leaflet";
import {
  SearchIcon,
  Loader2Icon,
  MapPin,
  Navigation,
  Star,
  Phone,
  Plus,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

// --- Componente de Card de Local ---
const LocationCard: React.FC<{
  location: Location;
  onLocationSelect: (location: Location) => void;
  isSelected: boolean;
}> = ({ location, onLocationSelect, isSelected }) => {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border ${
        isSelected
          ? "border-blue-500 bg-blue-50/80 shadow-lg ring-2 ring-blue-500/20"
          : "border-gray-200 bg-white/90 backdrop-blur-sm hover:border-blue-300 hover:shadow-md"
      }`}
      onClick={() => onLocationSelect(location)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {location.name}
            </h3>
            <Badge 
              className="mt-1 text-xs bg-gray-100 text-gray-700"
            >
              {location.city}
            </Badge>
          </div>
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isSelected
                ? "bg-blue-500"
                : "bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-105"
            }`}
          >
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {location.address}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
              <span className="font-medium">4.5</span>
            </div>
            {location.whatsapp && (
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1 text-green-500" />
                <span>WhatsApp</span>
              </div>
            )}
          </div>
          <Link
            to={`/locations/${location.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Ver detalhes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Componente Principal da Página ---
const LocationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("city") || ""
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([
    -14.235, -51.925,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    "Digite uma cidade para começar a busca."
  );
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

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
      setSelectedLocation(null);
      setSearchParams({ city: city });
      
      try {
        const data = await fetchLocations(firebaseUser, city);
        setLocations(data);
        if (data.length === 0) {
          setMessage("Nenhuma localização encontrada para esta cidade.");
        } else {
          setMapCenter([data[0].latitude, data[0].longitude]);
          setSelectedLocation(data[0]);
          setShowMobileList(true); // Mostra a lista automaticamente no mobile
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
    setShowMobileSearch(false);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);
    setShowMobileList(false); // Fecha a lista no mobile ao selecionar
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-gradient-to-br from-blue-50 to-indigo-50">
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm border-b sticky top-0 z-30 shadow-sm">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Explorar Locais
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowMobileSearch(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white hover:from-blue-700 hover:to-purple-700"
              >
                <SearchIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Buscar</span>
              </Button>
              {locations.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowMobileList(!showMobileList)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white hover:from-blue-700 hover:to-purple-700"
                >
                  {showMobileList ? (
                    <ChevronDown className="w-4 h-4 sm:mr-2" />
                  ) : (
                    <ChevronUp className="w-4 h-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {locations.length} {locations.length === 1 ? 'local' : 'locais'}
                  </span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Quick Search Bar */}
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Buscando em: <span className="font-medium">{searchQuery}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-lg font-semibold">Buscar Locais</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 flex-1">
            <form onSubmit={onSearchSubmit} className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome da cidade"
                  className="pl-10 h-12 rounded-lg text-base"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 rounded-lg text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5 mr-2" />
                    Buscar Locais
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile List Overlay */}
      {showMobileList && locations.length > 0 && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-20 z-40 bg-white/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {locations.length} {locations.length === 1 ? 'local encontrado' : 'locais encontrados'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileList(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onLocationSelect={handleLocationSelect}
                  isSelected={selectedLocation?.id === location.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-full lg:w-2/5 xl:w-1/3 2xl:w-1/4 flex-col bg-white/90 backdrop-blur-sm border-r overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h1 className="text-2xl font-bold mb-4">Explorar Locais</h1>
          <form onSubmit={onSearchSubmit} className="space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome da cidade"
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-lg h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              variant="secondary"
              className="w-full h-11 rounded-lg font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-5 w-5" />
                  Buscar Locais
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {locations.length > 0 && (
            <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {locations.length}{" "}
                {locations.length === 1
                  ? "local encontrado"
                  : "locais encontrados"}
              </h2>
              <Button variant="outline" size="sm" className="rounded-lg">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          )}

          <div className="p-4">
            <div className="space-y-3">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onLocationSelect={handleLocationSelect}
                  isSelected={selectedLocation?.id === location.id}
                />
              ))}
            </div>

            {message && locations.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {message}
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Seja o primeiro a adicionar um local nesta cidade!
                </p>
                <Link to="/add-location">
                  <Button className="rounded-lg px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Local
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative">
        {isLoading && locations.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
            <div className="text-center p-8">
              <Loader2Icon
                className="animate-spin text-blue-600 mx-auto mb-4"
                size={48}
              />
              <p className="text-gray-600 font-medium text-lg">Buscando locais...</p>
              <p className="text-gray-500 text-sm mt-2">Aguarde um momento</p>
            </div>
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
                eventHandlers={{
                  click: () => handleLocationSelect(location),
                }}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="p-3 min-w-[280px]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                          {location.name}
                        </h3>
                        <Badge className="text-xs">
                          {location.city}
                        </Badge>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {location.address}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">4.5</span>
                        </div>
                        {location.whatsapp && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-green-500" />
                            <span>WhatsApp</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/locations/${location.id}`} className="flex-1">
                        <Button size="sm" className="w-full rounded-lg text-xs font-medium">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full rounded-lg text-xs font-medium"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Ir
                        </Button>
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Empty State Overlay */}
        {message && locations.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none p-4">
            <Card className="max-w-sm mx-auto pointer-events-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border-0">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Nenhum local encontrado
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Seja o primeiro a adicionar um local nesta cidade!
                </p>
                <Link to="/add-location">
                  <Button
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Local
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating Action Button - Mobile */}
        <div className="lg:hidden fixed bottom-6 right-4 z-[1000]">
          <Link to="/add-location">
            <Button
              size="lg"
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </Link>
        </div>

        {/* Selected Location Info - Mobile */}
        {selectedLocation && !showMobileList && (
          <div className="lg:hidden fixed bottom-20 left-4 right-4 z-[1000]">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                      {selectedLocation.name}
                    </h3>
                    <Badge  className="mt-1 text-xs">
                      {selectedLocation.city}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLocation(null)}
                    className="rounded-lg flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                  {selectedLocation.address}
                </p>

                <div className="flex gap-2">
                  <Link
                    to={`/locations/${selectedLocation.id}`}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full rounded-lg font-medium">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-lg font-medium"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Como Chegar
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LocationsPage;