/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Influent Wastewater Quality & Mass Loading Panel
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState, InfluentQualityParameter } from '../types/stp';
import { CalculationEngine } from '../engine/calculations';
import { WastewaterQualityEngine } from '../engine/wastewaterQualityEngine';
import { Droplets, AlertCircle, CheckCircle2, FlaskConical, PieChart, Thermometer, ShieldAlert } from 'lucide-react';

interface WastewaterQualityPanelProps {
  project: ProjectState;
  onUpdateProject: (updated: ProjectState) => void;
}

export const WastewaterQualityPanel: React.FC<WastewaterQualityPanelProps> = ({
  project,
  onUpdateProject,
}) => {
  const scenario = project.scenarios[project.activeScenarioId];
  const quality = scenario.influentQuality;
  const flowM3d = scenario.designBasis.adwfM3d;
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'COD_FRAC' | 'RATIOS' | 'TEMP'>('MATRIX');

  const handleParamChange = (paramKey: keyof typeof quality, fieldKey: keyof InfluentQualityParameter, val: number | string | boolean) => {
    const updated = JSON.parse(JSON.stringify(project)) as ProjectState;
    const currentQuality = updated.scenarios[updated.activeScenarioId].influentQuality;

    const paramObj = currentQuality[paramKey] as unknown as Record<string, unknown>;
    if (paramObj) {
      paramObj[fieldKey as string] = val;
    }

    // Refresh calculation engine
    updated.calculations = CalculationEngine.runAllCalculations(updated);
    onUpdateProject(updated);
  };

  const analysis = WastewaterQualityEngine.analyzeInfluentQuality(quality);
  const ratios = analysis.ratios;
  const codFrac = WastewaterQualityEngine.calculateCodFractionation(quality.cod.designValue, quality.bod5.designValue);

  const paramList: { key: keyof typeof quality; label: string; symbol: string }[] = [
    { key: 'bod5', label: '5-Day Biochemical Oxygen Demand', symbol: 'BOD5' },
    { key: 'cod', label: 'Chemical Oxygen Demand', symbol: 'COD' },
    { key: 'tss', label: 'Total Suspended Solids', symbol: 'TSS' },
    { key: 'vss', label: 'Volatile Suspended Solids', symbol: 'VSS' },
    { key: 'tds', label: 'Total Dissolved Solids', symbol: 'TDS' },
    { key: 'tkn', label: 'Total Kjeldahl Nitrogen', symbol: 'TKN' },
    { key: 'nh3n', label: 'Ammonia Nitrogen', symbol: 'NH3-N' },
    { key: 'tp', label: 'Total Phosphorus', symbol: 'TP' },
    { key: 'alkalinity', label: 'Alkalinity as CaCO3', symbol: 'Alk' },
    { key: 'ph', label: 'pH Value', symbol: 'pH' },
    { key: 'temperature', label: 'Minimum Design Temp', symbol: 'Temp' },
    { key: 'oilAndGrease', label: 'Oil & Grease', symbol: 'O&G' },
  ];

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Title & Biodegradability Summary Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <span>Raw Influent Characterization, COD Fractionation & Stoichiometric Loading</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Wastewater constituent characterization, COD fractions (rbCOD/sbCOD/iCOD), biological nutrient ratios, and seasonal kinetics.
          </p>
        </div>

        {/* COD/BOD Biodegradability Badge */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">COD / BOD5 Ratio</span>
            <span className="font-mono font-bold text-cyan-300 text-sm">{ratios.bodToCod ? (1 / ratios.bodToCod).toFixed(2) : '1.80'}</span>
          </div>
          <div className="text-left border-l border-slate-800 pl-3">
            <span className="text-emerald-400 font-semibold block text-[11px]">{ratios.biodegradability}</span>
            <span className="text-[10px] text-slate-500">COD:TKN = {ratios.codToTkn.toFixed(1)} &bull; BOD:TP = {ratios.bodToTp.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('MATRIX')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'MATRIX' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>1. Constituent Matrix & Loading</span>
        </button>

        <button
          onClick={() => setActiveTab('COD_FRAC')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'COD_FRAC' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>2. COD Fractionation Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('RATIOS')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'RATIOS' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>3. Biological Stoichiometry & Ratios</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMP')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'TEMP' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>4. Temperature Sensitivity</span>
        </button>
      </div>

      {/* Tab 1: Constituent Matrix */}
      {activeTab === 'MATRIX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Influent Constituent Matrix (Design Flow: {flowM3d.toLocaleString()} m³/d)
            </span>
            <span className="text-xs text-slate-500 font-mono">Mass Loading (kg/d) = Flow * Conc / 1000</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Parameter Name</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Min</th>
                  <th className="p-3">Avg</th>
                  <th className="p-3">Max</th>
                  <th className="p-3 text-cyan-400">Design Value</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-emerald-400">Mass Loading</th>
                  <th className="p-3">Data Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {paramList.map((item) => {
                  const param = quality[item.key] as InfluentQualityParameter;
                  if (!param) return null;

                  const massLoadingKgDay = ((flowM3d * param.designValue) / 1000).toFixed(1);

                  return (
                    <tr key={item.key} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-200 font-sans">{item.label}</td>
                      <td className="p-3 font-bold text-slate-400">{item.symbol}</td>
                      <td className="p-3 text-slate-400">{param.min}</td>
                      <td className="p-3 text-slate-300">{param.avg}</td>
                      <td className="p-3 text-slate-400">{param.max}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={param.designValue}
                          onChange={(e) => handleParamChange(item.key, 'designValue', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="p-3 text-slate-400">{param.unit}</td>
                      <td className="p-3 text-emerald-300 font-bold">{massLoadingKgDay} kg/d</td>
                      <td className="p-3">
                        {param.isAssumed ? (
                          <span className="inline-flex items-center space-x-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">
                            <AlertCircle className="w-3 h-3" />
                            <span>ASSUMED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: COD Fractionation Engine */}
      {activeTab === 'COD_FRAC' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
              <span>COD Component Breakdown (Metcalf & Eddy)</span>
              <span className="text-cyan-400 font-bold">Total COD: {quality.cod.designValue} mg/L</span>
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Readily Biodegradable Soluble COD (rbCOD / S_s)</span>
                  <span className="text-base font-bold text-cyan-300">{codFrac.rbCOD.toFixed(1)} mg/L (20%)</span>
                </div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-1 rounded">Fast Denitrification</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Slowly Biodegradable Particulate COD (sbCOD / X_s)</span>
                  <span className="text-base font-bold text-emerald-300">{codFrac.sbCOD.toFixed(1)} mg/L (60%)</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-1 rounded">Requires Hydrolysis</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Inert Non-Biodegradable COD (iCOD / S_i + X_i)</span>
                  <span className="text-base font-bold text-amber-300">{codFrac.iCOD.toFixed(1)} mg/L (20%)</span>
                </div>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-1 rounded">Passes through / Sludge</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Biodegradable COD (bCOD) Summary
            </h3>
            <div className="p-4 bg-slate-950 rounded-lg space-y-2 border border-slate-800">
              <div className="text-lg font-bold text-emerald-400">Total bCOD = {codFrac.bCOD.toFixed(1)} mg/L</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The bCOD (Readily + Slowly Biodegradable COD) represents the exact substrate available for heterotrophic bacterial synthesis, oxygen consumption, and biological denitrification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Biological Stoichiometry & Ratios */}
      {activeTab === 'RATIOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-slate-400 text-[11px] uppercase block">BOD5 : TKN Ratio (Nitrification)</span>
            <div className="text-2xl font-bold text-cyan-300">{ratios.bodToTkn.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400">
              {ratios.bodToTkn > 5.0 ? 'High carbon availability. Nitrifiers compete with heterotrophs.' : 'Optimal for combined carbon oxidation & nitrification.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-slate-400 text-[11px] uppercase block">COD : TKN Ratio (Denitrification)</span>
            <div className="text-2xl font-bold text-emerald-300">{ratios.codToTkn.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400">
              {ratios.codToTkn >= 10.0 ? 'Sufficient carbon for complete total nitrogen removal.' : 'Low carbon ratio. External carbon (Methanol/Glycerol) required.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-slate-400 text-[11px] uppercase block">BOD5 : TP Ratio (Bio-P Removal)</span>
            <div className="text-2xl font-bold text-amber-300">{ratios.bodToTp.toFixed(2)}</div>
            <p className="text-[10px] text-slate-400">
              {ratios.bodToTp >= 20.0 ? 'Ideal ratio for Enhanced Biological Phosphorus Removal (EBPR).' : 'Low BOD. Chemical alum/ferric dosing required.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Temperature Sensitivity */}
      {activeTab === 'TEMP' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
            <span>Biological Kinetics Temperature Correction (Arrhenius θ Equation)</span>
            <span className="text-cyan-400">Design Temp: {quality.temperature.designValue} °C</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-slate-400 text-[11px] block">Winter Minimum Design Temp (12 °C)</span>
              <div className="text-amber-400 font-bold text-sm">Nitrification Rate Factor: 0.42x of 20°C Base</div>
              <p className="text-slate-400 text-[10px]">Determines maximum required Aerated Tank Volume and Aeration Basin SRT.</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-slate-400 text-[11px] block">Summer Maximum Design Temp (28 °C)</span>
              <div className="text-emerald-400 font-bold text-sm">Heterotrophic Respiration Factor: 1.48x of 20°C Base</div>
              <p className="text-slate-400 text-[10px]">Determines peak oxygen uptake rate (OUR) and blower capacity requirements.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
