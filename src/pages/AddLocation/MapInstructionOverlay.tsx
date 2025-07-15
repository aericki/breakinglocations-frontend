// src/pages/AddLocation/MapInstructionOverlay.tsx
import React from 'react';
import { MapPin } from 'lucide-react';

const MapInstructionOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
      <div className="text-center text-white bg-black/50 p-6 rounded-lg shadow-lg">
        <MapPin className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold">Selecione um Local</h2>
        <p className="mt-2">Clique no mapa para marcar um novo ponto de treino.</p>
      </div>
    </div>
  );
};

export default MapInstructionOverlay;
