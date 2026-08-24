import React from 'react';
import { Layers, Eye, EyeOff, Upload, Trash2, Maximize2, Globe, Sparkles } from 'lucide-react';
import { UELELayer } from '../../types/uele';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

export interface UELELayersDrawerProps {
  layers: UELELayer[];
  onToggleLayer: (layerId: string) => void;
  onResetLayers: () => void;
  onRemoveLayer?: (layerId: string) => void;
  onOpenImportModal: () => void;
  onClose?: () => void;
  featureCountsByLayer?: Record<string, number>;
}

export const UELELayersDrawer: React.FC<UELELayersDrawerProps> = ({
  layers,
  onToggleLayer,
  onResetLayers,
  onRemoveLayer,
  onOpenImportModal,
  onClose,
  featureCountsByLayer = {},
}) => {
  return (
    <Card padding="md" className="space-y-4 bg-[var(--bg-surface)] border border-cyan-500/40 shadow-2xl font-mono">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-[var(--text-primary)] uppercase">
              GIS LAYER MANAGER
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Manage CAD, BIM & Vector GIS Layers
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <Button variant="ghost" size="sm" onClick={onResetLayers}>
            Reset
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Import GIS CTA Button */}
      <Button
        variant="cyan"
        size="sm"
        className="w-full"
        leftIcon={<Upload className="w-3.5 h-3.5" />}
        onClick={onOpenImportModal}
      >
        Import Shapefile (.ZIP) or GeoJSON
      </Button>

      {/* Layers List */}
      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {layers.map((layer) => {
          const count = featureCountsByLayer[layer.id] || 0;
          const isImported = layer.id.startsWith('shp-') || layer.id.startsWith('geojson-');

          return (
            <div
              key={layer.id}
              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                layer.visible
                  ? 'bg-[var(--bg-elevated)] border-cyan-500/40 text-[var(--text-primary)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] opacity-60'
              }`}
            >
              <div
                onClick={() => onToggleLayer(layer.id)}
                className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: layer.color }}
                />
                <div className="space-y-0.5 truncate">
                  <div className="font-bold flex items-center gap-1.5 truncate">
                    <span className="truncate">{layer.name}</span>
                    {isImported && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-normal shrink-0">
                        💾 Saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Badge variant="muted" size="sm">
                      {layer.category}
                    </Badge>
                    <span className="text-cyan-400 font-semibold">{count} features</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleLayer(layer.id)}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  className="p-1 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                </button>

                {isImported && onRemoveLayer && (
                  <button
                    type="button"
                    onClick={() => onRemoveLayer(layer.id)}
                    title="Remove Imported Layer"
                    className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>WGS84 EPSG:4326 GIS</span>
        </span>
        <span className="text-cyan-400 font-semibold">
          {layers.filter((l) => l.visible).length} / {layers.length} Layers Active
        </span>
      </div>
    </Card>
  );
};
