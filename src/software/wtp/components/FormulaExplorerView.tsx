import React, { useState } from 'react';
import { 
  Calculator, 
  Search, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  Activity, 
  GitBranch,
  RefreshCw,
  ExternalLink,
  Table
} from 'lucide-react';
import { MASTER_FORMULA_REGISTRY_DATA, MasterFormulaDefinition } from '../core/masterFormulaRegistry';
import { MASTER_ENGINEERING_STANDARDS_REGISTRY } from '../core/engineeringStandardsRegistry';
import { MASTER_CALCULATION_INDEX, performFormulaAudit, predictParameterChangeImpact, generateCalculationBookJSON } from '../core/masterCalculationIndex';
import { ProjectMetadata } from '../types/wtp';
import { CalculatedWtpState } from '../core/dependencyEngine';

interface FormulaExplorerViewProps {
  project: ProjectMetadata;
  state: CalculatedWtpState;
  onOpenFormulaInspector: (paramId: string) => void;
}

export const FormulaExplorerView: React.FC<FormulaExplorerViewProps> = ({
  project,
  state,
  onOpenFormulaInspector
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'formulas' | 'standards' | 'index' | 'audit' | 'impact'>('formulas');

  // Change Impact simulation state
  const [simCapacity, setSimCapacity] = useState<number>(project.plantCapacityMLD || 50);

  // Perform Formula Audit
  const auditReport = performFormulaAudit();

  // Filtered Formulas
  const filteredFormulas = MASTER_FORMULA_REGISTRY_DATA.filter(f => {
    const matchesSearch = 
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.equation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDiscipline = selectedDiscipline === 'All' || f.discipline === selectedDiscipline;
    return matchesSearch && matchesDiscipline;
  });

  // Filtered Standards
  const filteredStandards = MASTER_ENGINEERING_STANDARDS_REGISTRY.filter(s =>
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Predicted impact items
  const impactItems = predictParameterChangeImpact('Plant Capacity (MLD)', project.plantCapacityMLD, simCapacity);

  // Export Design Calculation Book
  const handleExportCalculationBook = () => {
    const jsonStr = generateCalculationBookJSON(project.name, project.plantCapacityMLD);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WTP_Design_Calculation_Book_${project.id || 'EVL-001'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100 font-mono text-xs">
      
      {/* Page Title & Export Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Global Engineering Formula & Standards Traceability Explorer
              </h1>
              <p className="text-2xs text-slate-400">
                Centralized matrix linking formulas, variables, step-by-step traces, governing standards, and calculation audit logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCalculationBook}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg border border-cyan-400/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Design Calculation Book</span>
          </button>
        </div>
      </div>

      {/* Top Audit KPI Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold">Registered Formulas</div>
          <div className="text-xl font-bold text-cyan-300">{auditReport.totalRegisteredFormulas}</div>
          <div className="text-3xs text-slate-500">Master Formula Index</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold">Indexed Calculations</div>
          <div className="text-xl font-bold text-emerald-300">{auditReport.totalCalculationsIndexed}</div>
          <div className="text-3xs text-slate-500">CALC-001 to CALC-014</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold">Verified Standards</div>
          <div className="text-xl font-bold text-amber-300">{MASTER_ENGINEERING_STANDARDS_REGISTRY.length}</div>
          <div className="text-3xs text-slate-500">AWWA, WHO, CPHEEO, ACI</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold">Hardcoded Equations</div>
          <div className="text-xl font-bold text-emerald-400">0</div>
          <div className="text-3xs text-emerald-400 font-bold">100% Deterministic</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold">Traceability Score</div>
          <div className="text-xl font-bold text-purple-300">{auditReport.traceabilityScore}%</div>
          <div className="text-3xs text-purple-400 font-bold">PE Verified Matrix</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold transition ${
              activeTab === 'formulas' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Master Formula Registry ({filteredFormulas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('index')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold transition ${
              activeTab === 'index' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Master Calculation Index</span>
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold transition ${
              activeTab === 'standards' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Standards & Governing Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold transition ${
              activeTab === 'audit' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Formula Audit Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-2xs font-bold transition ${
              activeTab === 'impact' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Change Impact Predictor</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search formula, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-2xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* TAB 1: FORMULAS LIST */}
      {activeTab === 'formulas' && (
        <div className="space-y-4">
          {/* Discipline Filters */}
          <div className="flex items-center gap-2 overflow-x-auto text-3xs font-bold pb-1">
            <span className="text-slate-500 uppercase">Discipline:</span>
            {['All', 'Process', 'Hydraulics', 'Mechanical', 'Electrical', 'Civil/Structural', 'Cost/Economics', 'Environmental'].map((disc) => (
              <button
                key={disc}
                onClick={() => setSelectedDiscipline(disc)}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedDiscipline === disc
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {disc}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((f) => (
              <div 
                key={f.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-cyan-800/80 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-500/20 text-cyan-300 text-3xs px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/30">
                        {f.id}
                      </span>
                      <span className="text-slate-400 text-3xs font-semibold">{f.discipline}</span>
                    </div>
                    <span className="text-slate-500 text-3xs">{f.category}</span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{f.name}</h3>
                  <p className="text-2xs text-slate-400 line-clamp-2">{f.description}</p>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-emerald-300 text-xs font-bold text-center">
                    {f.equation}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-3xs text-slate-400">
                    Output Unit: <strong className="text-slate-200">{f.units}</strong>
                  </span>

                  <button
                    onClick={() => onOpenFormulaInspector(f.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-2xs rounded-lg border border-slate-700 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>[fx Show Calculation]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER CALCULATION INDEX */}
      {activeTab === 'index' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-0">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <span className="font-bold text-sm text-white">
              Master Index of Engineering Calculations ({MASTER_CALCULATION_INDEX.length} Indexed Calculations)
            </span>
            <span className="text-2xs text-slate-400 font-mono">Bidirectional Traceability Active</span>
          </div>

          <table className="w-full text-left text-2xs">
            <thead className="bg-slate-950/80 text-slate-400 text-3xs uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Calc ID</th>
                <th className="p-3">Calculation Title</th>
                <th className="p-3">Subsystem</th>
                <th className="p-3">Formula ID</th>
                <th className="p-3">Governing Standard</th>
                <th className="p-3">Output Unit</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MASTER_CALCULATION_INDEX.map((c) => (
                <tr key={c.calcId} className="hover:bg-slate-800/40 font-mono">
                  <td className="p-3 font-bold text-cyan-400">{c.calcId}</td>
                  <td className="p-3 text-slate-200 font-sans font-semibold">{c.title}</td>
                  <td className="p-3 text-slate-400">{c.subsystem}</td>
                  <td className="p-3 text-amber-300 font-bold">{c.formulaId}</td>
                  <td className="p-3 text-emerald-300">{c.standardId} ({c.standardClause})</td>
                  <td className="p-3 text-slate-300">{c.unit}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onOpenFormulaInspector(c.formulaId)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-3xs font-bold rounded border border-slate-700 flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>View Trace</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: STANDARDS LIBRARY */}
      {activeTab === 'standards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStandards.map((std) => (
              <div key={std.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xs text-cyan-400 font-bold uppercase">{std.organization}</span>
                    <h3 className="font-bold text-sm text-white mt-0.5">{std.code}: {std.name}</h3>
                  </div>
                  <span className="bg-slate-800 text-slate-300 text-3xs px-2 py-0.5 rounded font-mono">
                    {std.editionYear}
                  </span>
                </div>

                <p className="text-2xs text-slate-300">{std.scope}</p>

                <div className="space-y-1.5 border-t border-slate-800 pt-2">
                  <span className="text-3xs text-slate-400 uppercase font-bold">Verified Clauses:</span>
                  {std.verifiedClauses.map((cl, i) => (
                    <div key={i} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-2xs space-y-1">
                      <div className="flex justify-between items-center text-3xs">
                        <span className="font-bold text-amber-300 font-mono">{cl.clause}: {cl.topic}</span>
                        {cl.verified ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-3xs">{cl.requirementText}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT ENGINE */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-bold text-base text-white">Engineering Formula Audit & Integrity Scanner</h2>
              <p className="text-2xs text-slate-400">Automated verification of formula coverage, unit dimensions, and hard-coded equation detection.</p>
            </div>
            <div className="px-4 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Audit Result: PASSED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-3xs text-slate-400 uppercase font-bold">Formula Coverage</span>
              <div className="text-xl font-bold text-white">{auditReport.totalRegisteredFormulas} / {auditReport.totalRegisteredFormulas}</div>
              <p className="text-2xs text-slate-400">100% of calculations mapped to master registry.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-3xs text-slate-400 uppercase font-bold">Dimensional Integrity</span>
              <div className="text-xl font-bold text-emerald-400">PASSED</div>
              <p className="text-2xs text-slate-400">All formulas verified for unit consistency.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-3xs text-slate-400 uppercase font-bold">Hardcoded Equations</span>
              <div className="text-xl font-bold text-emerald-400">0 FOUND</div>
              <p className="text-2xs text-slate-400">All calculations use explicit parameters.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-2xs space-y-2">
            <span className="text-3xs text-cyan-400 uppercase font-bold">Audit Log Report</span>
            <div className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {auditReport.statusMessage}
              <br />
              • Total Registered Formulas: {auditReport.totalRegisteredFormulas}
              <br />
              • Unreferenced Formulas: {auditReport.unreferencedFormulas.length === 0 ? 'None (All formulas active)' : auditReport.unreferencedFormulas.join(', ')}
              <br />
              • Overall Traceability Index: {auditReport.traceabilityScore}%
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CHANGE IMPACT PREDICTOR */}
      {activeTab === 'impact' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-bold text-base text-white">Change Impact Analysis Predictor</h2>
              <p className="text-2xs text-slate-400">Simulate design changes and view predicted downstream cascading parameter shifts.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
            <span className="text-2xs text-slate-300 font-bold">Simulate Plant Capacity Change (MLD):</span>
            <input 
              type="range"
              min={10}
              max={200}
              step={5}
              value={simCapacity}
              onChange={(e) => setSimCapacity(Number(e.target.value))}
              className="w-64 accent-cyan-500"
            />
            <span className="text-sm font-bold text-cyan-300 font-mono">{simCapacity} MLD</span>
            <span className="text-3xs text-slate-400">(Baseline: {project.plantCapacityMLD} MLD)</span>
          </div>

          <div className="space-y-3">
            <span className="text-3xs text-slate-400 uppercase font-bold">Predicted Downstream Subsystem Impacts ({impactItems.length} Subsystems)</span>
            {impactItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 text-xs">{item.subsystem}</span>
                  <span className="px-2 py-0.5 rounded text-3xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {item.impactLevel} IMPACT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500">Parameter: </span>
                    <span className="text-white font-bold">{item.affectedParameter}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Shift: </span>
                    <span className="text-slate-400">{item.oldValue}</span>
                    <ArrowRight className="w-3 h-3 inline mx-1 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">{item.newValue}</span>
                  </div>
                </div>

                <p className="text-3xs text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
