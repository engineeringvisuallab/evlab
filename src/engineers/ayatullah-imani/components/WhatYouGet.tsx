import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, FileCheck } from 'lucide-react';

interface WhatYouGetProps {
  onHireClick?: () => void;
}

export function WhatYouGet({ onHireClick }: WhatYouGetProps) {
  const deliverables = [
    {
      title: "Clean CAD Drawings",
      format: ".DWG & .DXF",
      desc: "Strict layer discipline, standard linetypes, proper pen weights, and clean blocks ready for contractor plotting."
    },
    {
      title: "Detailed Plans / Profiles / Sections",
      format: "A0 to A3 Sheet Sets",
      desc: "Comprehensive horizontal alignments, ground profiles with benchmarks, invert levels, and transverse cross-sections."
    },
    {
      title: "Standard Engineering Details",
      format: "Detail Sheet Library",
      desc: "Valve chambers, thrust restraint blocks, pipe crossings, culvert sleeves, and standard municipal details."
    },
    {
      title: "Professional Building Documentation",
      format: "Architectural Package",
      desc: "Dimensioned floor plans, partition layouts, door/window schedules, staircase sections, and wall details."
    },
    {
      title: "Civil 3D Profiles & Sections",
      format: "Civil 3D .DWG",
      desc: "Dynamic band sets showing chainages, existing ground level (EGL), design invert level (IL), and earthwork cut depths."
    },
    {
      title: "Revit Documentation",
      format: ".RVT Central Models",
      desc: "Coordinated BIM building models, synchronized sheets, elevations, and structural alignment views."
    },
    {
      title: "Water Supply / Sewerage Details",
      format: "Network & Appurtenance Sheets",
      desc: "Distribution networks with node coordinates, gravity sewer gradients, drop manholes, and consumer connections."
    },
    {
      title: "Technical Documentation",
      format: "Word & PDF Booklets",
      desc: "Engineering methodology reports, specifications, title block drawing registers, and tender submittal compilations."
    },
    {
      title: "Estimation Support",
      format: "Excel BOQ Spreadsheets",
      desc: "Pipeline length take-offs by diameter, fitting schedules, chamber concrete volumes, and earthwork calculations."
    },
    {
      title: "3D Visualization",
      format: "4K Renders & MP4 Walkthroughs",
      desc: "Photorealistic architectural perspectives, isometric mechanical pipe manifolds, and presentation walkthrough videos."
    }
  ];

  return (
    <section className="py-20 sm:py-28 relative bg-[#060b17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>CONTRACT DELIVERABLES</span>
              <span className="text-slate-600">·</span>
              <span>CLIENT ASSURANCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              What You Get
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm sm:text-right">
            Concrete outputs handed over upon project completion.
          </p>
        </div>

        {/* 10 Clean Deliverables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {deliverables.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#091122] border border-slate-800/90 hover:border-cyan-500/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="text-cyan-400 font-bold">0{idx + 1}</span>
                  <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {item.format}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-display mb-1.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Deliverable</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
