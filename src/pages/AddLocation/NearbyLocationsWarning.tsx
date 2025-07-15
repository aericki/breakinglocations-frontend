// src/pages/AddLocation/NearbyLocationsWarning.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Location } from '@/types';

interface NearbyLocationsWarningProps {
  locations: (Location & { distance: number })[];
}

const NearbyLocationsWarning: React.FC<NearbyLocationsWarningProps> = ({ locations }) => {
  if (locations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="p-4 border rounded-lg bg-amber-50 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">Aviso de Duplicata Potencial</h4>
          <p className="text-sm">O ponto selecionado está próximo de locais existentes. Verifique o mapa e a lista abaixo.</p>
        </div>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Locais Próximos Encontrados</h3>
        <ul className="space-y-2">
          {locations.map(loc => (
            <li key={loc.id} className="text-sm">
              <strong>{loc.name}</strong> ({Math.round(loc.distance)}m)
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default NearbyLocationsWarning;
