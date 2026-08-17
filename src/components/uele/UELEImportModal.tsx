import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertTriangle, X, Layers, Sparkles } from 'lucide-react';
import { importShapefileZip, importGeoJSONFile, ImportGISResult } from '../../utils/gisImporter';
import { UELE_SYSTEM_CATEGORIES } from '../../data/uele-categories';
import { UELESystemCategory } from '../../types/uele';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';

export interface UELEImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: ImportGISResult) => void;
}

export const UELEImportModal: React.FC<UELEImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [layerName, setLayerName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<UELESystemCategory>('gis-digital-engineering');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ImportGISResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      setParseResult(null);

      // Default layer name from file name
      const cleanName = file.name.replace(/\.(zip|geojson|json)$/i, '').replace(/[-_]/g, ' ');
      setLayerName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setParseResult(null);

    const fileNameLower = selectedFile.name.toLowerCase();
    let result: ImportGISResult;

    if (fileNameLower.endsWith('.zip')) {
      result = await importShapefileZip(selectedFile, layerName, selectedCategory);
    } else if (fileNameLower.endsWith('.geojson') || fileNameLower.endsWith('.json')) {
      result = await importGeoJSONFile(selectedFile, layerName, selectedCategory);
    } else {
      setIsProcessing(false);
      setErrorMessage('Unsupported file format. Please upload a .zip (Shapefile) or .geojson / .json file.');
      return;
    }

    setIsProcessing(false);

    if (result.success) {
      setParseResult(result);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleConfirmAddLayer = () => {
    if (parseResult) {
      onImportSuccess(parseResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-cyan-500/40 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 font-mono relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                IMPORT GIS SPATIAL DATA
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Upload Shapefile ZIP (.shp, .shx, .dbf) or GeoJSON (.geojson)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Selection Zone */}
        {!parseResult && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-slate-950/50 hover:bg-cyan-500/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
              <FileCode className="w-10 h-10 text-cyan-400 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-slate-200">
                {selectedFile ? selectedFile.name : 'Click or Drag & Drop GIS File'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Supports .ZIP (Shapefile bundle) or .GEOJSON / .JSON files
              </span>
              <input
                type="file"
                accept=".zip,.geojson,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Layer Options Inputs */}
            {selectedFile && (
              <div className="space-y-3 bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)]">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-bold uppercase">
                    Layer Display Name
                  </label>
                  <input
                    type="text"
                    value={layerName}
                    onChange={(e) => setLayerName(e.target.value)}
                    placeholder="Enter custom layer name..."
                    className="w-full bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-bold uppercase">
                    Target Category Group
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as UELESystemCategory)}
                    className="w-full bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    {UELE_SYSTEM_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title} ({cat.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="emerald"
                size="sm"
                disabled={!selectedFile || isProcessing}
                onClick={handleProcessFile}
                isLoading={isProcessing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Parse & Validate GIS File
              </Button>
            </div>
          </div>
        )}

        {/* Parse Result Preview */}
        {parseResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>GIS DATA VALIDATED & PARSED</span>
              </div>
              <p className="text-xs text-slate-300">{parseResult.message}</p>

              <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px]">
                <Badge variant="emerald">Features: {parseResult.featureCount}</Badge>
                <Badge variant="cyan">CRS: {parseResult.crsDetected}</Badge>
                <Badge variant="purple">Geometries: {parseResult.geometryTypes.join(', ')}</Badge>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="text-purple-400 font-bold flex items-center gap-1 pb-1 border-b border-slate-800">
                <span>🌐 Global Cloud Storage: Saved for All Website Visitors</span>
              </div>
              <div>
                <span className="text-slate-200 font-bold">Target Layer Name:</span>{' '}
                {parseResult.layer.name}
              </div>
              <div>
                <span className="text-slate-200 font-bold">Target Category:</span>{' '}
                {parseResult.layer.category}
              </div>
              <div>
                <span className="text-slate-200 font-bold">Bounding Box Extent:</span>{' '}
                [{parseResult.bounds.map((b) => b.toFixed(4)).join(', ')}]
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParseResult(null);
                  setSelectedFile(null);
                }}
              >
                Back
              </Button>
              <Button
                variant="cyan"
                size="sm"
                leftIcon={<Layers className="w-4 h-4" />}
                onClick={handleConfirmAddLayer}
              >
                Add Layer to GIS Map
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
