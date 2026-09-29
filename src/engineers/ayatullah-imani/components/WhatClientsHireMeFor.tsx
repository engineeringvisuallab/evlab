import React from 'react';
import { HIRE_SERVICES, CoreHireService } from '../data/portfolioData';
import { ArrowRight, CheckCircle2, FileText, Layers, Box, Wrench, Eye } from 'lucide-react';

interface WhatClientsHireMeForProps {
  onSelectService?: (serviceTitle: string) => void;
}

export function WhatClientsHireMeFor({ onSelectService }: WhatClientsHireMeForProps) {
  const getDeliverableThumbnail = (item: CoreHireService['visualPreviews'][0]) => {
    if (item.image) {
      return (
        <div className="relative h-24 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group/thumb">
          <img src={item.image} alt={item.label} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-1.5 left-2 right-2 text-[10px] font-mono text-cyan-300 truncate font-semibold">
            {item.label}
          </div>
        </div>
      );
    }

    return (
      <div className="h-24 w-full rounded-xl bg-[#050914] border border-slate-800 flex flex-col items-center justify-center p-2 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-cad-grid opacity-40" />
        <FileText className="w-5 h-5 text-cyan-400 mb-1" />
        <span className="text-[10px] font-mono text-slate-300 font-semibold">{item.label}</span>
        <span className="text-[9px] font-mono text-slate-500">BOQ / PDF Submittal</span>
      </div>
    );
  };

  return (
    <section id="what-i-do" className="py-20 sm:py-28 relative bg-[#070d1a] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>PRIMARY FREELANCE CAPABILITIES</span>
              <span className="text-slate-600">·</span>
              <span>DIRECT CLIENT SERVICES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              What Clients Hire Me For
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm sm:text-right">
            Concrete engineering drawing deliverables, BIM packages, and technical documentation.
          </p>
        </div>

        {/* 6 Core Service Cards with Deliverable Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {HIRE_SERVICES.map((service) => (
            <div
              key={service.number}
              className="group rounded-3xl bg-[#091122] border border-slate-800/90 hover:border-cyan-500/50 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-cyan-950/40"
            >
              <div>
                {/* Header Number & Title */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    SERVICE {service.number}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Client Deliverable
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-display mb-2">
                  {service.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {service.tagline}
                </p>

                {/* VISUAL DELIVERABLE EXAMPLES ROW */}
                <div className="mb-5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Visual Deliverables Produced:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {service.visualPreviews.map((thumb, tIdx) => (
                      <div key={tIdx}>
                        {getDeliverableThumbnail(thumb)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Deliverable Scope Items */}
                <div className="space-y-1.5 mb-6">
                  {service.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-cyan-400 shrink-0 font-bold">·</span>
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectService) onSelectService(service.title);
                    const el = document.querySelector('#contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-slate-950 bg-slate-900 group-hover:bg-cyan-400 rounded-xl transition-all duration-150 cursor-pointer"
                >
                  <span>Hire Me for this Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
