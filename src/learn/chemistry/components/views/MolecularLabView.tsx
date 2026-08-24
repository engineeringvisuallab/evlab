import React, { useState } from 'react';
import { MOLECULES } from '../../data/molecules';
import { MoleculeData, AcademicLevel } from '../../types/chemistry';
import { ThreeMoleculeViewer } from '../common/ThreeMoleculeViewer';
import { WhyButton } from '../common/WhyButton';
import { Atom, Box, Layers, Sparkles, Filter } from 'lucide-react';

interface MolecularLabViewProps {
  academicLevel: AcademicLevel;
}

export const MolecularLabView: React.FC<MolecularLabViewProps> = ({ academicLevel }) => {
  const [selectedMolecule, setSelectedMolecule] = useState<MoleculeData>(MOLECULES[0]); // Water default
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Simple', 'Organic', 'Aromatic', 'Biomolecule'];

  const filteredMolecules = MOLECULES.filter((m) => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Simple' && ['h2o', 'co2', 'nh3', 'ch4', 'sf6'].includes(m.id)) return true;
    if (categoryFilter === 'Organic' && ['ethanol', 'acetic_acid', 'ethylene', 'acetylene'].includes(m.id)) return true;
    if (categoryFilter === 'Aromatic' && ['benzene'].includes(m.id)) return true;
    if (categoryFilter === 'Biomolecule' && ['glucose', 'caffeine', 'atp'].includes(m.id)) return true;
    return true;
  });

  return (
    <div className="space-y-6" id="molecular-lab-view">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Atom className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">3D Molecular Structure & VSEPR Studio</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Examine 3D molecular conformations, orbital hybridizations ($sp, sp^2, sp^3, sp^3d, sp^3d^2$), bond angles, and dipole vectors.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Molecule Selector Grid & 3D Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Molecule Picker (4.5 Cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filteredMolecules.map((m) => {
            const isSelected = selectedMolecule.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMolecule(m)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{m.name}</span>
                  <span className="font-mono text-cyan-400 font-bold text-xs">{m.formula}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>Geometry: <strong className="text-slate-200">{m.vseprGeometry}</strong></span>
                  <span>Hybrid: <strong className="text-cyan-300">{m.hybridization}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: 3D WebGL Canvas & Physical Attributes (7.5 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedMolecule.name}</span>
                  <span className="font-mono text-cyan-400 text-sm">({selectedMolecule.formula})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  VSEPR: <strong className="text-slate-200">{selectedMolecule.vseprGeometry}</strong> • Hybridization: <strong className="text-cyan-300">{selectedMolecule.hybridization}</strong>
                </p>
              </div>

              <WhyButton
                experimentName="Molecular Geometry"
                observation={`${selectedMolecule.name} adopts ${selectedMolecule.vseprGeometry} shape with bond angle ${selectedMolecule.bondAngle}° due to electron pair repulsion.`}
                stateContext={{ selectedMolecule }}
              />
            </div>

            {/* Three.js 3D WebGL Canvas */}
            <ThreeMoleculeViewer molecule={selectedMolecule} height={380} />

            {/* Chemical & Physical Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Molar Mass:</span>
                <span className="font-mono text-white font-bold text-sm">{selectedMolecule.molarMass} g/mol</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Bond Angle:</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">{selectedMolecule.bondAngle}°</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Dipole Moment:</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{selectedMolecule.dipoleMoment} D</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Atoms:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{selectedMolecule.atoms.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
