import React, { useState } from 'react';
import { UELEFacility, UELE3DModel, UELELayer } from '../../../types/adminUele';
import { UELE2DMap } from '../../uele/UELE2DMap';
import { UELE3DView } from '../../uele/UELE3DView';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import { Map, Compass, X, Globe } from 'lucide-react';

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: '2d' | '3d';
  title: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  facility?: UELEFacility | null;
  model3D?: UELE3DModel | null;
  layers?: UELELayer[];
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({
  isOpen,
  onClose,
  initialMode = '2d',
  title,
  latitude = 24.6800,
  longitude = 89.4100,
  elevation = 18.5,
  facility,
  model3D,
  layers = [],
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(initialMode);

  if (!isOpen) return null;

  // Synthesize GIS feature for live preview
  const previewFeatures = facility
    ? [
        {
          id: facility.id,
          name: facility.name,
          category: facility.category,
          coordinates: [
            facility.longitude || longitude,
            facility.latitude || latitude,
            facility.elevation || elevation,
          ] as [number, number, number],
          properties: {
            code: facility.code || 'FAC-PREVIEW',
            type: 'Facility',
            status: facility.status,
            elevation: facility.elevation || elevation,
            description: facility.description,
          },
        },
      ]
    : [
        {
          id: 'preview-target',
          name: title,
          category: 'water-systems' as const,
          coordinates: [longitude, latitude, elevation] as [number, number, number],
          properties: {
            code: 'PREVIEW-1',
            type: 'Geographic Target',
            elevation,
          },
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{title} - Live Spatial Preview</h3>
              <p className="text-[11px] font-mono text-cyan-400">
                WGS84 EPSG:4326: {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E ({elevation}m MSL)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === '2d'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>2D Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === '3d'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>3D Twin</span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          {viewMode === '2d' ? (
            <UELE2DMap
              features={previewFeatures as any}
              layers={layers}
              selectedFeatureId={facility?.id || 'preview-target'}
              onSelectFeature={() => {}}
              activeBasemapId="satellite"
              onBasemapChange={() => {}}
              onOpenImportModal={() => {}}
              onResetView={() => {}}
            />
          ) : (
            <UELE3DView
              features={previewFeatures as any}
              layers={layers}
              selectedFeatureId={facility?.id || 'preview-target'}
              onSelectFeature={() => {}}
              onResetView={() => {}}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              EPSG:4326 Single Source of Truth
            </Badge>
            <span>Live 2D & 3D Geographic Alignment</span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};
