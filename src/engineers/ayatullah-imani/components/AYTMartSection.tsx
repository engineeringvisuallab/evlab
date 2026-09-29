import React from 'react';
import { PORTFOLIO_CONFIG } from '../data/config';
import { ExternalLink, ShoppingBag } from 'lucide-react';

export function AYTMartSection() {
  return (
    <section id="ayt-mart" className="py-12 sm:py-16 relative bg-[#070d1a] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-6 sm:p-7 rounded-3xl bg-[#091122] border border-cyan-950/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>OTHER DIGITAL VENTURE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              AYT Mart — Digital Commerce & ERP Project
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A Bangladesh-focused digital commerce and lightweight ERP initiative developed as a separate software project alongside core civil engineering services.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <a
              href={PORTFOLIO_CONFIG.aytMartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <span>Visit AYT Mart</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
