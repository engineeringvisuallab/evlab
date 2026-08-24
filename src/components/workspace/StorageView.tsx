/**
 * EV Software Core - Storage Abstraction Explorer
 * Manages raw files, binary CAD drawings, GIS shapefile packages, and computation assets
 * with SHA-256 integrity verification.
 */

import React, { useState } from 'react';
import {
  HardDrive,
  Upload,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Trash2,
  FileText,
  FileArchive,
  Image,
  Cpu,
  Cloud,
  ArrowRight,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { FileReference } from '../../types/storage';
import { Badge } from '../common/Badge';

export const StorageView: React.FC<{ onNavigateDrive?: () => void }> = ({ onNavigateDrive }) => {
  const { files, uploadFileReference, activeProject, activeProjectId } = useCore();

  const projectStorage = files.filter(
    (s) => !activeProjectId || s.projectId === activeProjectId
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSim = () => {
    if (!activeProject) return;
    setIsSimulatingUpload(true);
    setTimeout(() => {
      uploadFileReference({
        projectId: activeProject.projectId,
        name: `Trunk_Alignment_LIDAR_Cloud_${Date.now().toString(36).slice(-4)}.las`,
        mimeType: 'application/octet-stream',
        sizeBytes: 1024 * 1024 * 14.8,
        storageProvider: 's3_compatible',
        tags: ['geospatial', 'lidar', 'point_cloud'],
      });
      setIsSimulatingUpload(false);
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Storage Abstraction Engine</h1>
            <Badge variant="primary">{projectStorage.length} Managed Files</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Decoupled file and object storage provider supporting local, S3, or GCS buckets with cryptographic checksums.
          </p>
        </div>

        <button
          onClick={handleUploadSim}
          disabled={isSimulatingUpload}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          {isSimulatingUpload ? 'Uploading Object...' : 'Upload Engineering Asset'}
        </button>
      </div>

      {/* Google Drive Integration Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100">Google Drive Cloud Storage Bridge Active</h3>
            <p className="text-[11px] text-slate-400">
              Export and import datasets, pipeline geometry revisions, and project manifests directly with Google Drive.
            </p>
          </div>
        </div>
        {onNavigateDrive && (
          <button
            onClick={onNavigateDrive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shrink-0 transition-colors shadow"
          >
            <span>Open Drive Bridge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Storage Files Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>Project Storage Assets ({activeProject?.code || 'All Projects'})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Total Size: {(projectStorage.reduce((acc, f) => acc + f.sizeBytes, 0) / (1024 * 1024)).toFixed(1)} MB
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {projectStorage.map((obj) => (
            <div
              key={obj.fileId}
              className="p-4 hover:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 shrink-0">
                  {obj.name.endsWith('.dwg') || obj.name.endsWith('.dxf') ? (
                    <FileCode className="w-4 h-4 text-emerald-400" />
                  ) : obj.name.endsWith('.geojson') || obj.name.endsWith('.las') ? (
                    <FileArchive className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="font-semibold text-slate-200 text-sm">{obj.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                    <span>{(obj.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{obj.mimeType}</span>
                    <span>•</span>
                    <span>Provider: {obj.storageProvider}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[10px]">
                <button
                  onClick={() => handleCopy(obj.checksumSha256)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                  title="Copy SHA-256 Signature"
                >
                  {copiedId === obj.checksumSha256 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>SHA-256: {obj.checksumSha256.slice(0, 10)}...</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
