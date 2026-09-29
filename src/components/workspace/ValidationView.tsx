/**
 * EV Software Core - Validation Center
 * Executes two-tier validation: Technical (schema, units, CRS, nullability)
 * and Engineering (flow velocity, minimum cover depth, pipe slope, hydraulic constraints).
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Filter,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { ValidationResult } from '../../types/validation';
import { ValidationService } from '../../core/services/validationService';
import { Badge } from '../common/Badge';

export const ValidationView: React.FC = () => {
  const { datasets, revisions, transfers, activeProject } = useCore();

  const [selectedTargetType, setSelectedTargetType] = useState<'dataset' | 'transfer'>('dataset');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    datasets[0]?.datasetId || ''
  );
  const [lastValidationResult, setLastValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const handleRunValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      if (selectedTargetType === 'dataset') {
        const ds = datasets.find((d) => d.datasetId === selectedTargetId);
        const latestRev = revisions.find((r) => r.datasetId === selectedTargetId);
        if (ds && latestRev) {
          const res = ValidationService.validateDataset(ds, latestRev.payload);
          setLastValidationResult(res);
        }
      } else {
        const trf = transfers.find((t) => t.transferId === selectedTargetId);
        if (trf) {
          const res = ValidationService.validateTransfer(trf);
          setLastValidationResult(res);
        }
      }
      setIsValidating(false);
    }, 400);
  };

  const BUILTIN_RULES = [
    {
      id: 'TECH-001',
      category: 'technical',
      name: 'Schema Definition & Entity IDs',
      description: 'Verifies entity structure, unique ID integrity, and non-null mandatory fields.',
      severity: 'error',
    },
    {
      id: 'TECH-002',
      category: 'technical',
      name: 'CRS Coordinate System Consistency',
      description: 'Ensures spatial coordinate bounds conform to declared EPSG projection system.',
      severity: 'error',
    },
    {
      id: 'TECH-003',
      category: 'technical',
      name: 'Standardized Engineering Units',
      description: 'Validates metric alignment (diameters in mm, lengths/elevations in m, pressure in bar).',
      severity: 'warning',
    },
    {
      id: 'ENG-101',
      category: 'engineering',
      name: 'Hydraulic Velocity Limit (0.6 - 3.0 m/s)',
      description: 'Checks that pipeline sizing maintains self-cleansing velocity without scouring.',
      severity: 'warning',
    },
    {
      id: 'ENG-102',
      category: 'engineering',
      name: 'Minimum Civil Cover Depth (≥1.2m)',
      description: 'Verifies pipeline invert elevation provides adequate freeze and traffic load protection.',
      severity: 'warning',
    },
    {
      id: 'ENG-103',
      category: 'engineering',
      name: 'Working Pressure Rating Margin (≥1.5x)',
      description: 'Confirms nominal pipe pressure rating accommodates surge and transient pressures.',
      severity: 'info',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Two-Tier Validation Center</h1>
            <Badge variant="success">Technical + Engineering Rules</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Core enforces technical integrity (schema, CRS, units) and engineering rules before any revision can be committed.
          </p>
        </div>
      </div>

      {/* Validation Test Runner Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">Interactive Validation Runner</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Validation Engine v1.0</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Category</label>
            <select
              value={selectedTargetType}
              onChange={(e) => {
                const type = e.target.value as any;
                setSelectedTargetType(type);
                if (type === 'dataset') {
                  setSelectedTargetId(datasets[0]?.datasetId || '');
                } else {
                  setSelectedTargetId(transfers[0]?.transferId || '');
                }
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
            >
              <option value="dataset">Managed Dataset</option>
              <option value="transfer">Transfer Package</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Select Target Entity</label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
            >
              {selectedTargetType === 'dataset'
                ? datasets.map((d) => (
                    <option key={d.datasetId} value={d.datasetId}>
                      {d.name} ({d.datasetId})
                    </option>
                  ))
                : transfers.map((t) => (
                    <option key={t.transferId} value={t.transferId}>
                      {t.transferId} ({t.package.changeSummary.slice(0, 30)}...)
                    </option>
                  ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunValidation}
              disabled={isValidating}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              {isValidating ? 'Executing Rules...' : 'Execute Validation'}
            </button>
          </div>
        </div>

        {/* Validation Output */}
        {lastValidationResult && (
          <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastValidationResult.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : lastValidationResult.status === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-xs font-bold text-slate-100 uppercase">
                  VALIDATION {lastValidationResult.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({lastValidationResult.executionTimeMs}ms)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-mono font-medium">
                  {lastValidationResult.passedRuleCount} Passed
                </span>
                <span>•</span>
                <span className="text-rose-400 font-mono font-medium">
                  {lastValidationResult.errors.length} Errors
                </span>
                <span>•</span>
                <span className="text-amber-400 font-mono font-medium">
                  {lastValidationResult.warnings.length} Warnings
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              {lastValidationResult.summary}
            </p>

            <div className="space-y-2">
              {lastValidationResult.errors.map((err, idx) => (
                <div
                  key={`err-${idx}`}
                  className="p-3 rounded-xl border text-xs flex items-start gap-3 bg-rose-950/40 border-rose-800/80 text-rose-300"
                >
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-mono text-[10px] uppercase">
                        [{err.code}] {err.field || 'General Field'}
                      </span>
                      {err.entityId && <span className="font-mono text-[10px] opacity-80">{err.entityId}</span>}
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{err.message}</p>
                  </div>
                </div>
              ))}

              {lastValidationResult.warnings.map((warn, idx) => (
                <div
                  key={`warn-${idx}`}
                  className="p-3 rounded-xl border text-xs flex items-start gap-3 bg-amber-950/40 border-amber-800/80 text-amber-300"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-mono text-[10px] uppercase">
                        [{warn.code}] {warn.field || 'Advisory'}
                      </span>
                      {warn.entityId && <span className="font-mono text-[10px] opacity-80">{warn.entityId}</span>}
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{warn.message}</p>
                    {warn.recommendation && (
                      <p className="text-[10px] opacity-80 italic">Recommendation: {warn.recommendation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rules Catalog */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Active Validation Rule Catalog
          </h2>
          <span className="text-xs text-slate-400 font-mono">{BUILTIN_RULES.length} Rules Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {BUILTIN_RULES.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-400">{rule.id}</span>
                <Badge
                  variant={rule.severity === 'error' ? 'danger' : rule.severity === 'warning' ? 'warning' : 'info'}
                  size="sm"
                >
                  {rule.category} • {rule.severity}
                </Badge>
              </div>
              <h3 className="font-semibold text-slate-100 text-xs">{rule.name}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
