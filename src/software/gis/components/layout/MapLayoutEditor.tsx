import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { X, Printer, Compass, FileDown, Layers } from 'lucide-react';
import jsPDF from 'jspdf';

export const MapLayoutEditorModal: React.FC = () => {
  const { project, isLayoutEditorOpen, setIsLayoutEditorOpen } = useGIS();

  const [mapTitle, setMapTitle] = useState(project.name);
  const [author, setAuthor] = useState('Engineering Visual Lab (EVLab)');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  if (!isLayoutEditorOpen) return null;

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: paperSize.toLowerCase(),
      });

      // PDF Title Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(mapTitle, 15, 12);

      doc.setFontSize(9);
      doc.setTextColor(56, 189, 248); // cyan-400
      doc.text(`EVLab GIS Engineering Report | Author: ${author}`, 15, 18);

      // Map Frame Placeholder
      const frameWidth = doc.internal.pageSize.width - 30;
      const frameHeight = doc.internal.pageSize.height - 70;

      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.rect(15, 30, frameWidth, frameHeight);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(12);
      doc.text('[ Interactive Map Canvas High-Resolution Render Frame ]', 35, 30 + frameHeight / 2);

      // Legend Section
      const legendY = 30 + frameHeight + 5;
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`CRS: ${project.crs.code} | Scale Approx 1:15,000 | Date: ${new Date().toLocaleDateString()}`, 15, legendY);

      doc.save(`${mapTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_map_layout.pdf`);
    } catch (e) {
      alert('Failed to generate PDF map layout.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col text-xs text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Printer size={18} />
            <span>Engineering Map Layout Composer</span>
          </div>
          <button
            onClick={() => setIsLayoutEditorOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Controls Sidebar */}
          <div className="w-72 bg-slate-950 p-4 border-r border-slate-800 space-y-4 overflow-y-auto">
            <div>
              <label className="text-slate-400 block mb-1">Map Layout Title</label>
              <input
                type="text"
                value={mapTitle}
                onChange={(e) => setMapTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Author / Organization</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Paper Size</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="A4">A4 (210x297mm)</option>
                  <option value="A3">A3 (297x420mm)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
            </div>
          </div>

          {/* Printable Sheet Canvas Preview */}
          <div className="flex-1 bg-slate-950/80 p-6 flex items-center justify-center overflow-auto">
            <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl h-full rounded shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              {/* Sheet Header */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">{mapTitle}</h2>
                  <p className="text-[10px] text-cyan-400 font-mono">{author}</p>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  <Compass size={18} className="text-cyan-400" />
                  <span>NORTH</span>
                </div>
              </div>

              {/* Map Canvas Placeholder Frame */}
              <div className="my-4 flex-1 border border-dashed border-cyan-500/40 bg-slate-950/90 rounded flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Layers size={32} className="text-cyan-500/50 animate-pulse" />
                <span>GIS Map Viewport Layout Canvas</span>
              </div>

              {/* Legend Strip */}
              <div className="bg-slate-950 p-3 border border-slate-800 rounded text-[10px] flex justify-between items-center text-slate-400 font-mono">
                <div>CRS: {project.crs.code}</div>
                <div>Scale: 1:15,000</div>
                <div>Layers: {project.layers.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setIsLayoutEditorOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition shadow"
          >
            <FileDown size={14} />
            <span>Export Printable PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
