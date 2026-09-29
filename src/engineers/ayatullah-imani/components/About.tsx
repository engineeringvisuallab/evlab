import React from 'react';
import { PORTFOLIO_CONFIG, getWhatsAppLink } from '../data/config';
import { SHORT_ABOUT } from '../data/portfolioData';
import { MapPin, Mail, MessageSquare, CheckCircle2, ShieldCheck, Compass, Layers, Building2, Award } from 'lucide-react';
import { VerifiedProfilePhoto } from './VerifiedProfilePhoto';
import holdingDrawingsImg from '../assets/images/ayatullah_engineer_holding_drawings_1790645633582.jpg';
import siteInspectionImg from '../assets/images/ayatullah_site_inspection_profile_1790645644518.jpg';

export function About() {
  return (
    <section id="about" className="py-20 sm:py-28 relative bg-[#060b17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: 2 Real Photos (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Photo 1: Drawing Review & Submittals */}
              <div className="rounded-2xl bg-[#091122] border border-cyan-950 p-2 shadow-xl flex flex-col justify-between group">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <VerifiedProfilePhoto
                    storageKey="ayatullah_profile_photo"
                    defaultPath={holdingDrawingsImg}
                    altText="Md. Ayatullah Imani Holding Engineering Drawings"
                    badgeLabel="Drawing Review & Submittals"
                  />
                </div>
                <div className="pt-2 text-center">
                  <span className="text-[11px] font-mono text-slate-300 font-semibold block truncate">
                    CAD Expert
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400">
                    IWM (March 2022 – Present)
                  </span>
                </div>
              </div>

              {/* Photo 2: On-Site Inspection & Field Coordination */}
              <div className="rounded-2xl bg-[#091122] border border-cyan-950 p-2 shadow-xl flex flex-col justify-between group">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <VerifiedProfilePhoto
                    storageKey="ayatullah_site_photo"
                    defaultPath={siteInspectionImg}
                    altText="Md. Ayatullah Imani On-Site Coordination"
                    badgeLabel="Site Coordination & Alignment"
                  />
                </div>
                <div className="pt-2 text-center">
                  <span className="text-[11px] font-mono text-slate-300 font-semibold block truncate">
                    Field Verification
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">
                    MIDEB: 72993
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Badge Below Photos */}
            <div className="p-3.5 rounded-2xl bg-[#091122] border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-400">
                <Compass className="w-4 h-4" />
                <span>Water Modelling & Network Detailing</span>
              </div>
              <span className="text-slate-400 text-[11px]">Dhaka, Bangladesh</span>
            </div>
          </div>

          {/* Right Column: Maximum 2 Short Paragraphs & Direct Hiring Action (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400">
              <span>PROFESSIONAL SUMMARY</span>
              <span className="text-slate-600">·</span>
              <span>VERIFIED CV DATA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              About Md. Ayatullah Imani
            </h2>

            {/* Paragraph 1 */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {SHORT_ABOUT.paragraph1}
            </p>

            {/* Paragraph 2 */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {SHORT_ABOUT.paragraph2}
            </p>

            {/* Client Commitments List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>WaterGEMS Hydraulic Network Modeller</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Padma WTP Ø2000mm DI Pipeline</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Khulna WASA Phase-2 WTPs & Reservoir</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>IDEB Registered (MIDEB: 72993)</span>
              </div>
            </div>

            {/* Direct Hire CTAs */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <a
                href={getWhatsAppLink('Hello Md. Ayatullah Imani, I would like to discuss a water network design / WaterGEMS / CAD project.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Me</span>
              </a>

              <a
                href={`mailto:${PORTFOLIO_CONFIG.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
