// src/pages/AddLocation/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { LatLng } from "leaflet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getReverseGeocoding } from "@/api/getReverseGeocoding";
import { createLocation, fetchAllLocations } from "@/api/locationApi";
import { NewLocationData, Location } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { getDistanceInMeters } from "@/lib/utils";
import { useGeolocation } from "@/hooks/use-geolocation";
import "leaflet/dist/leaflet.css";

import LocationMap from "./LocationMap";
import LocationForm from "./LocationForm";
import NearbyLocationsWarning from "./NearbyLocationsWarning";
import MapInstructionOverlay from "./MapInstructionOverlay";

const AddLocationPage: React.FC = () => {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const { coordinates: userLocation, error: geolocationError } =
    useGeolocation();

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
  const [nearbyLocations, setNearbyLocations] = useState<
    (Location & { distance: number })[]
  >([]);
  const [currentMapCenter, setCurrentMapCenter] = useState<LatLng>(
    new LatLng(-14.235, -51.925)
  );
  const [currentMapZoom, setCurrentMapZoom] = useState(4);
  const [initialMapCenterSet, setInitialMapCenterSet] = useState(false);

  const handleMapClick = useCallback(
    async (latlng: LatLng) => {
      if (!latlng) return;
      setMarkerPosition(latlng);
      setCurrentMapCenter(latlng); // Center map on the clicked marker
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
      setCurrentMapZoom(13); // Zoom out a bit to show the city context
      setInitialMapCenterSet(true);
      toast({
        title: "Sucesso",
        description:
          "Localização encontrada! Agora, clique no mapa para marcar o ponto exato.",
      });
    }
    if (geolocationError && !initialMapCenterSet) {
      toast({
        variant: "destructive",
        title: "Erro de Localização",
        description:
          "Não foi possível obter sua localização. Verifique as permissões.",
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

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.existing-marker { filter: hue-rotate(120deg) saturate(0.8); }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLocateUser = () => {
    if (userLocation) {
      setCurrentMapCenter(userLocation);
      setCurrentMapZoom(15);
    } else if (geolocationError) {
      toast({
        variant: "destructive",
        title: "Erro de Localização",
        description:
          "Não foi possível obter sua localização. Verifique as permissões e tente novamente.",
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

    setIsSubmitting(true);
    try {
      await createLocation(formValues, firebaseUser);
      toast({
        title: "Sucesso!",
        description: "Local cadastrado com sucesso.",
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <MapPin />{" "}
          {markerPosition ? "Complete os Detalhes" : "Adicionar Novo Local"}
        </h1>
        <Link
          to="/locations"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={16} /> Voltar para a Lista
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Coluna da Esquerda: Mapa (desktop) / Em cima (mobile) */}
        <div
          className={`relative w-full h-[400px] sm:h-[500px] lg:h-[600px] border rounded-lg shadow-sm overflow-hidden order-1 lg:order-1`}
        >
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

        {/* Coluna da Direita: Formulário e Avisos (desktop) / Embaixo (mobile) */}
        <div
          className={`space-y-6 order-2 lg:order-2 ${
            markerPosition ? "block" : "hidden lg:block"
          }`}
        >
          <NearbyLocationsWarning locations={nearbyLocations} />
          <LocationForm
            formValues={formValues}
            isSubmitting={isSubmitting}
            isGeocoding={isGeocoding}
            markerPosition={markerPosition}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onLocateUser={handleLocateUser}
          />
        </div>
      </div>
    </div>
  );
};

export default AddLocationPage;
