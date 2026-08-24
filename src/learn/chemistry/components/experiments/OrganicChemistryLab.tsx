import React, { useState } from 'react';
import { MOLECULES } from '../../data/molecules';
import { MoleculeData, AcademicLevel } from '../../types/chemistry';
import { ThreeMoleculeViewer } from '../common/ThreeMoleculeViewer';
import { WhyButton } from '../common/WhyButton';
import { Network, Sparkles, Box, ArrowRight, Layers, Eye } from 'lucide-react';

interface OrganicChemistryLabProps {
  academicLevel: AcademicLevel;
}

interface OrganicFamily {
  id: string;
  name: string;
  generalFormula: string;
  suffix: string;
  sampleMoleculeId: string;
  description: string;
}

const ORGANIC_FAMILIES: OrganicFamily[] = [
  { id: 'alkane', name: 'Alkanes (Saturated)', generalFormula: 'CₙH₂ₙ₊₂', suffix: '-ane', sampleMoleculeId: 'ch4', description: 'Single C-C sigma bonds, sp³ hybridized, unreactive except in combustion and free-radical substitution.' },
  { id: 'alcohol', name: 'Alcohols (-OH)', generalFormula: 'R-OH', suffix: '-ol', sampleMoleculeId: 'ethanol', description: 'Contains hydroxyl group (-OH), exhibits hydrogen bonding, elevated boiling points, and solubility in water.' },
  { id: 'carboxylic_acid', name: 'Carboxylic Acids (-COOH)', generalFormula: 'R-COOH', suffix: '-oic acid', sampleMoleculeId: 'acetic_acid', description: 'Contains carboxyl group (-C(=O)OH), acidic proton dissociation, pungent odor, and hydrogen-bonded dimers.' },
  { id: 'water_polar', name: 'Polar Hydration', generalFormula: 'H₂O', suffix: 'solvation', sampleMoleculeId: 'h2o', description: 'Universal polar solvent with 104.5° bent geometry and high dielectric constant.' }
];

export const OrganicChemistryLab: React.FC<OrganicChemistryLabProps> = ({ academicLevel }) => {
  const [selectedFamily, setSelectedFamily] = useState<OrganicFamily>(ORGANIC_FAMILIES[1]); // Ethanol default
  const [activeTab, setActiveTab] = useState<'functional_groups' | 'isomers' | 'reactions'>('functional_groups');

  const activeMolecule = MOLECULES.find((m) => m.id === selectedFamily.sampleMoleculeId) || MOLECULES[0];

  return (
    <div className="space-y-6" id="organic-chemistry-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Organic Chemistry & Functional Groups</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze carbon skeletons, functional group reactivity, 3D conformation, and structural / geometric isomerism.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'functional_groups', label: 'Functional Groups' },
            { id: 'isomers', label: 'Isomerism (Cis/Trans)' },
            { id: 'reactions', label: 'Oxidation Pathways' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'functional_groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Family Selector (4.5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Organic Chemical Families
            </h3>

            {ORGANIC_FAMILIES.map((fam) => (
              <div
                key={fam.id}
                onClick={() => setSelectedFamily(fam)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedFamily.id === fam.id
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{fam.name}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    {fam.generalFormula}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{fam.description}</p>
                <div className="text-[11px] text-slate-500 font-mono mt-2">
                  IUPAC Suffix: <strong className="text-amber-400">{fam.suffix}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: 3D Molecule Visualizer (7.5 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{activeMolecule.name}</span>
                    <span className="font-mono text-cyan-400 text-xs">({activeMolecule.formula})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Geometry: {activeMolecule.vseprGeometry}</span>
                </div>
                <WhyButton
                  experimentName="Organic Molecule 3D"
                  observation={`${activeMolecule.name} has ${activeMolecule.hybridization} hybridization, bond angle ${activeMolecule.bondAngle}°, dipole ${activeMolecule.dipoleMoment} D`}
                  stateContext={{ activeMolecule }}
                />
              </div>

              {/* 3D WebGL Three.js Molecule Renderer */}
              <ThreeMoleculeViewer molecule={activeMolecule} height={340} />
            </div>
          </div>
        </div>
      )}

      {/* Isomerism Tab */}
      {activeTab === 'isomers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Stereoisomerism: Cis vs Trans 2-Butene</h3>
              <p className="text-xs text-slate-400 mt-1">
                Restricted rotation about the double bond ($C=C$) creates distinct geometric isomers with different dipoles and boiling points.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cis Isomer */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">cis-2-Butene</span>
                <span className="text-xs font-mono text-cyan-400">Polar (Dipole &gt; 0)</span>
              </div>
              <div className="h-40 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-4">
                <div className="text-center font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-cyan-400 font-bold text-sm">CH₃ &nbsp;&nbsp;&nbsp;&nbsp; CH₃</div>
                  <div>\ &nbsp;&nbsp; /</div>
                  <div className="text-amber-400 font-bold text-base">C == C</div>
                  <div>/ &nbsp;&nbsp; \</div>
                  <div className="text-slate-400">H &nbsp;&nbsp;&nbsp;&nbsp; H</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>Boiling Point: <strong className="text-white">+3.7 °C</strong></div>
                <div>Dipole Moment: <strong className="text-cyan-400">0.33 D</strong> (Net vector sum)</div>
              </div>
            </div>

            {/* Trans Isomer */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">trans-2-Butene</span>
                <span className="text-xs font-mono text-slate-400">Nonpolar (Dipole = 0)</span>
              </div>
              <div className="h-40 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-4">
                <div className="text-center font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-cyan-400 font-bold text-sm">CH₃ &nbsp;&nbsp;&nbsp;&nbsp; H</div>
                  <div>\ &nbsp;&nbsp; /</div>
                  <div className="text-amber-400 font-bold text-base">C == C</div>
                  <div>/ &nbsp;&nbsp; \</div>
                  <div className="text-slate-400">H &nbsp;&nbsp;&nbsp;&nbsp; CH₃</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>Boiling Point: <strong className="text-white">+0.9 °C</strong></div>
                <div>Dipole Moment: <strong className="text-emerald-400">0.00 D</strong> (Vectors cancel)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reactions Tab */}
      {activeTab === 'reactions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
          <h3 className="text-base font-bold text-white">Oxidation Pathway of Primary Alcohols</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
              <div className="text-xs text-slate-400">Primary Alcohol</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-1">CH₃CH₂OH (Ethanol)</div>
            </div>
            <div className="text-xs text-amber-400 font-mono flex items-center gap-1">
              <span>[O] (PCC)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
              <div className="text-xs text-slate-400">Aldehyde</div>
              <div className="text-sm font-bold text-amber-300 font-mono mt-1">CH₃CHO (Ethanal)</div>
            </div>
            <div className="text-xs text-rose-400 font-mono flex items-center gap-1">
              <span>[O] (KMnO₄)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1">
              <div className="text-xs text-slate-400">Carboxylic Acid</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-1">CH₃COOH (Acetic Acid)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
