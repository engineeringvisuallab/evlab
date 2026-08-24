/**
 * EV Software Core - Datasets & Revision Lineage Explorer
 * Inspect managed datasets, immutable revision histories, cryptographic SHA-256 checksums,
 * schema definitions, and payload payloads.
 */

import React, { useState } from 'react';
import {
  Database,
  GitBranch,
  GitCommit,
  Clock,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  HardDrive,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { Dataset, DatasetRevision } from '../../types/dataset';
import { Badge } from '../common/Badge';

export const DatasetsView: React.FC = () => {
  const { datasets, revisions, activeProject } = useCore();

  const projectDatasets = datasets.filter(
    (d) => !activeProject || d.projectId === activeProject.projectId
  );

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    projectDatasets[0]?.datasetId || ''
  );
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);

  const selectedDataset = datasets.find((d) => d.datasetId === selectedDatasetId);
  const datasetRevisions = revisions
    .filter((r) => r.datasetId === selectedDatasetId)
    .sort((a, b) => b.revisionNumber - a.revisionNumber);

  const activeRevision = selectedRevisionId
    ? datasetRevisions.find((r) => r.revisionId === selectedRevisionId)
    : datasetRevisions[0];

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedChecksum(text);
    setTimeout(() => setCopiedChecksum(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Dataset Metadata & Revision Lineage</h1>
            <Badge variant="primary">{projectDatasets.length} Datasets in Project</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Core tracks metadata and immutable revision lineage. Revisions are permanent snapshots with verified SHA-256 signatures.
          </p>
        </div>
      </div>

      {/* Main Split: Datasets List & Lineage Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Datasets List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Project Datasets
          </div>

          <div className="space-y-2">
            {projectDatasets.map((ds) => {
              const isSelected = ds.datasetId === selectedDatasetId;
              return (
                <div
                  key={ds.datasetId}
                  onClick={() => {
                    setSelectedDatasetId(ds.datasetId);
                    setSelectedRevisionId(null);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate">{ds.name}</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      Rev #{ds.currentRevisionNumber}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {ds.description || 'Core-managed engineering dataset.'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <span>Owner: {ds.ownerApplicationId.replace('app-', '')}</span>
                    <span>{ds.datasetType}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Revision History & Payload Explorer */}
        {selectedDataset ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Dataset Details Header Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-blue-400">
                    DATASET ID: {selectedDataset.datasetId}
                  </span>
                  <h2 className="text-base font-bold text-slate-100 mt-0.5">{selectedDataset.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="primary">{selectedDataset.datasetType}</Badge>
                  <Badge variant="success">Current Rev #{selectedDataset.currentRevisionNumber}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Owner Sibling App</span>
                  <span className="font-mono font-semibold text-slate-200">{selectedDataset.ownerApplicationId}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">CRS Coordinate Sys</span>
                  <span className="font-mono font-semibold text-cyan-400">{(selectedDataset as any).coordinateSystem || 'EPSG:3857'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Engineering Units</span>
                  <span className="font-mono font-semibold text-slate-200">{(selectedDataset as any).units || 'metric (m, mm)'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Total Revisions</span>
                  <span className="font-mono font-semibold text-emerald-400">{datasetRevisions.length} Snapshots</span>
                </div>
              </div>
            </div>

            {/* Revision Lineage Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-200">Revision History Lineage</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Immutable Graph</span>
              </div>

              <div className="space-y-2">
                {datasetRevisions.map((rev) => {
                  const isRevSelected = activeRevision?.revisionId === rev.revisionId;

                  return (
                    <div
                      key={rev.revisionId}
                      onClick={() => setSelectedRevisionId(rev.revisionId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isRevSelected
                          ? 'bg-slate-950 border-blue-500 ring-1 ring-blue-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isRevSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <GitCommit className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">Revision #{rev.revisionNumber}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({rev.revisionId})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{rev.changeSummary || 'Revision committed'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-auto">
                        <div className="text-right font-mono text-[10px]">
                          <div>{rev.createdBy}</div>
                          <div>{new Date(rev.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(rev.payloadChecksum);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-mono text-[10px] text-slate-300 transition-colors"
                          title="Copy SHA-256 Checksum"
                        >
                          {copiedChecksum === rev.payloadChecksum ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{rev.payloadChecksum.slice(0, 8)}...</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Revision Payload Preview */}
            {activeRevision && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Revision #{activeRevision.revisionNumber} Payload Content
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Checksum: {activeRevision.payloadChecksum}
                  </span>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(activeRevision.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            Select a dataset to view its revision history and payload snapshots.
          </div>
        )}
      </div>
    </div>
  );
};
