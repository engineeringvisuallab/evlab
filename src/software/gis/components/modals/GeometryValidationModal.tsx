import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { validateGeometry } from '../../services/cadEngine';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export const GeometryValidationModal: React.FC = () => {
  const {
    project,
    activeLayerId,
    isGeometryValidationOpen,
    setIsGeometryValidationOpen,
    repairSelectedGeometries,
    setSelectedFeatureIds,
    zoomToFeatures,
  } = useGIS();

  const [selectedLayerId, setSelectedLayerId] = useState<string>(activeLayerId || project.layers[0]?.id || '');

  if (!isGeometryValidationOpen) return null;

  const targetLayer = project.layers.find((l) => l.id === selectedLayerId) || project.layers[0];

  const validationResults = targetLayer
    ? targetLayer.features.map((f) => {
        const val = validateGeometry(f.geometry);
        return { featureId: f.id, featureName: f.properties.name || f.properties.ID || f.id, val };
      })
    : [];

  const invalidResults = validationResults.filter((r) => r.val.status !== 'valid');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-cyan-400" size={18} />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Geometry Topology & Integrity Audit
            </h2>
          </div>
          <button
            onClick={() => setIsGeometryValidationOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 flex-1">
          {/* Target Layer Selector */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="font-semibold text-slate-200">Audit Target Layer:</label>
            <select
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {project.layers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.features.length} features)
                </option>
              ))}
            </select>
          </div>

          {/* Overall Status Banner */}
          {invalidResults.length === 0 ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-lg flex items-center gap-3 text-emerald-300">
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Topology Audit Passed</h4>
                <p className="text-[11px] text-emerald-400/80">
                  All {validationResults.length} features in layer "{targetLayer?.name}" pass geometric integrity checks. No self-intersections or unclosed rings detected.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-lg flex items-center justify-between gap-3 text-amber-300">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">
                    {invalidResults.length} Geometric Issue(s) Detected
                  </h4>
                  <p className="text-[11px] text-amber-400/80">
                    Self-intersecting polygon kinks or unclosed ring boundaries detected.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFeatureIds(invalidResults.map((r) => r.featureId));
                  repairSelectedGeometries();
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-md transition shrink-0"
              >
                <Wrench size={13} />
                <span>Auto-Repair All ({invalidResults.length})</span>
              </button>
            </div>
          )}

          {/* Validation Results List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">Audit Results Breakdown</h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="p-2.5">Feature</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Validation Findings</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {validationResults.map((r) => (
                    <tr key={r.featureId} className="hover:bg-slate-900/50 transition">
                      <td className="p-2.5 font-mono text-cyan-300 font-semibold">{r.featureName}</td>
                      <td className="p-2.5">
                        {r.val.status === 'valid' ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            VALID
                          </span>
                        ) : (
                          <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            INVALID
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {r.val.issues.length === 0 ? (
                          <span className="text-slate-500 italic">No topology errors</span>
                        ) : (
                          <ul className="list-disc list-inside text-rose-300 space-y-0.5 font-mono text-[10px]">
                            {r.val.issues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedFeatureIds([r.featureId]);
                            zoomToFeatures([r.featureId]);
                            setIsGeometryValidationOpen(false);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded text-[10px] font-medium transition"
                        >
                          Locate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsGeometryValidationOpen(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-1.5 rounded transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
