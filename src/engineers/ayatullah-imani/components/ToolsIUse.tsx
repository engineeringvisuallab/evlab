import React from 'react';
import { TOOLS_I_USE } from '../data/portfolioData';
import { Layers, Box, FileSpreadsheet, FileText, Presentation, Activity, Compass, ShieldCheck } from 'lucide-react';

export function ToolsIUse() {
  const getToolIcon = (name: string) => {
    if (name.includes('Excel')) return FileSpreadsheet;
    if (name.includes('Word')) return FileText;
    if (name.includes('PowerPoint')) return Presentation;
    if (name.includes('WaterGEMS') || name.includes('HAMMER')) return Activity;
    if (name.includes('ArcGIS') || name.includes('QGIS')) return Compass;
    if (name.includes('Revit') || name.includes('SketchUp')) return Box;
    return Layers;
  };

  return (
    <section id="tools" className="py-20 sm:py-28 relative bg-[#060b17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>CORE TECHNICAL TOOLKIT</span>
              <span className="text-slate-600">·</span>
              <span>VERIFIED WORKFLOWS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Tools I Use
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Focused on client deliverables (No fake percentage bars)</span>
          </div>
        </div>

        {/* Clean Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {TOOLS_I_USE.map((tool, idx) => {
            const Icon = getToolIcon(tool.name);
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#091122] border border-slate-800/90 hover:border-cyan-500/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                      {tool.tier}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-display mb-1.5">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tool.role}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                  Deliverable Software
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
