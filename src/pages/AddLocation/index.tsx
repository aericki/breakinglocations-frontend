// src/pages/AddLocation/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { LatLng } from "leaflet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getReverseGeocoding } from "@/api/getReverseGeocoding";
import { createLocation, fetchAllLocations } from "@/api/locationApi";
import { NewLocationData, Location } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft, CheckCircle, AlertTriangle, LocateFixed} from "lucide-react";
import { getDistanceInMeters } from "@/lib/utils";
import { useGeolocation } from "@/hooks/use-geolocation";
import "leaflet/dist/leaflet.css";

import LocationMap from "./LocationMap";
import LocationForm from "./LocationForm";

import MapInstructionOverlay from "./MapInstructionOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AddLocationPage: React.FC = () => {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const { coordinates: userLocation, error: geolocationError } = useGeolocation();

  const [formValues, setFormValues] = useState<NewLocationData>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    whatsapp: "",
    latitude: 0,
    longitude: 0,
  });
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [existingLocations, setExistingLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState<(Location & { distance: number })[]>([]);
  const [currentMapCenter, setCurrentMapCenter] = useState<LatLng>(new LatLng(-14.235, -51.925));
  const [currentMapZoom, setCurrentMapZoom] = useState(4);
  const [initialMapCenterSet, setInitialMapCenterSet] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: "Selecionar Local", description: "Clique no mapa para marcar o ponto" },
    { number: 2, title: "Informações", description: "Preencha os detalhes do local" },
    { number: 3, title: "Confirmar", description: "Revise e salve o local" }
  ];

  const handleMapClick = useCallback(
    async (latlng: LatLng) => {
      if (!latlng) return;
      setMarkerPosition(latlng);
      setCurrentMapCenter(latlng);
      setCurrentStep(2);
      setIsGeocoding(true);
      setFormValues((prev) => ({
        ...prev,
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        latitude: latlng.lat,
        longitude: latlng.lng,
      }));

      try {
        const data = await getReverseGeocoding(latlng.lat, latlng.lng);
        if (data && data.address) {
          setFormValues((prev) => ({
            ...prev,
            address: data.address.road || "Endereço não encontrado",
            city: data.address.city || data.address.town || "",
            state: data.address.state || "",
            country: data.address.country || "",
          }));
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        toast({
          variant: "destructive",
          title: "Erro de Geocodificação",
          description: "Não foi possível buscar o endereço.",
        });
      } finally {
        setIsGeocoding(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (userLocation && !initialMapCenterSet) {
      setCurrentMapCenter(userLocation);
      setCurrentMapZoom(13);
      setInitialMapCenterSet(true);
      toast({
        title: "Localização encontrada!",
        variant: "default",
        description: "Agora clique no mapa para marcar o ponto exato.",
      });
    }
    if (geolocationError && !initialMapCenterSet) {
      toast({
        variant: "destructive",
        title: "Erro de Localização",
        description: "Não foi possível obter sua localização. Verifique as permissões.",
      });
      setInitialMapCenterSet(true);
    }
  }, [userLocation, geolocationError, initialMapCenterSet, toast]);

  useEffect(() => {
    if (!firebaseUser) return;
    const loadExistingLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const locations = await fetchAllLocations(firebaseUser);
        setExistingLocations(locations);
      } catch (error) {
        console.error("Erro ao carregar locais existentes:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os locais existentes.",
        });
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadExistingLocations();
  }, [firebaseUser, toast]);

  const handleLocateUser = () => {
    if (userLocation) {
      setCurrentMapCenter(userLocation);
      setCurrentMapZoom(15);
    } else if (geolocationError) {
      toast({
        variant: "destructive",
        title: "Erro de Localização",
        description: "Não foi possível obter sua localização. Verifique as permissões e tente novamente.",
      });
    }
  };

  useEffect(() => {
    if (!markerPosition) {
      setNearbyLocations([]);
      return;
    }
    const nearby = existingLocations
      .map((location) => ({
        ...location,
        distance: getDistanceInMeters(
          markerPosition,
          new LatLng(location.latitude, location.longitude)
        ),
      }))
      .filter((location) => location.distance < 500)
      .sort((a, b) => a.distance - b.distance);
    setNearbyLocations(nearby);
  }, [markerPosition, existingLocations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !markerPosition) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, clique no mapa para definir um local.",
      });
      return;
    }
    if (!formValues.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do local é obrigatório.",
      });
      return;
    }
    if (nearbyLocations.length > 0) {
      const confirmed = window.confirm(
        `Atenção: Existem ${nearbyLocations.length} locais próximos. Deseja continuar?`
      );
      if (!confirmed) return;
    }

    setCurrentStep(3);
    setIsSubmitting(true);
    try {
      await createLocation(formValues, firebaseUser);
      toast({
        title: "Local cadastrado com sucesso!",
        description: "Seu spot foi adicionado à comunidade.",
      });
      navigate("/locations");
    } catch (error) {
      console.error("Erro ao criar local:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar a localização.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "whatsapp") {
      const onlyNums = value.replace(/\D/g, "");
      let formatted = "";
      if (onlyNums.length > 0) {
        formatted = `(${onlyNums.substring(0, 2)}`;
      }
      if (onlyNums.length > 2) {
        formatted += `) ${onlyNums.substring(2, 7)}`;
      }
      if (onlyNums.length > 7) {
        formatted += `-${onlyNums.substring(7, 11)}`;
      }
      setFormValues((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-4 sm:p-1 lg:p-8">
        {/* Header */}
        <header className="mb-8 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                to="/locations"
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Voltar</span>
              </Link>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentStep === 1 && "Selecione um Local"}
              {currentStep === 2 && "Complete os Detalhes"}
              {currentStep === 3 && "Finalizando..."}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {currentStep === 1 && "Clique no mapa para marcar exatamente onde fica o seu spot favorito"}
              {currentStep === 2 && "Preencha as informações para que outros dançarinos possam encontrar"}
              {currentStep === 3 && "Aguarde enquanto salvamos seu local"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle size={16} />
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <Card className="relative backdrop-blur-sm border-0 shadow-2xl rounded-lg bg-transparent">
            <CardHeader className=" rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 pl-6 ">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  {markerPosition ? "Local Selecionado" : "Selecione no Mapa"}
                </CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLocateUser}
                  className="rounded-lg"
                >
                  <LocateFixed className="w-4 h-4 mr-2" />
                  Minha Localização
                </Button>
              </div>
            </CardHeader>
            <CardContent className="  ">
              <div className="relative w-full h-[400px] lg:h-[600px]">
                {!markerPosition && <MapInstructionOverlay />}
                <LocationMap
                  mapCenter={currentMapCenter}
                  mapZoom={currentMapZoom}
                  isLoading={isLoadingLocations}
                  markerPosition={markerPosition}
                  existingLocations={existingLocations}
                  onMapClick={handleMapClick}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl transition-all duration-500 ${
            markerPosition ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'
          }`}>
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Detalhes do Local
              </CardTitle>
              {markerPosition && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  Localização definida no mapa
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {/* Nearby Locations Warning */}
              {nearbyLocations.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Locais Próximos Encontrados</h4>
                      <p className="text-sm text-amber-800 mb-3">
                        Encontramos {nearbyLocations.length} {nearbyLocations.length === 1 ? 'local próximo' : 'locais próximos'}. 
                        Verifique se não é duplicado.
                      </p>
                      <div className="space-y-2">
                        {nearbyLocations.slice(0, 3).map(loc => (
                          <div key={loc.id} className="text-sm bg-white rounded-lg p-2 border border-amber-200">
                            <strong>{loc.name}</strong> - {Math.round(loc.distance)}m de distância
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <LocationForm
                formValues={formValues}
                isSubmitting={isSubmitting}
                isGeocoding={isGeocoding}
                markerPosition={markerPosition}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onLocateUser={handleLocateUser}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddLocationPage;