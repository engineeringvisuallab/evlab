import React from 'react';
import { PORTFOLIO_CONFIG } from '../data/config';
import { ExternalLink, Compass } from 'lucide-react';

export function EVLabSection() {
  return (
    <section id="evlab" className="py-12 sm:py-16 relative bg-[#060b17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-6 sm:p-7 rounded-3xl bg-[#091122] border border-amber-950/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-amber-400">
              <span>MY INITIATIVE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              EVLab — Engineering • Visualization • Infrastructure
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              An engineering and visualization initiative developed by MD. Ayatullah Imani focused on civil infrastructure presentation, CAD asset standardization, and interactive engineering models.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={PORTFOLIO_CONFIG.evlabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shadow-md shadow-amber-950/40"
            >
              <span>Visit EVLab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
