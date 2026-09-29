/**
 * EVLab WaterFlow - Import / Export Center
 * Handles EPANET .INP, GeoJSON, and CSV export/import files.
 */

import React, { useRef } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { EPANETParser } from '../../core/parser/epanetParser';
import { X, FileText, Download, Upload, Layers } from 'lucide-react';

export const ImportExportDialog: React.FC = () => {
  const { model, setModel, runSimulation, setActiveDialog } = useWaterFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportINP = () => {
    const text = EPANETParser.exportINP(model);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.title.toLowerCase().replace(/\s+/g, '_')}.inp`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify({
      ...model,
      nodes: Array.from(model.nodes instanceof Map ? model.nodes.entries() : Object.entries(model.nodes)),
      links: Array.from(model.links instanceof Map ? model.links.entries() : Object.entries(model.links))
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.inp')) {
        const parsed = EPANETParser.parseINP(content);
        setModel(parsed);
        setTimeout(() => runSimulation(), 100);
        setActiveDialog(null);
      } else if (file.name.endsWith('.json')) {
        const raw = JSON.parse(content);
        const nodesMap = new Map(raw.nodes);
        const linksMap = new Map(raw.links);
        setModel({
          ...raw,
          nodes: nodesMap,
          links: linksMap
        });
        setTimeout(() => runSimulation(), 100);
        setActiveDialog(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".inp,.json" className="hidden" />
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Data Import & Export Center</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-2 gap-4 text-xs">
          {/* Import Card */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" /> Import Model
              </h3>
              <p className="text-slate-400 text-[11px]">Import existing EPANET .INP network files or EVLab WaterFlow .JSON models.</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded shadow transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Browse File (.INP, .JSON)</span>
            </button>
          </div>

          {/* Export Card */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" /> Export Model
              </h3>
              <p className="text-slate-400 text-[11px]">Save standard EPANET .INP input files or EVLab JSON project state.</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleExportINP}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2 rounded border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Export EPANET (.INP)</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 rounded border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Project (.JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
