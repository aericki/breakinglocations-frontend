// src/pages/AddLocation/LocationForm.tsx
import React from 'react';
import { ClipLoader } from 'react-spinners';
import { NewLocationData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocateFixed, CheckCircle } from 'lucide-react';

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
  onLocateUser,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Detalhes do Local</h3>
        <Button type="button" variant="outline" size="sm" onClick={onLocateUser}>
          <LocateFixed className="mr-2 h-4 w-4" />
          Usar minha localização
        </Button>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Local</Label>
        <Input id="name" name="name" placeholder="Ex: Posto Central" value={formValues.name} onChange={onInputChange} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" name="address" placeholder={isGeocoding ? "Buscando..." : "Preenchido pelo mapa"} value={formValues.address} onChange={onInputChange} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="city">Município</Label>
        <Input id="city" name="city" placeholder={isGeocoding ? "Buscando..." : "Preenchido pelo mapa"} value={formValues.city} disabled readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          placeholder="(99) 99999-9999"
          value={formValues.whatsapp}
          onChange={onInputChange}
          maxLength={15}
        />
      </div>
      {markerPosition && (
        <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span>Localização selecionada no mapa.</span>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting || isGeocoding || !markerPosition}>
        {isSubmitting ? <><ClipLoader size={16} color="#fff" className="mr-2" /> Salvando...</> : 'Salvar Local'}
      </Button>
    </form>
  );
};

export default LocationForm;
