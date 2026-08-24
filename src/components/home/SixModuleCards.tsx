import React from 'react';
import {
  Compass,
  Globe,
  GraduationCap,
  Puzzle,
  FileText,
  Building,
  ShieldCheck,
  Clock,
  Users,
  Shield,
} from 'lucide-react';
import {
  modCareerRoadmap,
  modUeleGlobe,
  modAcademyCap,
  modPluginCubes,
  modResourceBooks,
  modProjectBridge,
} from '@/assets/images';

export interface SixModuleCardsProps {
  onNavigate: (sectionId: string) => void;
}

export const SixModuleCards: React.FC<SixModuleCardsProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'roadmap',
      title: 'Career Roadmap',
      subtitle: 'Plan your engineering journey',
      icon: Compass,
      color: 'purple',
      badgeBg: 'bg-purple-600/20 text-purple-400 border-purple-500/40',
      glow: 'hover:border-purple-500/80 shadow-purple-500/10',
      image: modCareerRoadmap,
    },
    {
      id: 'uele',
      title: 'UELE Platform',
      subtitle: 'Universal Engineering Learning Experience',
      icon: Globe,
      color: 'blue',
      badgeBg: 'bg-blue-600/20 text-blue-400 border-blue-500/40',
      glow: 'hover:border-blue-500/80 shadow-blue-500/10',
      image: modUeleGlobe,
    },
    {
      id: 'learning-paths',
      title: 'Learning Academy',
      subtitle: 'Courses & Certifications • Professional • Industry Ready',
      icon: GraduationCap,
      color: 'emerald',
      badgeBg: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40',
      glow: 'hover:border-emerald-500/80 shadow-emerald-500/10',
      image: modAcademyCap,
    },
    {
      id: 'plugins',
      title: 'Plugin Hub',
      subtitle: 'Extend Your Capabilities • Tools • Add-ons • Integrations',
      icon: Puzzle,
      color: 'orange',
      badgeBg: 'bg-orange-600/20 text-orange-400 border-orange-500/40',
      glow: 'hover:border-orange-500/80 shadow-orange-500/10',
      image: modPluginCubes,
    },
    {
      id: 'standards',
      title: 'Resource Library',
      subtitle: 'Standards, Codes & More • Global • Updated • Trusted',
      icon: FileText,
      color: 'amber',
      badgeBg: 'bg-amber-600/20 text-amber-400 border-amber-500/40',
      glow: 'hover:border-amber-500/80 shadow-amber-500/10',
      image: modResourceBooks,
    },
    {
      id: 'projects',
      title: 'Project Showcase',
      subtitle: 'Real World Engineering • Case Studies • Success Stories',
      icon: Building,
      color: 'sky',
      badgeBg: 'bg-sky-600/20 text-sky-400 border-sky-500/40',
      glow: 'hover:border-sky-500/80 shadow-sky-500/10',
      image: modProjectBridge,
    },
  ];

  // 5 Quality & Trust Bar Items exactly as in reference image
  const trustItems = [
    {
      icon: FileText,
      title: 'Industry Standard',
      desc: 'Follow Global Best Practices',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'Expert Verified',
      desc: 'Reviewed by Professionals',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      icon: Clock,
      title: 'Continuously Updated',
      desc: 'Latest Technologies & Trends',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      icon: Users,
      title: 'Community Driven',
      desc: 'Engineers Supporting Engineers',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      desc: 'Enterprise Grade Security',
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
    },
  ];

  return (
    <section id="six-core-modules-section" className="py-6 lg:py-8 bg-[#070B14] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. SIX CORE MODULE CARDS GRID (3x2 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                id={`module-card-${card.id}`}
                onClick={() => onNavigate(card.id)}
                className={`p-5 rounded-3xl bg-[#090E1B]/95 border border-slate-800/90 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col justify-between space-y-3.5 ${card.glow} hover:-translate-y-1 hover:bg-[#0C1426] shadow-xl`}
              >
                {/* Header with icon & title */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl border ${card.badgeBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 font-sans group-hover:text-cyan-300 transition-colors truncate">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-tight font-sans line-clamp-1">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                {/* 3D Photorealistic Inset Preview Box */}
                <div className="h-44 w-full rounded-2xl bg-[#050811] border border-slate-800/80 overflow-hidden relative shadow-inner group-hover:border-slate-700 transition-all">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover filter contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. TRUST & STANDARDS BAR (Matches exact reference image) */}
        <div className="p-3.5 rounded-2xl bg-[#090E1B]/90 border border-slate-800/80 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-2 rounded-xl transition-colors group"
                >
                  <div className={`p-2 rounded-xl border ${item.bgColor} ${item.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left font-sans min-w-0">
                    <div className="text-xs font-bold text-slate-100 font-sans leading-tight group-hover:text-cyan-300 transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight truncate">
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
