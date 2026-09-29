import React from 'react';
import { ArrowDown, ArrowUpRight, ShieldCheck, Layers, Box, Compass, Building2, CheckCircle2 } from 'lucide-react';
import { PORTFOLIO_CONFIG } from '../data/config';
import { VerifiedProfilePhoto } from './VerifiedProfilePhoto';
import holdingDrawingsImg from '../assets/images/ayatullah_engineer_holding_drawings_1790645633582.jpg';

interface HeroProps {
  onPortfolioClick: () => void;
  onHireClick: () => void;
}

export function Hero({ onPortfolioClick, onHireClick }: HeroProps) {
  const coreDeliverables = [
    "WaterGEMS Hydraulic Network Modelling",
    "Padma WTP Ø2000mm DI Transmission Main",
    "Khulna WASA Phase-2 WTPs & 385 ML Reservoir",
    "AutoCAD Water Network & DMA Detailed Drawings",
    "Civil 3D Dynamic Alignments & Profiles",
    "ArcGIS & QGIS Piped Water Distribution Maps"
  ];

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-[#060b17]">
      {/* Background Engineering CAD Grid & Lighting */}
      <div className="absolute inset-0 bg-cad-grid opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

      {/* Decorative Technical Linework */}
      <div className="hidden lg:block absolute top-28 left-8 text-[11px] font-mono text-cyan-500/40 select-none">
        <div>SYS: IWM_WATER_NETWORK_DESIGN</div>
        <div>MEMBER_ID: MIDEB_72993</div>
      </div>
      <div className="hidden lg:block absolute top-28 right-8 text-[11px] font-mono text-cyan-500/40 select-none text-right">
        <div>PROJECTS: KWASA_DWASA_DPHE_UNICEF</div>
        <div>LOCATION: DHAKA_BANGLADESH</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column (7 cols): Direct, Powerful Positioning & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Name Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 tracking-wider uppercase mb-2">
                <span>INSTITUTE OF WATER MODELLING (IWM)</span>
                <span className="text-slate-600">·</span>
                <span>SINCE 12 MARCH 2022</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] font-display">
                MD. AYATULLAH <span className="text-cyan-400">IMANI</span>
              </h1>
              
              {/* Core Professional Positioning */}
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 font-display mt-2">
                CAD Expert for Water Network Design
              </div>

              <div className="text-xs sm:text-sm font-mono text-emerald-400 mt-1 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Hydraulic Network Modeller (WaterGEMS) | MIDEB: 72993</span>
              </div>
            </div>

            {/* Supporting Line */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Civil engineering professional at the Institute of Water Modelling (IWM) specializing in hydraulic network modeling with WaterGEMS, AutoCAD detailed engineering drawings for water supply & sewerage infrastructure, large transmission mains (up to Ø2000mm DI), and GIS mapping for UNICEF, World Bank, and ADB projects.
            </p>

            {/* Exactly What I Provide */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#091122]/90 border border-cyan-950/80 shadow-xl space-y-2.5">
              <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider block">
                CORE TECHNICAL COMPETENCIES:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 font-mono">
                {coreDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onPortfolioClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-xl shadow-cyan-950/60 transition-all duration-150 cursor-pointer"
              >
                <span>View Major Projects</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onHireClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 hover:border-cyan-400 border border-slate-700 rounded-xl transition-all duration-150 cursor-pointer"
              >
                <span>Contact / Hire Me</span>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Quick Guarantee */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Calibrated WaterGEMS models, standard DWG layers, and coordinated GIS geodatabases.</span>
            </div>

          </div>

          {/* Right Column (5 cols): Photo + Engineering Credentials Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-[#081122] border border-cyan-950 p-4 sm:p-5 shadow-2xl overflow-hidden group">
              
              {/* Photo 1: User's Real Photo Holding Drawings */}
              <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <VerifiedProfilePhoto
                  storageKey="ayatullah_profile_photo"
                  defaultPath={holdingDrawingsImg}
                  altText="Md. Ayatullah Imani - CAD Expert Holding Drawings"
                  badgeLabel="Drawing Review & Submittals"
                />
              </div>

              {/* Title Block Credentials Badge */}
              <div className="relative -mt-10 mx-2 p-4 rounded-2xl bg-[#09142b]/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div>
                    <div className="text-sm sm:text-base font-bold text-white truncate font-display">
                      {PORTFOLIO_CONFIG.fullName}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">
                      Institute of Water Modelling (IWM)
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active at IWM</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>AutoCAD Expert</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>WaterGEMS Modeling</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Civil 3D Profiles</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>ArcGIS & QGIS</span>
                  </div>
                </div>
              </div>

              {/* Verified Tools Strip */}
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono text-slate-300">
                {['AutoCAD', 'WaterGEMS', 'Civil 3D', 'ArcGIS', 'QGIS', 'MS Excel'].map((tool, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
                    {tool}
                  </span>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
