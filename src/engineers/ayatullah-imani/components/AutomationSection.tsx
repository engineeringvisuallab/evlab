import React from 'react';
import { SECONDARY_AUTOMATION_TOOLS } from '../data/portfolioData';
import { Terminal, Code, Cpu } from 'lucide-react';

export function AutomationSection() {
  return (
    <section id="automation-tools" className="py-16 sm:py-20 relative bg-[#070d1a] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Compact & Secondary) */}
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>ADDITIONAL WORKFLOW CAPABILITY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
            CAD / GIS Tool Development
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            I also develop practical tools and custom routines that improve CAD and GIS drafting workflows.
          </p>
        </div>

        {/* 3 Secondary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SECONDARY_AUTOMATION_TOOLS.map((tool, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#091122] border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">{tool.platform}</span>
                <span className="text-slate-500">Utility Script</span>
              </div>

              <h3 className="text-sm font-bold text-white font-display">
                {tool.name}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {tool.description}
              </p>

              <pre className="p-2.5 rounded-xl bg-[#050914] border border-slate-800/80 text-[10px] font-mono text-cyan-300 overflow-x-auto">
                {tool.codeSnippet}
              </pre>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
