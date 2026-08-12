import React from 'react';
import {
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  Activity,
  Cpu,
  Droplets,
  Building2,
  Zap,
} from 'lucide-react';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';

export interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative pt-6 pb-16 lg:py-20 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-blue-bg)] rounded-full blur-[140px] pointer-events-none opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[var(--accent-purple-bg)] rounded-full blur-[120px] pointer-events-none opacity-30" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[var(--accent-emerald-bg)] rounded-full blur-[120px] pointer-events-none opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Ecosystem Connection Micro-Bar */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)] shadow-sm">
              <span className="flex items-center gap-1.5 font-semibold text-[var(--accent-blue)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EVLab Ecosystem</span>
              </span>
              <span className="text-[var(--border-subtle)]">•</span>
              <span className="truncate">Career Direction → Knowledge → Software → Practice → Projects</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1] font-sans">
                You Are an Engineer.{' '}
                <span className="block bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
                  Let's Build Your Future.
                </span>
              </h1>
              <p className="text-base sm:text-xl text-[var(--text-secondary)] font-normal leading-relaxed max-w-2xl">
                Discover where you want to go, what you need to learn, which software you need to master, what standards you need to understand, and how your knowledge connects to real engineering work.
              </p>
            </div>

            {/* Dual Primary Doors (Purple Career Roadmap & Emerald UELE) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {/* Primary Door 1: Career Roadmap */}
              <div className="flex-1 p-1 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)]/40 via-[var(--accent-purple)]/10 to-transparent p-0.5">
                <div className="h-full bg-[var(--bg-surface)] p-4 rounded-[14px] border border-[var(--accent-purple)]/30 hover:border-[var(--accent-purple)] transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" icon={<Compass className="w-3.5 h-3.5" />}>
                      PRIMARY DOOR
                    </Badge>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Step 1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors">
                      Engineering Career Roadmap
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Find the engineering path that fits your future.
                    </p>
                  </div>
                  <Button
                    variant="roadmap"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    onClick={() => onNavigate('roadmap')}
                  >
                    Start Career Roadmap
                  </Button>
                </div>
              </div>

              {/* Primary Door 2: UELE 3D */}
              <div className="flex-1 p-1 rounded-2xl bg-gradient-to-br from-[var(--accent-emerald)]/40 via-[var(--accent-emerald)]/10 to-transparent p-0.5">
                <div className="h-full bg-[var(--bg-surface)] p-4 rounded-[14px] border border-[var(--accent-emerald)]/30 hover:border-[var(--accent-emerald)] transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <Badge variant="emerald" icon={<Layers className="w-3.5 h-3.5" />}>
                      PRIMARY DOOR
                    </Badge>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Step 2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-emerald)] transition-colors">
                      UELE 3D World
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Explore engineering through the real world.
                    </p>
                  </div>
                  <Button
                    variant="uele"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    onClick={() => onNavigate('uele')}
                  >
                    Enter UELE 3D
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Proof Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
                <span>Multi-Disciplinary</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-purple)]" />
                <span>Recursive Career Trees</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)]" />
                <span>Interactive 3D Objects</span>
              </span>
            </div>
          </div>

          {/* Right Column: Isometric Engineering Environment Visualization */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 shadow-2xl overflow-hidden group">
              {/* Technical Canvas Grid Overlay */}
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(var(--text-primary) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Header Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-color)] text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[var(--text-muted)] ml-2">UELE.ENGINEERING.WORLD v2.0</span>
                </div>
                <Badge variant="blue" size="sm">LIVE VIEW</Badge>
              </div>

              {/* Technical Modules Grid Graphic */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {/* Module 1: Water Treatment Plant */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--accent-blue)]/30 hover:border-[var(--accent-blue)] transition-all space-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-[var(--accent-blue-bg)] text-[var(--accent-blue)]">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-blue)] font-bold">WTP 50 MLD</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Water Treatment Plant</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Coagulation, Sand Filter, Disinfection</p>
                </div>

                {/* Module 2: Smart City Infrastructure */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--accent-purple)]/30 hover:border-[var(--accent-purple)] transition-all space-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-[var(--accent-purple-bg)] text-[var(--accent-purple)]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-purple)] font-bold">URBAN GRID</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Smart City Network</p>
                  <p className="text-[10px] text-[var(--text-muted)]">BIM, Drainage, Traffic & Power</p>
                </div>

                {/* Module 3: Energy & Power Station */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--accent-emerald)]/30 hover:border-[var(--accent-emerald)] transition-all space-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-emerald)] font-bold">POWER GRID</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Energy Grid Substation</p>
                  <p className="text-[10px] text-[var(--text-muted)]">132kV Transmission & SCADA</p>
                </div>

                {/* Module 4: Engineering Software Pipeline */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--accent-cyan)]/30 hover:border-[var(--accent-cyan)] transition-all space-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)]">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-cyan)] font-bold">CAD / SIM</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">WaterCAD / EPANET</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Hydraulic Pipe Modeling</p>
                </div>
              </div>

              {/* Status Footer Bar */}
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent-emerald)] animate-pulse" />
                  Ecosystem Telemetry
                </span>
                <span className="text-[var(--text-secondary)]">13 Registries Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
