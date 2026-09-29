import React, { useState } from 'react';
import { Target, Users, TrendingUp, Droplets, ArrowRightLeft } from 'lucide-react';
import { ProjectMetadata, PopulationProjections, WaterDemandBreakdown } from '../types/wtp';
import { convertUnit } from '../core/unitConversion';

interface DesignBasisProps {
  project: ProjectMetadata;
  population: PopulationProjections;
  demand: WaterDemandBreakdown;
  onUpdatePopulation: (updated: Partial<PopulationProjections>) => void;
  onUpdateDemand: (updated: Partial<WaterDemandBreakdown>) => void;
  onUpdateCapacity: (mld: number) => void;
}

export const DesignBasisView: React.FC<DesignBasisProps> = ({
  project,
  population,
  demand,
  onUpdatePopulation,
  onUpdateDemand,
  onUpdateCapacity
}) => {
  // Unit Conversion calculator sub-state
  const [convValue, setConvValue] = useState<number>(50);
  const [fromUnit, setFromUnit] = useState<string>('MLD');
  const [toUnit, setToUnit] = useState<string>('m3/hr');
  const [convCategory, setConvCategory] = useState<string>('flow');

  const convertedResult = convertUnit(convValue, fromUnit, toUnit, convCategory);

  // Population calculation formulas
  const P0 = population.basePopulation;
  const r = population.growthRatePercent / 100;
  const n = population.designYears;

  const arithmeticPop = Math.round(P0 * (1 + r * n));
  const geometricPop = Math.round(P0 * Math.pow(1 + r, n));
  const incrementalPop = Math.round(P0 * (1 + r * n) + 0.5 * 1250 * n * (n + 1));
  const logisticPop = Math.round(1500000 / (1 + 5.0 * Math.exp(-0.035 * n)));

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Target className="w-6 h-6 text-cyan-400" />
          <span>Design Basis & Water Demand Forecasting</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Population growth projections, per capita allowances, peak day/hour demand factors, and WTP nominal capacity.
        </p>
      </div>

      {/* Population Growth Projection Models */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Demographic Population Growth Projections</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Base Population (Present)</label>
            <input
              type="number"
              value={population.basePopulation}
              onChange={e => onUpdatePopulation({ basePopulation: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Annual Growth Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={population.growthRatePercent}
              onChange={e => onUpdatePopulation({ growthRatePercent: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Design Period (Years)</label>
            <input
              type="number"
              value={population.designYears}
              onChange={e => onUpdatePopulation({ designYears: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Growth Model Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div 
            onClick={() => onUpdatePopulation({ selectedPopulation: arithmeticPop })}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              population.selectedPopulation === arithmeticPop 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-3xs text-slate-500 uppercase">Arithmetic Growth</div>
            <div className="text-xl font-bold mt-1">{arithmeticPop.toLocaleString()}</div>
            <div className="text-3xs text-slate-400 mt-2">Pn = P0 * (1 + r*n)</div>
          </div>

          <div 
            onClick={() => onUpdatePopulation({ selectedPopulation: geometricPop })}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              population.selectedPopulation === geometricPop 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-3xs text-slate-500 uppercase">Geometric Growth</div>
            <div className="text-xl font-bold mt-1">{geometricPop.toLocaleString()}</div>
            <div className="text-3xs text-slate-400 mt-2">Pn = P0 * (1 + r)^n</div>
          </div>

          <div 
            onClick={() => onUpdatePopulation({ selectedPopulation: incrementalPop })}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              population.selectedPopulation === incrementalPop 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-3xs text-slate-500 uppercase">Incremental Increase</div>
            <div className="text-xl font-bold mt-1">{incrementalPop.toLocaleString()}</div>
            <div className="text-3xs text-slate-400 mt-2">Recommended for expanding cities</div>
          </div>

          <div 
            onClick={() => onUpdatePopulation({ selectedPopulation: logisticPop })}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              population.selectedPopulation === logisticPop 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-3xs text-slate-500 uppercase">Logistic Curve</div>
            <div className="text-xl font-bold mt-1">{logisticPop.toLocaleString()}</div>
            <div className="text-3xs text-slate-400 mt-2">S-curve saturation model</div>
          </div>
        </div>
      </div>

      {/* Water Demand Factors & Nominal Plant Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 font-mono text-xs">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Demand Allowances & Peak Factors</span>
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Domestic Per Capita Allowance (Lpcd):</span>
              <input
                type="number"
                value={demand.domesticLpcd}
                onChange={e => onUpdateDemand({ domesticLpcd: Number(e.target.value) })}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Commercial & Industrial Allowance (Lpcd):</span>
              <input
                type="number"
                value={demand.commercialLpcd}
                onChange={e => onUpdateDemand({ commercialLpcd: Number(e.target.value) })}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Non-Revenue Water (NRW / Losses %):</span>
              <input
                type="number"
                value={demand.unaccountedForWaterPercent}
                onChange={e => onUpdateDemand({ unaccountedForWaterPercent: Number(e.target.value) })}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-bold"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Maximum Day Peak Factor (K_day):</span>
              <input
                type="number"
                step="0.05"
                value={demand.peakFactorDay}
                onChange={e => onUpdateDemand({ peakFactorDay: Number(e.target.value) })}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-slate-100 font-bold"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-cyan-400 font-bold">WTP Nominal Design Capacity (MLD):</span>
              <input
                type="number"
                value={project.plantCapacityMLD}
                onChange={e => onUpdateCapacity(Number(e.target.value))}
                className="w-32 bg-cyan-950 border border-cyan-500 rounded-lg px-3 py-1.5 text-right text-cyan-200 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Interactive Unit Conversion Utility */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 font-mono text-xs">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span>Universal Engineering Unit Converter</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={convCategory}
                onChange={e => setConvCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="flow">Flow Rate (MLD, m3/hr, L/s, GPM)</option>
                <option value="concentration">Concentration (mg/L, ppm, g/L, % w/v)</option>
                <option value="power">Power (kW, HP, W, MW)</option>
                <option value="pressure">Head / Pressure (m, kPa, bar, psi)</option>
                <option value="length">Length (m, mm, cm, in)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">From Value & Unit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={convValue}
                    onChange={e => setConvValue(Number(e.target.value))}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold"
                  />
                  <input
                    type="text"
                    value={fromUnit}
                    onChange={e => setFromUnit(e.target.value)}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">To Unit</label>
                <input
                  type="text"
                  value={toUnit}
                  onChange={e => setToUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                />
              </div>
            </div>

            <div className="p-4 bg-cyan-950/60 border border-cyan-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-300">Converted Engineering Value:</span>
              <span className="text-lg font-bold text-cyan-200">
                {convertedResult.toLocaleString('en-US', { maximumFractionDigits: 4 })} {toUnit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
