import React from 'react';
import { X } from 'lucide-react';
import WaterTreatmentPlantApp from './WaterTreatmentPlantApp';

interface WaterTreatmentPlantOverlayProps {
  onClose: () => void;
}

/**
 * Full-screen overlay that hosts the standalone Water Treatment Plant
 * visualization. Rendered on top of the main game world when the player
 * clicks the riverside plant landmark; the small "Back to Map" button lets
 * them return to the open world.
 */
export const WaterTreatmentPlantOverlay: React.FC<WaterTreatmentPlantOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-[10000] flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md hover:bg-slate-800 transition-colors"
        title="ম্যাপে ফিরে যান"
      >
        <X className="w-3.5 h-3.5" />
        ম্যাপে ফিরুন
      </button>
      <WaterTreatmentPlantApp />
    </div>
  );
};
