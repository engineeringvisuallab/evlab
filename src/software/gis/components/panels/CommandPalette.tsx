import React, { useState, useEffect } from 'react';
import { useGIS } from '../../context/GISContext';
import { Search, X, MousePointer, Spline, Hexagon, Table, Palette, Sliders, TrendingUp, Printer, FileDown, Plus, Layers } from 'lucide-react';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTool,
    setViewMode,
    setIsAttributeTableOpen,
    setIsSymbologyModalOpen,
    setIsAddDataModalOpen,
    setIsAnalysisModalOpen,
    setIsQueryBuilderOpen,
    setIsLayoutEditorOpen,
    exportProjectJSON,
    project,
  } = useGIS();

  const [query, setQuery] = useState('');

  // Keydown listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const commands = [
    {
      title: 'Digitize Water Pipe (DN 250)',
      category: 'Engineering',
      action: () => {
        setActiveTool('water_pipe');
        setIsCommandPaletteOpen(false);
      },
      icon: <Spline size={14} className="text-cyan-400" />,
    },
    {
      title: 'Digitize Control Valve',
      category: 'Engineering',
      action: () => {
        setActiveTool('water_valve');
        setIsCommandPaletteOpen(false);
      },
      icon: <Sliders size={14} className="text-amber-400" />,
    },
    {
      title: 'Elevation Profile Cross-Section',
      category: 'Engineering',
      action: () => {
        setActiveTool('elevation_profile');
        setIsCommandPaletteOpen(false);
      },
      icon: <TrendingUp size={14} className="text-indigo-400" />,
    },
    {
      title: 'Run Buffer Analysis (Turf.js)',
      category: 'Analysis',
      action: () => {
        setIsAnalysisModalOpen(true);
        setIsCommandPaletteOpen(false);
      },
      icon: <Sliders size={14} className="text-purple-400" />,
    },
    {
      title: 'Select By Attribute (SQL Query)',
      category: 'Analysis',
      action: () => {
        setIsQueryBuilderOpen(true);
        setIsCommandPaletteOpen(false);
      },
      icon: <Search size={14} className="text-cyan-400" />,
    },
    {
      title: 'Open Attribute Table Grid',
      category: 'Data',
      action: () => {
        setIsAttributeTableOpen(true);
        setIsCommandPaletteOpen(false);
      },
      icon: <Table size={14} className="text-emerald-400" />,
    },
    {
      title: 'Add Spatial Data (GeoJSON / CSV)',
      category: 'Data',
      action: () => {
        setIsAddDataModalOpen(true);
        setIsCommandPaletteOpen(false);
      },
      icon: <Plus size={14} className="text-blue-400" />,
    },
    {
      title: 'Layer Symbology & Label Styling',
      category: 'Data',
      action: () => {
        setIsSymbologyModalOpen(true);
        setIsCommandPaletteOpen(false);
      },
      icon: <Palette size={14} className="text-rose-400" />,
    },
    {
      title: 'Switch to 3D GIS Viewport',
      category: 'View',
      action: () => {
        setViewMode('3D');
        setIsCommandPaletteOpen(false);
      },
      icon: <Layers size={14} className="text-cyan-400" />,
    },
    {
      title: 'Switch to 2D GIS Map Canvas',
      category: 'View',
      action: () => {
        setViewMode('2D');
        setIsCommandPaletteOpen(false);
      },
      icon: <Layers size={14} className="text-emerald-400" />,
    },
    {
      title: 'Open Map Print Layout Composer',
      category: 'Export',
      action: () => {
        setIsLayoutEditorOpen(true);
        setIsCommandPaletteOpen(false);
      },
      icon: <Printer size={14} className="text-indigo-400" />,
    },
    {
      title: 'Export Project JSON File',
      category: 'Project',
      action: () => {
        exportProjectJSON();
        setIsCommandPaletteOpen(false);
      },
      icon: <FileDown size={14} className="text-blue-400" />,
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs text-slate-200">
        {/* Search Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-cyan-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a GIS command or tool name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500 font-mono"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-slate-500 italic">No matching GIS commands found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={idx}
                onClick={cmd.action}
                className="p-2.5 rounded-lg border border-transparent hover:border-cyan-500/50 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5 font-medium">
                  {cmd.icon}
                  <span>{cmd.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase">
                  {cmd.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
