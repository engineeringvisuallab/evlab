/**
 * EVLab BOQ - Command Palette & Search Modal (Ctrl + K)
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Search, X, Grid, Folder, Calculator, Box, FileText, ArrowRight } from 'lucide-react';
import { AppView } from '../../types';

export const CommandPalette: React.FC<{ onClose?: () => void }> = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    boqItems,
    wbsNodes,
    materials,
    projects,
    setCurrentView,
    switchProject,
    selectBoqItem,
  } = useAppStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredBoq = query.trim()
    ? boqItems.filter(
        (i) =>
          i.itemCode.toLowerCase().includes(query.toLowerCase()) ||
          i.description.toLowerCase().includes(query.toLowerCase()) ||
          i.specification.toLowerCase().includes(query.toLowerCase())
      )
    : boqItems.slice(0, 5);

  const filteredProjects = query.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.code.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredMaterials = query.trim()
    ? materials.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden text-slate-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search BOQ item codes, descriptions, materials, projects..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs font-sans">
          {/* BOQ Items Results */}
          <div>
            <p className="px-3 py-1 font-mono text-[10px] uppercase font-bold text-slate-500">
              BOQ Items ({filteredBoq.length})
            </p>
            {filteredBoq.length === 0 ? (
              <p className="px-3 py-2 text-slate-500 italic">No BOQ items matching query.</p>
            ) : (
              filteredBoq.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    selectBoqItem(item.id);
                    setCurrentView('boq');
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Grid className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-300 font-bold">{item.itemCode}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                          {item.unit}
                        </span>
                      </div>
                      <p className="text-slate-200 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))
            )}
          </div>

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="px-3 py-1 font-mono text-[10px] uppercase font-bold text-slate-500">
                Projects ({filteredProjects.length})
              </p>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    switchProject(p.id);
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {p.code} | {p.client}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Materials Results */}
          {filteredMaterials.length > 0 && (
            <div>
              <p className="px-3 py-1 font-mono text-[10px] uppercase font-bold text-slate-500">
                Materials ({filteredMaterials.length})
              </p>
              {filteredMaterials.map((m) => (
                <div key={m.id} className="px-3 py-2 rounded hover:bg-slate-800 flex items-center space-x-3">
                  <Box className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-mono text-emerald-300 font-bold">{m.code}</span> - {m.name}
                    <p className="text-[10px] text-slate-400 font-mono">
                      Category: {m.category} | Default Rate: ৳{m.defaultRate}/{m.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 flex justify-between font-mono">
          <span>Press ESC to close</span>
          <span>EVLab Global Engineering Index</span>
        </div>
      </div>
    </div>
  );
};
