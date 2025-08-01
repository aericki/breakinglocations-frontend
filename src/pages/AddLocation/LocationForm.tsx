// src/pages/AddLocation/LocationForm.tsx
import React from 'react';
import { Loader2, Save, MapPin, Phone, Building, Navigation } from 'lucide-react';
import { NewLocationData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LocationFormProps {
  formValues: NewLocationData;
  isSubmitting: boolean;
  isGeocoding: boolean;
  markerPosition: L.LatLng | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onLocateUser: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  formValues,
  isSubmitting,
  isGeocoding,
  markerPosition,
  onInputChange,
  onSubmit,
}) => {
  const isFormValid = markerPosition && formValues.name.trim();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nome do Local */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Nome do Local *
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Praça Central, Quadra do Bairro..."
          value={formValues.name}
          onChange={onInputChange}
          required
          className="rounded-xl border-2 focus:border-blue-500 transition-all duration-300"
          disabled={!markerPosition}
        />
        <p className="text-xs text-gray-500">
          Escolha um nome que ajude outros dançarinos a identificar o local
        </p>
      </div>

      {/* Endereço */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-green-600" />
          Endereço
        </Label>
        <div className="relative">
          <Input
            id="address"
            name="address"
            placeholder={isGeocoding ? "Buscando endereço..." : "Endereço será preenchido automaticamente"}
            value={formValues.address}
            onChange={onInputChange}
            className="rounded-xl border-2 pr-10 transition-all duration-300"
            disabled={!markerPosition}
          />
          {isGeocoding && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          )}
        </div>
        {formValues.address && (
          <Badge variant="success" className="w-fit">
            Endereço encontrado automaticamente
          </Badge>
        )}
      </div>

      {/* Cidade */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-600" />
          Cidade
        </Label>
        <Input
          id="city"
          name="city"
          placeholder={isGeocoding ? "Identificando cidade..." : "Cidade"}
          value={formValues.city}
          className="rounded-xl border-2 bg-gray-50 transition-all duration-300"
          disabled
          readOnly
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-600" />
          WhatsApp (Opcional)
        </Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          placeholder="(11) 99999-9999"
          value={formValues.whatsapp}
          onChange={onInputChange}
          maxLength={15}
          className="rounded-xl border-2 focus:border-green-500 transition-all duration-300"
          disabled={!markerPosition}
        />
        <p className="text-xs text-gray-500">
          Facilite o contato com outros dançarinos interessados no local
        </p>
      </div>

      {/* Coordenadas (apenas visual) */}
      {markerPosition && (
        <Card className="bg-blue-50 border-blue-200 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Coordenadas</span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>Latitude: {markerPosition.lat.toFixed(6)}</div>
              <div>Longitude: {markerPosition.lng.toFixed(6)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
            isFormValid
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={isSubmitting || isGeocoding || !isFormValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Salvando Local...
            </>
          ) : !markerPosition ? (
            <>
              <MapPin className="mr-2 h-5 w-5" />
              Primeiro selecione no mapa
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Salvar Local
            </>
          )}
        </Button>
        
        {!markerPosition && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Clique em qualquer ponto do mapa para começar
          </p>
        )}
      </div>
    </form>
  );
};

export default LocationForm;