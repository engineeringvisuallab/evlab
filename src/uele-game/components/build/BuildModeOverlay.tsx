import React from 'react';
import {
  X,
  Hammer,
  DollarSign,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { BuildItem, PlacedInfrastructure } from '../../types/game';
import { BUILD_ITEMS_CATALOG } from '../../data/buildData';

interface BuildModeOverlayProps {
  funds: number;
  selectedBuildItem: BuildItem | null;
  onSelectBuildItem: (item: BuildItem | null) => void;
  placedItems: PlacedInfrastructure[];
  onRemovePlacedItem: (id: string) => void;
  onClose: () => void;
}

export const BuildModeOverlay: React.FC<BuildModeOverlayProps> = ({
  funds,
  selectedBuildItem,
  onSelectBuildItem,
  placedItems,
  onRemovePlacedItem,
  onClose,
}) => {
  return (
    <div id="build-mode-active-overlay" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6 z-30">
      {/* Top Banner */}
      <div className="pointer-events-auto self-center bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl px-6 py-2.5 shadow-2xl flex items-center gap-4 text-white animate-in slide-in-from-top-4 duration-200">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Hammer className="w-4 h-4 animate-bounce" />
          <span>Construction Mode Active</span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400">Available Capital:</span>
          <span className="font-bold text-emerald-400">${funds.toLocaleString()}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Construction Drawer */}
      <div className="pointer-events-auto self-center max-w-4xl w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-in slide-in-from-bottom-6 duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Select Infrastructure Component to Deploy</span>
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">
            {selectedBuildItem ? 'Click on 3D terrain to snap & place' : 'Select a blueprint below'}
          </span>
        </div>

        {/* Catalog Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto pr-1">
          {BUILD_ITEMS_CATALOG.map((item) => {
            const isSelected = selectedBuildItem?.id === item.id;
            const canAfford = funds >= item.cost;

            return (
              <button
                key={item.id}
                id={`btn-build-item-${item.id}`}
                disabled={!canAfford}
                onClick={() => onSelectBuildItem(isSelected ? null : item)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : canAfford
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-600 text-slate-200 hover:bg-slate-800/60'
                    : 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`}>
                    ${item.cost.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs font-bold truncate w-full">{item.name}</div>
                <div className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.capacityMetric}
                </div>
              </button>
            );
          })}
        </div>

        {/* Placed Infrastructure Quick Manager */}
        {placedItems.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Deployed Infrastructure: <strong className="text-white font-mono">{placedItems.length} elements</strong></span>
            <div className="flex gap-2">
              <button
                onClick={() => onRemovePlacedItem(placedItems[placedItems.length - 1].id)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-[11px] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Undo Last</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
