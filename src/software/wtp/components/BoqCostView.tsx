import React, { useState } from 'react';
import { 
  Coins, 
  Calculator, 
  Layers, 
  TrendingUp, 
  Package, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  ArrowRight
} from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { generateQuantityTakeoff } from '../core/quantityTakeoffEngine';
import { generateMasterBoq } from '../core/boqEngine';
import { calculateRateAnalysis, calculateCapexSummary, calculateLifeCycleCost, convertCurrency } from '../core/costEngine';
import { calculateWtpOpex } from '../core/opexEngine';
import { generateProcurementPackages, APPROVED_VENDOR_DATABASE, evaluateTechnicalBid } from '../core/procurementEngine';
import { generateMasterConstructionSchedule, calculatePaymentCertificate, calculateCostControl, simulateDesignChangeImpact } from '../core/constructionEngine';
import { runEngineeringTestSuite } from '../core/engineeringTests';

interface BoqProps {
  state: CalculatedWtpState;
  currency?: string;
}

export const BoqCostView: React.FC<BoqProps> = ({ state, currency = 'USD' }) => {
  const [activeTab, setActiveTab] = useState<
    'takeoff' | 'boq' | 'rateAnalysis' | 'capexOpexLcc' | 'procurement' | 'vendors' | 'schedule' | 'ipc' | 'costControl' | 'audit'
  >('boq');

  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'BDT' | 'EUR' | 'GBP'>('USD');
  const [bdtRate, setBdtRate] = useState<number>(118.0);

  // Computations from Core Engines
  const quantities = generateQuantityTakeoff(state);
  const boqItems = generateMasterBoq(state);
  const capex = calculateCapexSummary(boqItems, state.plantCapacityMLD);
  const opex = calculateWtpOpex(state, { exchangeRateBdtPerUsd: bdtRate });
  const lcc = calculateLifeCycleCost(capex.totalCapexUSD, opex.totalAnnualOpexUSD, state.plantCapacityMLD);
  const packages = generateProcurementPackages(boqItems);
  const schedule = generateMasterConstructionSchedule(state.plantCapacityMLD);
  const sampleIpc = calculatePaymentCertificate('IPC-004', 1500000);
  const costControl = calculateCostControl(capex.totalCapexUSD, 250000, capex.totalCapexUSD * 0.5, capex.totalCapexUSD * 0.35);
  const changeImpact = simulateDesignChangeImpact(state.plantCapacityMLD, state.plantCapacityMLD * 1.5, capex.totalCapexUSD);
  const allTests = runEngineeringTestSuite();
  const phase10Tests = allTests.filter(t => t.id >= 'TEST-65' && t.id <= 'TEST-84');

  const currConv = convertCurrency(capex.totalCapexUSD, selectedCurrency, bdtRate);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-emerald-400" />
            <span>BOQ, Cost Estimation, Procurement & Construction Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete engineering takeoff, 16-trade BOQ, rate analysis, CAPEX/OPEX/LCC, long-lead procurement & CPM schedule.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-semibold text-3xs uppercase">Currency:</span>
          {(['USD', 'BDT', 'EUR', 'GBP'] as const).map(curr => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1 rounded text-2xs font-bold transition ${
                selectedCurrency === curr 
                  ? 'bg-cyan-600 text-white shadow' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {curr}
            </button>
          ))}
          {selectedCurrency === 'BDT' && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
              <span className="text-3xs text-slate-400">Rate:</span>
              <input
                type="number"
                value={bdtRate}
                onChange={e => setBdtRate(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-cyan-300 font-bold text-3xs text-center"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'boq', label: '1. Master BOQ', icon: Coins },
          { id: 'takeoff', label: '2. Quantity Takeoff', icon: Layers },
          { id: 'rateAnalysis', label: '3. Rate Analysis', icon: Calculator },
          { id: 'capexOpexLcc', label: '4. CAPEX / OPEX / LCC', icon: TrendingUp },
          { id: 'procurement', label: '5. Procurement Packages', icon: Package },
          { id: 'vendors', label: '6. Vendor Evaluation', icon: Users },
          { id: 'schedule', label: '7. Construction CPM', icon: Calendar },
          { id: 'ipc', label: '8. Payment Certificates (IPC)', icon: FileText },
          { id: 'costControl', label: '9. Cost Control & Scale Impact', icon: BarChart3 },
          { id: 'audit', label: '10. Phase 10 Test Suite', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-3xs transition ${
                isActive 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-3xs uppercase font-semibold">Total Plant CAPEX</span>
          <div className="text-xl font-extrabold text-cyan-400 mt-1">
            {selectedCurrency === 'USD' ? '$' : selectedCurrency + ' '}
            {currConv.convertedAmount.toLocaleString()}
          </div>
          <span className="text-3xs text-slate-500 mt-1 block">Includes 8% EPCM + 5% Contingency</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-3xs uppercase font-semibold">Annual OPEX</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            ${opex.totalAnnualOpexUSD.toLocaleString()} / yr
          </div>
          <span className="text-3xs text-slate-500 mt-1 block">${opex.opexCostPerM3TreatedUSD.toFixed(3)} / m³ treated water</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-3xs uppercase font-semibold">25-Year Present Value LCC</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            ${(lcc.totalLifeCycleCostUSD / 1000000).toFixed(2)} Million
          </div>
          <span className="text-3xs text-slate-500 mt-1 block">Discount: {lcc.discountRatePercent}% | Infl: {lcc.inflationRatePercent}%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-3xs uppercase font-semibold">Long-Lead Procurement</span>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            {packages.filter(p => p.isLongLeadItem).length} Packages
          </div>
          <span className="text-3xs text-slate-500 mt-1 block">Lead time &ge; 16 weeks required</span>
        </div>
      </div>

      {/* TAB 1: MASTER BOQ */}
      {activeTab === 'boq' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h2 className="text-sm font-bold text-slate-200">16-Trade Master Bill of Quantities (BOQ)</h2>
              <p className="text-3xs text-slate-400">Classified by WBS Code & Engineering Specifications</p>
            </div>
            <span className="text-3xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full font-bold">
              {boqItems.length} Verified Line Items
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
              <tr>
                <th className="p-3">WBS</th>
                <th className="p-3">Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Spec Ref</th>
                <th className="p-3 text-center">Unit</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Unit Rate ($)</th>
                <th className="p-3 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {boqItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-cyan-400 font-bold">{item.wbsCode}</td>
                  <td className="p-3 text-slate-300 font-semibold">{item.boqCode}</td>
                  <td className="p-3 text-slate-300 font-medium">{item.category}</td>
                  <td className="p-3 text-slate-400 text-3xs max-w-xs">{item.description}</td>
                  <td className="p-3 text-cyan-300 text-3xs">{item.specificationRef}</td>
                  <td className="p-3 text-center text-slate-400">{item.unit}</td>
                  <td className="p-3 text-right font-bold text-slate-200">{item.quantity.toLocaleString()}</td>
                  <td className="p-3 text-right text-slate-400">${item.unitRateUSD.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">${item.totalPriceUSD.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t border-slate-800 text-xs">
              <tr>
                <td colSpan={8} className="p-3.5 text-right uppercase text-slate-400">Total Direct Construction Cost (USD):</td>
                <td className="p-3.5 text-right text-cyan-300">${boqItems.reduce((s, i) => s + i.totalPriceUSD, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* TAB 2: QUANTITY TAKEOFF */}
      {activeTab === 'takeoff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950">
            <h2 className="text-sm font-bold text-slate-200">Engineering Quantity Takeoff Engine</h2>
            <p className="text-3xs text-slate-400">Directly extracted from hydraulic, structural, mechanical & electrical calculation modules</p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Source Module</th>
                <th className="p-3">Source Object</th>
                <th className="p-3">Design Parameter & Formula</th>
                <th className="p-3 text-center">Unit</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quantities.map(q => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-cyan-400 font-bold">{q.id}</td>
                  <td className="p-3 text-slate-300 font-semibold">{q.sourceModule}</td>
                  <td className="p-3 text-slate-300">{q.sourceObject}</td>
                  <td className="p-3 text-slate-400 text-3xs">
                    <span className="font-semibold text-slate-300">{q.designParameter}</span>
                    <span className="block text-cyan-300 font-mono mt-0.5">{q.formula}</span>
                  </td>
                  <td className="p-3 text-center text-slate-400">{q.unit}</td>
                  <td className="p-3 text-right font-bold text-amber-300">{q.quantity.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-3xs font-bold">
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: RATE ANALYSIS */}
      {activeTab === 'rateAnalysis' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h2 className="text-sm font-bold text-slate-200 mb-1">First-Principles Unit Rate Analysis Framework</h2>
            <p className="text-3xs text-slate-400 mb-4">Breakdown of Material, Labour, Equipment, Transport, Wastage %, Overhead %, Profit % and Tax %</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boqItems.slice(0, 4).map(item => {
                const ra = calculateRateAnalysis(item);
                return (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-cyan-400 font-bold">{item.boqCode}</span>
                        <h3 className="text-xs font-bold text-slate-200 mt-0.5">{item.description}</h3>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">${ra.finalUnitRateUSD.toFixed(2)} / {item.unit}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-3xs bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      <div><span className="text-slate-500">Material:</span> <span className="text-slate-300 font-bold">${ra.materialComponentUSD}</span></div>
                      <div><span className="text-slate-500">Labour:</span> <span className="text-slate-300 font-bold">${ra.labourComponentUSD}</span></div>
                      <div><span className="text-slate-500">Equipment:</span> <span className="text-slate-300 font-bold">${ra.equipmentComponentUSD}</span></div>
                      <div><span className="text-slate-500">Transport:</span> <span className="text-slate-300 font-bold">${ra.transportComponentUSD}</span></div>
                      <div><span className="text-slate-500">Wastage ({ra.materialWastagePercent}%):</span> <span className="text-amber-400 font-bold">${ra.wastageCostUSD}</span></div>
                      <div><span className="text-slate-500">Basic Rate:</span> <span className="text-cyan-300 font-bold">${ra.basicRateUSD}</span></div>
                      <div><span className="text-slate-500">Overhead ({ra.overheadPercent}%):</span> <span className="text-slate-300 font-bold">${ra.overheadUSD}</span></div>
                      <div><span className="text-slate-500">Profit ({ra.profitPercent}%):</span> <span className="text-slate-300 font-bold">${ra.profitUSD}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAPEX / OPEX / LCC */}
      {activeTab === 'capexOpexLcc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CAPEX */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Capital Expenditure (CAPEX) Summary</h2>
            <div className="space-y-2 text-3xs">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Civil & Structural Works:</span>
                <span className="font-bold text-slate-200">${capex.civilCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Process Mechanical Equipment:</span>
                <span className="font-bold text-slate-200">${capex.processMechanicalCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Piping & Valves System:</span>
                <span className="font-bold text-slate-200">${capex.pipingAndValvesCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Electrical Substation & MCC:</span>
                <span className="font-bold text-slate-200">${capex.electricalCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Instrumentation & Analytics:</span>
                <span className="font-bold text-slate-200">${capex.instrumentationCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Automation, PLC & SCADA:</span>
                <span className="font-bold text-slate-200">${capex.automationCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Sludge Dewatering & Environmental:</span>
                <span className="font-bold text-slate-200">${capex.sludgeAndEnvironmentalCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50 text-cyan-300">
                <span>Engineering & EPCM (8%):</span>
                <span className="font-bold">${capex.engineeringAndSupervisionCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50 text-amber-300">
                <span>Contingency Margin (5%):</span>
                <span className="font-bold">${capex.contingencyCapexUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-xs font-extrabold text-emerald-400 border-t border-slate-700">
                <span>TOTAL PLANT CAPEX (USD):</span>
                <span>${capex.totalCapexUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* OPEX & LCC */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Annual OPEX & 25-Year LCC</h2>
            <div className="space-y-2 text-3xs">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Daily Power Energy ({opex.energy.totalEnergyKwhDay.toLocaleString()} kWh/day):</span>
                <span className="font-bold text-slate-200">${opex.energy.dailyEnergyCostUSD} / day</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Daily Chemicals (Coagulant, Polymer, Cl2, Lime):</span>
                <span className="font-bold text-slate-200">${opex.chemicals.totalDailyChemicalCostUSD} / day</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Annual Maintenance & Servicing (% CAPEX):</span>
                <span className="font-bold text-slate-200">${opex.maintenance.totalAnnualMaintenanceUSD.toLocaleString()} / yr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Annual Staff Labour ({opex.labour.totalHeadcount} Staff):</span>
                <span className="font-bold text-slate-200">${opex.labour.totalAnnualLabourCostUSD.toLocaleString()} / yr</span>
              </div>
              <div className="flex justify-between py-2 text-xs font-extrabold text-emerald-400 border-t border-slate-700">
                <span>TOTAL ANNUAL OPEX (USD):</span>
                <span>${opex.totalAnnualOpexUSD.toLocaleString()} / yr</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950 p-3 rounded-lg space-y-1.5">
                <span className="text-amber-400 font-bold block text-2xs uppercase">Net Present Value 25-Year LCC</span>
                <div className="flex justify-between text-slate-300">
                  <span>Present Value of 25-Yr OPEX:</span>
                  <span className="font-bold">${(lcc.presentValueOfOpexUSD / 1000000).toFixed(2)} M</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Present Value of Equipment Replacements:</span>
                  <span className="font-bold">${(lcc.presentValueOfReplacementsUSD / 1000000).toFixed(2)} M</span>
                </div>
                <div className="flex justify-between text-cyan-300 font-extrabold text-xs pt-1 border-t border-slate-800">
                  <span>TOTAL LIFE-CYCLE COST (LCC):</span>
                  <span>${(lcc.totalLifeCycleCostUSD / 1000000).toFixed(2)} Million</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROCUREMENT PACKAGES */}
      {activeTab === 'procurement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950">
            <h2 className="text-sm font-bold text-slate-200">Procurement Packaging & Long-Lead Schedule Interlock</h2>
            <p className="text-3xs text-slate-400">Flagging items with lead time &ge; 16 weeks to prevent site construction delays</p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
              <tr>
                <th className="p-3">Pkg ID</th>
                <th className="p-3">Package Description</th>
                <th className="p-3 text-center">Items</th>
                <th className="p-3 text-right">Estimated Cost ($)</th>
                <th className="p-3 text-center">Lead Time</th>
                <th className="p-3 text-center">Long Lead?</th>
                <th className="p-3 text-center">Required On Site</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {packages.map(p => (
                <tr key={p.packageId} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-cyan-400 font-bold">{p.packageId}</td>
                  <td className="p-3 text-slate-200 font-semibold">{p.packageName}</td>
                  <td className="p-3 text-center text-slate-400">{p.itemsCount}</td>
                  <td className="p-3 text-right font-bold text-slate-200">${p.totalEstimatedCostUSD.toLocaleString()}</td>
                  <td className="p-3 text-center font-bold text-amber-300">{p.leadTimeWeeks} Weeks</td>
                  <td className="p-3 text-center">
                    {p.isLongLeadItem ? (
                      <span className="bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-3xs font-bold flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        LONG LEAD
                      </span>
                    ) : (
                      <span className="text-slate-500 text-3xs">Standard</span>
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-300">{p.requiredOnSiteDate}</td>
                  <td className="p-3 text-center">
                    <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-3xs font-bold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: VENDOR EVALUATION */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h2 className="text-sm font-bold text-slate-200 mb-3">Approved Vendor Database & Technical Bid Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {APPROVED_VENDOR_DATABASE.map(v => {
                const evalRes = evaluateTechnicalBid('PKG-PMP-01', v.vendorId, 92.0, false);
                return (
                  <div key={v.vendorId} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-cyan-400 font-bold text-3xs">{v.vendorId}</span>
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-3xs px-2 py-0.5 rounded font-bold">
                        {v.prequalificationStatus}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200">{v.vendorName}</h3>
                    <p className="text-3xs text-slate-400">{v.productCategory}</p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-3xs">
                      <span className="text-slate-500">Typical Lead: {v.typicalLeadTimeWeeks} wks</span>
                      <span className="text-emerald-400 font-bold">Tech Rating: {evalRes.technicalScore}/100 ({evalRes.overallEvaluationResult})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CONSTRUCTION SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950">
            <h2 className="text-sm font-bold text-slate-200">Master Construction CPM Schedule & Critical Path</h2>
            <p className="text-3xs text-slate-400">Zero-float critical path sequence with predecessors and progress tracking</p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
              <tr>
                <th className="p-3">WBS</th>
                <th className="p-3">Activity Name</th>
                <th className="p-3 text-center">Duration</th>
                <th className="p-3 text-center">Start</th>
                <th className="p-3 text-center">Finish</th>
                <th className="p-3 text-center">Float</th>
                <th className="p-3 text-center">Critical?</th>
                <th className="p-3 text-center">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {schedule.map(a => (
                <tr key={a.activityId} className={`hover:bg-slate-800/40 transition ${a.isCriticalPath ? 'bg-rose-950/20' : ''}`}>
                  <td className="p-3 text-cyan-400 font-bold">{a.wbsCode}</td>
                  <td className="p-3 text-slate-200 font-semibold">{a.activityName}</td>
                  <td className="p-3 text-center font-bold text-amber-300">{a.durationDays} Days</td>
                  <td className="p-3 text-center text-slate-400">{a.startDate}</td>
                  <td className="p-3 text-center text-slate-400">{a.finishDate}</td>
                  <td className="p-3 text-center font-bold text-slate-300">{a.floatDays}d</td>
                  <td className="p-3 text-center">
                    {a.isCriticalPath ? (
                      <span className="bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-3xs font-bold">CRITICAL</span>
                    ) : (
                      <span className="text-slate-500 text-3xs">Normal</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-cyan-300 font-bold">{a.actualProgressPercent}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 8: PAYMENT CERTIFICATES */}
      {activeTab === 'ipc' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Interim Payment Certificate (IPC) Net Payable Engine</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-3xs">
            <div className="bg-slate-950 p-4 rounded-lg space-y-2 border border-slate-800">
              <span className="text-cyan-400 font-bold">{sampleIpc.ipcNumber} - {sampleIpc.contractorName}</span>
              <div className="flex justify-between"><span className="text-slate-400">Executed Gross Work:</span> <span className="font-bold text-slate-200">${sampleIpc.grossAmountUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-rose-400"><span>Retention Deduction (5%):</span> <span>-${sampleIpc.retentionDeductionUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-amber-400"><span>Advance Recovery (10%):</span> <span>-${sampleIpc.advanceRecoveryUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400"><span>Tax Withholding (3%):</span> <span>-${sampleIpc.taxDeductionUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-extrabold text-emerald-400 pt-2 border-t border-slate-800">
                <span>NET CERTIFIED PAYABLE:</span>
                <span>${sampleIpc.netPayableUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: COST CONTROL & CHANGE IMPACT */}
      {activeTab === 'costControl' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Cost Control Budget Status</h2>
            <div className="space-y-1.5 text-3xs">
              <div className="flex justify-between"><span className="text-slate-400">Approved Original Budget:</span> <span className="font-bold text-slate-200">${costControl.approvedBudgetUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-amber-300"><span>Approved Variations:</span> <span className="font-bold">+${costControl.approvedVariationsUSD.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-cyan-300 border-t border-slate-800 pt-1"><span>Revised Budget:</span> <span>${costControl.revisedBudgetUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400"><span>Committed Purchase Orders:</span> <span className="font-bold">${costControl.committedCostUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400"><span>Actual Paid to Date:</span> <span className="font-bold">${costControl.actualCostToDateUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-extrabold text-emerald-400 border-t border-slate-700 pt-2">
                <span>REMAINING UNCOMMITTED BUDGET:</span>
                <span>${costControl.remainingUncommittedBudgetUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Design Capacity Change Simulation (50 MLD -&gt; 75 MLD)</h2>
            <div className="space-y-1.5 text-3xs text-slate-300">
              <p className="text-cyan-300 font-bold">Six-Tenths Capacity Scaling Factor applied: 1.5^0.65</p>
              <div className="flex justify-between"><span>Original CAPEX (50 MLD):</span> <span className="font-bold">${changeImpact.originalCapexUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-400 font-bold"><span>Revised CAPEX (75 MLD):</span> <span>${changeImpact.revisedCapexUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-amber-400 font-bold"><span>Cost Increase Delta:</span> <span>+${changeImpact.costDeltaUSD.toLocaleString()}</span></div>
              <div className="flex justify-between text-rose-400 font-bold"><span>Schedule Impact:</span> <span>+${changeImpact.scheduleImpactDays} Days</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: PHASE 10 TEST RUNNER */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Phase 10 Test Suite (TEST-65 to TEST-84)</h2>
              <p className="text-3xs text-slate-400">20 Deterministic engineering validation tests for Takeoff, BOQ, Cost, Procurement & Construction</p>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
              {phase10Tests.filter(t => t.passed).length} / {phase10Tests.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phase10Tests.map(t => (
              <div key={t.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-3xs">{t.id}</span>
                    <h3 className="text-2xs font-bold text-slate-200">{t.name}</h3>
                  </div>
                  <p className="text-3xs text-slate-400 mt-1">{t.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-3xs font-bold ${t.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                  {t.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
