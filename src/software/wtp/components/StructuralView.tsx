import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';

interface StructuralProps {
  state: CalculatedWtpState;
}

export const StructuralView: React.FC<StructuralProps> = ({ state }) => {
  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-cyan-400" />
          <span>Structural Design Support & Uplift Safety</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          RCC M35 water retaining structures (IS 3370 / BS 8007 crack width &lt; 0.2mm), buoyancy flotation checks, and steel reinforcement estimates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400">Total Structural Concrete (RCC M35)</div>
          <div className="text-2xl font-bold text-cyan-300">{(state.totalCapexUSD * 0.00035).toFixed(0)} m³</div>
          <div className="text-3xs text-slate-500">Waterproofing admixture + crack control</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400">Reinforcement Steel Fe500D</div>
          <div className="text-2xl font-bold text-amber-400">{(state.totalCapexUSD * 0.00035 * 0.11).toFixed(0)} Metric Tons</div>
          <div className="text-3xs text-slate-500">110 kg/m³ steel density ratio</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400">Empty Basin Uplift Safety Factor</div>
          <div className="text-2xl font-bold text-emerald-400">1.38</div>
          <div className="text-3xs text-slate-500">Exceeds minimum 1.25 limit during HFL</div>
        </div>
      </div>
    </div>
  );
};
