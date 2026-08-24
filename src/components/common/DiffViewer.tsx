/**
 * EV Software Core - Structural Diff Viewer
 * Renders side-by-side field-level comparison for transfers, preventing silent mutations.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  ArrowRight,
  GitMerge,
  ShieldAlert,
  Check,
  RotateCcw,
  Edit3,
} from 'lucide-react';
import {
  ConflictResolutionStrategy,
  ConflictStatus,
  ThreeWayDiffReport,
  TransferDiff,
} from '../../types/transfer';

interface DiffViewerProps {
  diff: TransferDiff;
  sourceAppName?: string;
  destAppName?: string;
  onResolveConflict?: (
    entityId: string,
    fieldName: string,
    strategy: ConflictResolutionStrategy,
    manualValue?: unknown
  ) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diff,
  sourceAppName = 'Source Application',
  destAppName = 'Destination Application',
  onResolveConflict,
}) => {
  const [manualInputs, setManualInputs] = useState<Record<string, string>>({});
  const [editingManualKey, setEditingManualKey] = useState<string | null>(null);

  const report = diff.threeWayReport;

  const handleManualSubmit = (entityId: string, fieldName: string) => {
    const key = `${entityId}-${fieldName}`;
    const rawVal = manualInputs[key];
    if (rawVal === undefined || rawVal.trim() === '') return;
    
    // Parse numeric if possible
    const parsedVal = !isNaN(Number(rawVal)) ? Number(rawVal) : rawVal;
    if (onResolveConflict) {
      onResolveConflict(entityId, fieldName, 'MANUAL_RESOLVE', parsedVal);
    }
    setEditingManualKey(null);
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Exchange Diff:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-mono font-semibold border border-emerald-800/80">
            +{diff.addedCount} Added
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 font-mono font-semibold border border-blue-800/80">
            ~{diff.modifiedCount} Modified
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 font-mono font-semibold border border-rose-800/80">
            -{diff.deletedCount} Deleted
          </span>
        </div>

        {report && report.conflictsCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-800/80 text-amber-300 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{report.conflictsCount} Concurrent Conflict(s) Require Resolution</span>
          </div>
        ) : diff.hasConflicts ? (
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>Unresolved Conflicts Detected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Clean Non-Conflicting Diff</span>
          </div>
        )}
      </div>

      {/* 3-Way Detailed Table if available */}
      {report && report.entities.length > 0 ? (
        <div className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
              Three-Way Comparison Matrix (BASE vs CURRENT GIS vs INCOMING CAD)
            </span>
            <span className="text-[10px] font-mono text-slate-500">{report.totalEntities} entities analyzed</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {report.entities.map((entity) => {
              const hasFieldChanges = entity.fieldDiffs.length > 0;
              if (!hasFieldChanges && entity.changeType === 'unchanged') return null;

              return (
                <div
                  key={entity.entityId}
                  className={`rounded-xl border p-3.5 space-y-3 text-xs ${
                    entity.hasConflict
                      ? 'bg-amber-950/10 border-amber-800/80 ring-1 ring-amber-500/20'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {entity.hasConflict ? (
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="font-bold text-slate-200">{entity.entityName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({entity.entityId})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                          entity.hasConflict
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : entity.changeType === 'added'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {entity.hasConflict ? '3-WAY CONFLICT' : entity.changeType}
                      </span>
                    </div>
                  </div>

                  {/* Field diffs comparison table */}
                  {entity.fieldDiffs.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-[11px] font-mono border-collapse">
                        <thead>
                          <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                            <th className="p-2">Property</th>
                            <th className="p-2 text-slate-500">Base Rev</th>
                            <th className="p-2 text-blue-400">Current GIS</th>
                            <th className="p-2 text-emerald-400">Incoming CAD</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-right">Resolution Decision</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {entity.fieldDiffs.map((f) => {
                            const inputKey = `${entity.entityId}-${f.fieldName}`;
                            const isEditingManual = editingManualKey === inputKey;

                            return (
                              <tr
                                key={f.fieldName}
                                className={`hover:bg-slate-900/50 transition-colors ${
                                  f.hasConflict ? 'bg-amber-950/20' : ''
                                }`}
                              >
                                <td className="p-2 font-bold text-slate-300">{f.fieldName}</td>
                                <td className="p-2 text-slate-400">
                                  {f.baseValue !== null && f.baseValue !== undefined
                                    ? typeof f.baseValue === 'object'
                                      ? JSON.stringify(f.baseValue)
                                      : String(f.baseValue)
                                    : '—'}
                                </td>
                                <td className="p-2 text-blue-300 font-semibold">
                                  {f.currentTargetValue !== null && f.currentTargetValue !== undefined
                                    ? typeof f.currentTargetValue === 'object'
                                      ? JSON.stringify(f.currentTargetValue)
                                      : String(f.currentTargetValue)
                                    : '—'}
                                </td>
                                <td className="p-2 text-emerald-300 font-semibold">
                                  {f.incomingSourceValue !== null && f.incomingSourceValue !== undefined
                                    ? typeof f.incomingSourceValue === 'object'
                                      ? JSON.stringify(f.incomingSourceValue)
                                      : String(f.incomingSourceValue)
                                    : '—'}
                                </td>
                                <td className="p-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      f.conflictStatus === 'THREE_WAY_CONFLICT'
                                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                        : f.conflictStatus === 'SOURCE_MODIFIED'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : f.conflictStatus === 'TARGET_MODIFIED'
                                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {f.conflictStatus}
                                  </span>
                                </td>
                                <td className="p-2 text-right">
                                  {onResolveConflict ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      {f.resolutionStrategy ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                                            {f.resolutionStrategy}: {String(f.resolvedValue)}
                                          </span>
                                          <button
                                            onClick={() =>
                                              onResolveConflict(
                                                entity.entityId,
                                                f.fieldName,
                                                'ACCEPT_INCOMING'
                                              )
                                            }
                                            className="p-1 text-slate-400 hover:text-slate-200"
                                            title="Reset resolution"
                                          >
                                            <RotateCcw className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ) : isEditingManual ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            value={manualInputs[inputKey] ?? String(f.incomingSourceValue ?? '')}
                                            onChange={(e) =>
                                              setManualInputs({
                                                ...manualInputs,
                                                [inputKey]: e.target.value,
                                              })
                                            }
                                            className="w-20 px-1.5 py-0.5 bg-slate-900 border border-cyan-500 rounded text-slate-100 text-[10px]"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => handleManualSubmit(entity.entityId, f.fieldName)}
                                            className="px-1.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px]"
                                          >
                                            Set
                                          </button>
                                          <button
                                            onClick={() => setEditingManualKey(null)}
                                            className="px-1 py-0.5 text-slate-400 hover:text-slate-200 text-[10px]"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() =>
                                              onResolveConflict(
                                                entity.entityId,
                                                f.fieldName,
                                                'KEEP_CURRENT'
                                              )
                                            }
                                            className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 text-[10px] font-sans font-medium"
                                            title="Retain Current GIS Value"
                                          >
                                            Keep GIS
                                          </button>
                                          <button
                                            onClick={() =>
                                              onResolveConflict(
                                                entity.entityId,
                                                f.fieldName,
                                                'ACCEPT_INCOMING'
                                              )
                                            }
                                            className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-[10px] font-sans font-medium"
                                            title="Accept Incoming CAD Value"
                                          >
                                            Accept CAD
                                          </button>
                                          <button
                                            onClick={() => {
                                              setManualInputs({
                                                ...manualInputs,
                                                [inputKey]: String(f.incomingSourceValue ?? ''),
                                              });
                                              setEditingManualKey(inputKey);
                                            }}
                                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-sans"
                                            title="Custom Manual Resolution"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 text-[10px]">
                                      {f.resolutionStrategy || 'Pending Review'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fallback standard items breakdown */
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {diff.items.map((item) => (
            <div
              key={item.entityId}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  {item.changeType === 'added' && <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  {item.changeType === 'modified' && <AlertCircle className="w-3.5 h-3.5 text-blue-400" />}
                  {item.changeType === 'deleted' && <MinusCircle className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{item.entityName}</span>
                  <span className="text-[10px] font-mono text-slate-400">({item.entityId})</span>
                </div>
                <span
                  className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                    item.changeType === 'added'
                      ? 'bg-emerald-950 text-emerald-400'
                      : item.changeType === 'modified'
                      ? 'bg-blue-950 text-blue-400'
                      : 'bg-rose-950 text-rose-400'
                  }`}
                >
                  {item.changeType}
                </span>
              </div>

              {/* Field differences */}
              {item.fieldChanges.length > 0 && (
                <div className="bg-slate-950 rounded p-2 border border-slate-800/80 space-y-1.5">
                  {item.fieldChanges.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 font-semibold">{f.fieldName}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 line-through">
                          {String(f.originalValue ?? 'null')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-emerald-400 font-bold">
                          {String(f.incomingValue ?? 'null')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

