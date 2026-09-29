import React from 'react';
import {
  Users,
  Wrench,
  MonitorPlay,
  FolderGit2,
  Clock,
  ArrowRight,
  Play,
  Hexagon,
} from 'lucide-react';
import { Hero3DCanvas } from './Hero3DCanvas';

export interface HeroSectionProps {
  onNavigate: (sectionId: string, param?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section
      id="hero-master-section"
      className="relative w-full overflow-hidden pt-6 pb-12 lg:pt-8 lg:pb-16 bg-[#070B14] select-none"
    >
      {/* Background Radial Glow Effects */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 ev-ambient-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* LEFT HERO COLUMN (5.5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* EVLAB ECOSYSTEM Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/40 shadow-sm shadow-purple-500/20 text-purple-300 text-xs font-mono tracking-wider">
              <Hexagon className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold uppercase tracking-widest text-[11px]">EVLAB ECOSYSTEM</span>
            </div>

            {/* Master Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-white leading-[1.08] font-sans">
                You Are an Engineer.
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.08] font-sans bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Let's Build Your Future.
              </h2>
            </div>

            {/* Body Copy */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-sans">
              The ultimate engineering ecosystem with all the tools, knowledge, standards, and software you need — connected in one powerful platform to design, analyze, and build a better world.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              {/* Primary "Start Your Journey" Button */}
              <button
                type="button"
                id="hero-start-journey-btn"
                onClick={() => onNavigate('roadmap')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2.5 cursor-pointer"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary "Explore Demo" Button */}
              <button
                type="button"
                id="hero-explore-demo-btn"
                onClick={() => onNavigate('uele-game')}
                className="px-5 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-sm transition-all flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <div className="w-5 h-5 rounded-full border border-slate-400/60 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Explore Demo</span>
              </button>
            </div>

            {/* Horizontal Stats Ticker Pill */}
            <div className="pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none text-slate-300">
                {/* 50K+ Engineers */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono leading-none">50K+</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Engineers</div>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-800 shrink-0" />

                {/* 200+ Software Tools */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 text-purple-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono leading-none">200+</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Software Tools</div>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-800 shrink-0" />

                {/* 1000+ Learning Resources */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 text-sky-400">
                    <MonitorPlay className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono leading-none">1000+</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Learning Resources</div>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-800 shrink-0" />

                {/* 500+ Real Projects */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 text-emerald-400">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono leading-none">500+</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Real Projects</div>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-800 shrink-0" />

                {/* 24/7 Support */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono leading-none">24/7</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT HERO 3D DIGITAL TWIN DIORAMA (7 cols on desktop) */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <Hero3DCanvas onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </section>
  );
};
