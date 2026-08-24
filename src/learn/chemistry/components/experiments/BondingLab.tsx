import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { WhyButton } from '../common/WhyButton';
import { Link, Zap, Shield, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface BondingLabProps {
  academicLevel: AcademicLevel;
}

export const BondingLab: React.FC<BondingLabProps> = ({ academicLevel }) => {
  const [bondType, setBondType] = useState<'ionic' | 'covalent' | 'metallic'>('ionic');
  const [electronTransferred, setElectronTransferred] = useState(false);
  const [currentConducting, setCurrentConducting] = useState(false);

  return (
    <div className="space-y-6" id="bonding-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Link className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Chemical Bonding & Electron Transfer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate ionic lattice electron transfer, covalent orbital sharing, and metallic electron sea conductivity.
          </p>
        </div>

        {/* Bond Type Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'ionic', label: 'Ionic (NaCl)' },
            { id: 'covalent', label: 'Covalent (H₂O / CH₄)' },
            { id: 'metallic', label: 'Metallic (Copper Sea)' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setBondType(mode.id as any);
                setElectronTransferred(false);
                setCurrentConducting(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                bondType === mode.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6 flex flex-col justify-between min-h-[400px]">
          {/* Ionic Bonding Stage */}
          {bondType === 'ionic' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Ionic Bond Formation: Sodium Chloride (NaCl)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Electrostatic attraction between $Na^+$ cation and $Cl^-$ anion after valence electron transfer.
                  </p>
                </div>
                <WhyButton
                  experimentName="Ionic Bonding"
                  observation={`Na ([Ne]3s¹) transfers 1 electron to Cl ([Ne]3s²3p⁵) to form stable octets Na⁺ and Cl⁻.`}
                  stateContext={{ bondType, electronTransferred }}
                />
              </div>

              {/* Visual Atom Diagram */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around">
                {/* Sodium Atom */}
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center relative bg-amber-950/20">
                    <span className="font-bold text-lg text-amber-400">Na</span>
                    {!electronTransferred && (
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-lg animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    {electronTransferred ? <span className="text-amber-400 font-bold">Na⁺ (Cation)</span> : 'Na (Atom)'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {electronTransferred ? '[Ne] Octet' : '[Ne] 3s¹'}
                  </div>
                </div>

                {/* Transfer Action Arrow */}
                <div className="text-center">
                  <button
                    onClick={() => setElectronTransferred(!electronTransferred)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    {electronTransferred ? 'Revert Electron' : 'Transfer 1 e⁻ ⟶'}
                  </button>
                </div>

                {/* Chlorine Atom */}
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-500/60 flex items-center justify-center relative bg-emerald-950/20">
                    <span className="font-bold text-lg text-emerald-400">Cl</span>
                    {electronTransferred && (
                      <div className="absolute top-0 left-0 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-lg" />
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    {electronTransferred ? <span className="text-emerald-400 font-bold">Cl⁻ (Anion)</span> : 'Cl (Atom)'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {electronTransferred ? '[Ar] Octet' : '[Ne] 3s² 3p⁵'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Covalent Bonding Stage */}
          {bondType === 'covalent' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Covalent Bonding: Shared Electron Pairs</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Nonmetal atoms overlap orbitals to mutually share electron pairs and complete stable outer shells.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <div className="relative flex items-center">
                  <div className="w-28 h-28 rounded-full border-2 border-cyan-500/80 bg-cyan-950/30 flex items-center justify-center">
                    <span className="font-bold text-cyan-400 text-lg">H (1)</span>
                  </div>
                  <div className="-ml-10 w-28 h-28 rounded-full border-2 border-blue-500/80 bg-blue-950/30 flex items-center justify-center">
                    <span className="font-bold text-blue-400 text-lg">H (2)</span>
                  </div>
                  {/* Shared electrons in overlap zone */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-md" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metallic Bonding Stage */}
          {bondType === 'metallic' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Metallic Bonding: Delocalized Electron Sea Model</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Positive metal cations fixed in a lattice surrounded by a fluid sea of delocalized valence electrons.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentConducting(!currentConducting)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentConducting
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{currentConducting ? 'Voltage Applied (Current Flowing)' : 'Apply Voltage (E-field)'}</span>
                </button>
              </div>

              {/* Copper Lattice Grid */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-4 gap-4 justify-items-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-800/80 border border-amber-500 text-amber-200 font-bold text-xs flex items-center justify-center shadow-md">
                      Cu²⁺
                    </div>
                    {/* Delocalized electron */}
                    <div
                      className={`absolute w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm ${
                        currentConducting ? 'animate-ping' : ''
                      }`}
                      style={{ top: (i % 2) * 12, right: -6 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Properties Card (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4 text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">
            Bond Characteristics
          </h3>

          <div className="space-y-2 divide-y divide-slate-800">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Bond Type:</span>
              <strong className="text-cyan-400 capitalize">{bondType}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Melting Point:</span>
              <strong className="text-white">
                {bondType === 'ionic' ? 'High (801 °C)' : bondType === 'metallic' ? 'High (1085 °C)' : 'Low to Medium'}
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Electrical Conductivity:</span>
              <strong className="text-emerald-400">
                {bondType === 'metallic'
                  ? 'Excellent (Solid & Liquid)'
                  : bondType === 'ionic'
                  ? 'Conducts when molten or aqueous'
                  : 'Insulator'}
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Electronegativity Diff (Δχ):</span>
              <strong className="text-amber-400">
                {bondType === 'ionic' ? 'Δχ > 2.0 (High)' : 'Δχ < 1.7 (Low/Shared)'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
