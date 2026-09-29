import React from 'react';
import { PlanetData, SoftwareMoon } from '../../types/space';
import {
  X,
  Sparkles,
  Layers,
  Wrench,
  Link2,
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowRight,
  Activity,
  Cpu,
} from 'lucide-react';

interface PlanetaryDetailPanelProps {
  planet: PlanetData;
  selectedMoon: SoftwareMoon | null;
  onSelectMoon: (moon: SoftwareMoon | null) => void;
  onClose: () => void;
  onEnterStudio: (planet: PlanetData) => void;
}

export const PlanetaryDetailPanel: React.FC<PlanetaryDetailPanelProps> = ({
  planet,
  selectedMoon,
  onSelectMoon,
  onClose,
  onEnterStudio,
}) => {
  const { name, subtitle, description, specs, moons, color } = planet;

  return (
    <aside
      className="absolute top-16 right-4 bottom-16 w-96 max-w-[calc(100vw-2rem)] z-30 flex flex-col bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-6"
      style={{
        boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${color.glow}`,
      }}
    >
      {/* 1. Header Banner */}
      <div className="p-5 border-b border-slate-800 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: color.primary }}
        />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: color.accent }}
              />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                PLANETARY DOMAIN • {specs.telemetryCode}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{name}</h2>
            <p className="text-xs font-semibold text-slate-300 tracking-wide mt-0.5">
              {subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Return to Space Universe"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
          {description}
        </p>

        {/* 2. Key Telemetry Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] font-mono uppercase">Modules</span>
            </div>
            <div className="text-sm font-bold text-white">{specs.moduleCount}</div>
            <div className="text-[8px] text-slate-500 font-mono">INTEGRATED</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <Wrench className="w-3 h-3 text-sky-400" />
              <span className="text-[9px] font-mono uppercase">Tools</span>
            </div>
            <div className="text-sm font-bold text-white">{specs.toolCount}</div>
            <div className="text-[8px] text-slate-500 font-mono">AVAILABLE</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span className="text-[9px] font-mono uppercase">Moons</span>
            </div>
            <div className="text-sm font-bold text-white">{moons.length}</div>
            <div className="text-[8px] text-slate-500 font-mono">ORBITING</div>
          </div>
        </div>

        {/* Multi-Discipline Integration Tag */}
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Link2 className="w-3 h-3 text-cyan-400" />
            <span>Multi-Domain Interop</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-300">
            {specs.integrations.slice(0, 2).join(' / ')}
          </span>
        </div>
      </div>

      {/* 3. Software Moons & Tools List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            ORBITING SOFTWARE MOONS ({moons.length})
          </span>
          <span className="text-[9px] text-slate-500 font-mono">Click to inspect</span>
        </div>

        <div className="space-y-2">
          {moons.map((moon) => {
            const isSelected = selectedMoon?.id === moon.id;
            return (
              <div
                key={moon.id}
                onClick={() => onSelectMoon(isSelected ? null : moon)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color.accent }}
                    />
                    <h4 className="text-xs font-bold text-white tracking-wide">{moon.name}</h4>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    {moon.shortCode}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {moon.description}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[9px]">
                  <span className="text-slate-500 font-mono">{moon.category}</span>
                  <div className="flex items-center gap-1">
                    {moon.integrationTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 text-[8px] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Domain Standards */}
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] space-y-1.5 mt-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compliance & Interoperability</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Certified to <span className="text-slate-200">{specs.precisionRating}</span>. Standard formats include{' '}
            <span className="text-cyan-300">{specs.standardFormats.join(', ')}</span>.
          </p>
        </div>
      </div>

      {/* 4. Action Footer: ENTER STUDIO */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={() => onEnterStudio(planet)}
          className="w-full py-3 px-4 rounded-xl text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
            boxShadow: `0 4px 20px ${color.glow}`,
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span>ENTER {name} STUDIO</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </aside>
  );
};
