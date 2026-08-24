import React, { useState } from 'react';
import { Pipette, FlaskConical, ShieldCheck, AlertCircle, Sparkles, Scale, Layers, Beaker, DollarSign, Activity } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { 
  calculateChemicalDose, 
  compareCoagulants, 
  runJarTestSimulation, 
  calculateAlkalinityAndPhBalance, 
  calculateFeMnOxidation, 
  calculateRoMembraneSystem, 
  calculateChlorineCt, 
  generateChemicalStorageAndEquipment 
} from '../core/chemicalEngine';
import { MASTER_CHEMICAL_REGISTRY } from '../core/chemicalRegistry';

interface ChemicalProps {
  state: CalculatedWtpState;
  customParams?: Record<string, number>;
  onUpdateParam: (key: string, val: number) => void;
}

export const ChemicalDosingView: React.FC<ChemicalProps> = ({
  state,
  customParams = {},
  onUpdateParam
}) => {
  const [activeTab, setActiveTab] = useState<'coagulants' | 'jarTest' | 'alkalinity' | 'feMn' | 'membranes' | 'disinfection' | 'storage'>('coagulants');

  const plantCapacityMLD = state.plantCapacityMLD || 50;
  const alumDose = customParams['alum_dose'] || 35;
  const rawTurbidity = customParams['turbidity_raw'] || 45;
  const rawPh = customParams['ph_raw'] || 7.2;
  const rawAlk = customParams['alkalinity_raw'] || 85;
  const cl2Dose = customParams['cl2_dose'] || 3.5;
  const limeDose = customParams['lime_dose'] || 12;

  // 1. Coagulant Comparison
  const coagulantComparisons = compareCoagulants(plantCapacityMLD, rawTurbidity, rawAlk);

  // 2. Jar Test
  const jarTestResult = runJarTestSimulation(rawTurbidity, rawPh, rawAlk);

  // 3. Alkalinity & pH
  const alkBalance = calculateAlkalinityAndPhBalance(rawAlk, rawPh, 'ALUM', alumDose, 'LIME', limeDose);

  // 4. Fe & Mn Oxidation
  const rawFe = customParams['fe_raw'] || 2.8;
  const rawMn = customParams['mn_raw'] || 0.45;
  const feMnResult = calculateFeMnOxidation(plantCapacityMLD, rawFe, rawMn);

  // 5. RO Membrane System
  const roFeedFlow = (plantCapacityMLD * 1000) / 24;
  const roResult = calculateRoMembraneSystem(roFeedFlow, 75, 2000, 18);

  // 6. Chlorine CT
  const cctVolumeM3 = (roFeedFlow * 30) / 60; // 30 min detention
  const ctResult = calculateChlorineCt(plantCapacityMLD, cl2Dose, cctVolumeM3, 0.7, 3.5, rawFe, rawMn, 0.1);

  // 7. Chemical Storage
  const alumStorage = generateChemicalStorageAndEquipment('ALUM', alumDose, plantCapacityMLD, 30);
  const cl2Storage = generateChemicalStorageAndEquipment('CL2_GAS', cl2Dose, plantCapacityMLD, 30);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Pipette className="w-6 h-6 text-cyan-400" />
            <span>Chemical Treatment, Water Quality & Advanced Systems Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Coagulant selection, Jar test curves, Alkalinity/pH balance, Fe/Mn oxidation, Membrane/RO balance, Disinfection CT, and Chemical Storage Auto-Generator.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
          <div className="text-3xs text-slate-400">Design Capacity</div>
          <div className="text-sm font-bold text-cyan-400">{plantCapacityMLD} MLD ({(plantCapacityMLD * 1000 / 24).toFixed(1)} m³/hr)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('coagulants')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'coagulants' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Coagulants Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab('jarTest')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'jarTest' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Jar Test Optimization</span>
        </button>

        <button
          onClick={() => setActiveTab('alkalinity')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'alkalinity' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Alkalinity & pH</span>
        </button>

        <button
          onClick={() => setActiveTab('feMn')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'feMn' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Beaker className="w-4 h-4" />
          <span>Iron & Manganese</span>
        </button>

        <button
          onClick={() => setActiveTab('membranes')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'membranes' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Membranes & RO</span>
        </button>

        <button
          onClick={() => setActiveTab('disinfection')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'disinfection' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Disinfection & CT</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
            activeTab === 'storage' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Storage & Equipment</span>
        </button>
      </div>

      {/* Tab 1: Coagulants Comparison */}
      {activeTab === 'coagulants' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coagulantComparisons.map(item => (
              <div key={item.chemicalCode} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-cyan-300 text-sm">{item.chemicalName}</h3>
                  <span className="text-3xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">{item.chemicalCode}</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rec. Active Dose:</span>
                    <span className="font-bold text-slate-100">{item.recommendedDoseMgL} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commercial Product Dose:</span>
                    <span className="font-bold text-amber-400">{item.commercialDoseMgL} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alk Consumed (CaCO3):</span>
                    <span className="text-rose-400">{item.alkalinityConsumedMgL} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sludge Produced:</span>
                    <span className="text-slate-200">{item.sludgeProducedKgDay} kg/day</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                    <span className="text-slate-400">Chemical Cost:</span>
                    <span className="text-emerald-400">${item.dailyCostUSD}/day (${item.costPerM3USD}/m³)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-3xs text-slate-400">
                  <span className="text-cyan-400 font-bold block mb-1">Engineering Assessment:</span>
                  {item.engineeringRemarks}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Jar Test Optimization */}
      {activeTab === 'jarTest' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-cyan-300 text-sm">Jar Test Curve Dataset ({jarTestResult.testId})</h3>
                <p className="text-3xs text-slate-400">Raw Water: Turbidity {jarTestResult.rawWaterTurbidityNTU} NTU | pH {jarTestResult.rawWaterPh} | Alk {jarTestResult.rawWaterAlkalinityMgL} mg/L</p>
              </div>
              <div className="bg-cyan-950 border border-cyan-800 text-cyan-300 px-3 py-1 rounded text-2xs font-bold">
                Optimum Dose: {jarTestResult.recommendedEngineeringDoseMgL} mg/L
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-2xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Jar #</th>
                    <th className="py-2.5 px-3">Dose (mg/L)</th>
                    <th className="py-2.5 px-3">Turbidity (NTU)</th>
                    <th className="py-2.5 px-3">Color (TCU)</th>
                    <th className="py-2.5 px-3">Final pH</th>
                    <th className="py-2.5 px-3">Floc Size</th>
                    <th className="py-2.5 px-3">Settling (m/hr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {jarTestResult.points.map(pt => (
                    <tr key={pt.jarNumber} className={pt.chemicalDoseMgL === 22.5 || pt.chemicalDoseMgL === 20 ? 'bg-cyan-950/40 text-cyan-200 font-bold' : 'hover:bg-slate-950/50'}>
                      <td className="py-2 px-3">Jar #{pt.jarNumber}</td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">{pt.chemicalDoseMgL}</td>
                      <td className="py-2 px-3 text-amber-300">{pt.finalTurbidityNTU}</td>
                      <td className="py-2 px-3">{pt.finalColorTCU}</td>
                      <td className="py-2 px-3">{pt.finalPh}</td>
                      <td className="py-2 px-3">{pt.flocSizeRating}</td>
                      <td className="py-2 px-3 text-emerald-400">{pt.settlingVelocityMhr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-2xs space-y-2">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Jar Test Optimization Trade-off Rationale:
              </span>
              <p className="text-slate-300 leading-relaxed">{jarTestResult.selectionRationale}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alkalinity & pH */}
      {activeTab === 'alkalinity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-cyan-300 text-sm border-b border-slate-800 pb-2">Alkalinity Balance & Buffering Check</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Raw Water Alkalinity:</span>
                <span className="font-bold text-slate-100">{alkBalance.rawAlkalinityMgL} mg/L as CaCO3</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Coagulant Consumption:</span>
                <span className="font-bold text-rose-400">-{alkBalance.coagulantAlkalinityConsumptionMgL} mg/L</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Added Alkalinity ({alkBalance.addedChemicalName}):</span>
                <span className="font-bold text-emerald-400">+{alkBalance.alkalineChemicalAddedMgL} mg/L</span>
              </div>
              <div className="flex justify-between p-3 bg-cyan-950/60 rounded border border-cyan-800 font-bold">
                <span className="text-cyan-300">Residual Buffer Alkalinity:</span>
                <span className={alkBalance.isAlkalinitySufficient ? 'text-emerald-400' : 'text-rose-400'}>
                  {alkBalance.residualAlkalinityMgL} mg/L ({alkBalance.residualAlkalinityMeqL} meq/L)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-cyan-300 text-sm border-b border-slate-800 pb-2">pH Estimate & Stabilization Control</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Raw Water pH:</span>
                <span className="font-bold text-slate-100">{rawPh}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Estimated Final Coagulated pH:</span>
                <span className="font-bold text-amber-300">{alkBalance.estimatedFinalPh}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Calculation Engine Mode:</span>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  {alkBalance.phCalculationMode}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Fe & Mn */}
      {activeTab === 'feMn' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-cyan-300 text-sm border-b border-slate-800 pb-2">Iron (Fe) & Manganese (Mn) Oxidation Demand</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block">Raw Metals Conc:</span>
              <div className="text-sm font-bold text-amber-300">Fe: {feMnResult.rawFeMgL} mg/L | Mn: {feMnResult.rawMnMgL} mg/L</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block">Chlorine Demand (Cl₂):</span>
              <div className="text-sm font-bold text-emerald-400">{(feMnResult.chlorineDemandFeMgL + feMnResult.chlorineDemandMnMgL).toFixed(2)} mg/L ({feMnResult.requiredChlorineOxidantKgDay} kg/day)</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block">KMnO₄ Demand:</span>
              <div className="text-sm font-bold text-cyan-300">{(feMnResult.kmno4DemandFeMgL + feMnResult.kmno4DemandMnMgL).toFixed(2)} mg/L ({feMnResult.requiredKmno4OxidantKgDay} kg/day)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Membranes & RO */}
      {activeTab === 'membranes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-cyan-300 text-sm border-b border-slate-800 pb-2">Reverse Osmosis (RO) Mass Balance & Hydraulic Sizing</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 block">Permeate Product Flow:</span>
              <span className="text-sm font-bold text-emerald-400">{roResult.permeateFlowM3hr} m³/hr</span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 block">Concentrate Reject Flow:</span>
              <span className="text-sm font-bold text-rose-400">{roResult.rejectFlowM3hr} m³/hr</span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 block">Required Membrane Area:</span>
              <span className="text-sm font-bold text-cyan-300">{roResult.requiredMembraneAreaM2} m²</span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 block">Operating Pressure:</span>
              <span className="text-sm font-bold text-amber-300">{roResult.operatingPressureBar} bar</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Disinfection & CT */}
      {activeTab === 'disinfection' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-emerald-300 text-sm">Disinfection CT Calculation & Pathogen Log Removal</h3>
            <span className={`px-2.5 py-1 rounded text-2xs font-bold ${
              ctResult.complianceStatus === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              CT COMPLIANCE: {ctResult.complianceStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Effective Contact Time (T₁₀):</span>
              <div className="text-base font-bold text-cyan-300">{ctResult.effectiveContactTimeT10Min} min (Baffle Factor: {ctResult.baffleFactor})</div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">Achieved CT Credit:</span>
              <div className="text-base font-bold text-emerald-400">{ctResult.ctAchievedMgMinL} mg·min/L</div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400">EPA Giardia Requirement:</span>
              <div className="text-base font-bold text-amber-300">{ctResult.ctRequiredGiardiaMgMinL} mg·min/L (3-Log)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Storage & Equipment */}
      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-cyan-300 text-sm border-b border-slate-800 pb-2">Alum Chemical Storage & Dosing Equipment</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Required Storage Vol (30 Days):</span>
                <span className="font-bold text-cyan-300">{alumStorage.requiredStorageVolumeM3} m³</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Storage Tanks Configuration:</span>
                <span className="font-bold text-slate-100">{alumStorage.numberOfStorageTanks} x {alumStorage.tankUnitCapacityM3} m³ Vessels</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Dosing Pump Capacity:</span>
                <span className="font-bold text-emerald-400">{alumStorage.dosingPumpCapacityLhr} L/hr @ {alumStorage.dosingPumpHeadM}m</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Duty/Standby Arrangement:</span>
                <span className="font-bold text-amber-300">{alumStorage.dutyStandbyArrangement}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-emerald-300 text-sm border-b border-slate-800 pb-2">Gas Chlorination Storage & Feed Equipment</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Daily Gas Consumption:</span>
                <span className="font-bold text-emerald-300">{cl2Storage.dailyConsumptionKgDay} kg/day</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">30-Day Onsite Inventory:</span>
                <span className="font-bold text-slate-100">{Math.ceil(cl2Storage.dailyConsumptionKgDay * 30 / 1000)} x 1-Ton Cylinders</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Chlorinator Feed Capacity:</span>
                <span className="font-bold text-cyan-300">{(cl2Storage.dailyConsumptionKgDay / 24 * 1.5).toFixed(1)} kg/hr</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded">
                <span className="text-slate-400">Safety Features:</span>
                <span className="font-bold text-amber-300">Automatic Scrubbers + Emergency Shut-off</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
