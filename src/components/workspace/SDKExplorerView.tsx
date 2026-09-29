/**
 * EV Software Core - EV Application SDK Explorer
 * Interactive developer documentation, TypeScript signatures, and code examples
 * for building sibling engineering applications with useEVAppSDK.
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  Globe2,
  Database,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const SDKExplorerView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CODE_SNIPPETS = [
    {
      key: 'sdk-hook',
      title: '1. Connecting Sibling App with useEVAppSDK',
      description: 'Provides application context, active project binding, and scoped Core client.',
      language: 'typescript',
      code: `import { useEVAppSDK } from '@evlab/core-sdk';

export const MyEngineeringApp = () => {
  const { sdk, activeProject, currentUser } = useEVAppSDK('app-ev-wtp', '1.0.0');

  // Fetch datasets belonging to the active project context
  const loadDatasets = async () => {
    if (!activeProject) return;
    const datasets = await sdk.getDatasetsByProject(activeProject.projectId);
    console.log('Project Datasets:', datasets);
  };

  return <div>Active Project: {activeProject?.name}</div>;
};`,
    },
    {
      key: 'sdk-transfer',
      title: '2. Initiating a Controlled Data Transfer',
      description: 'Packages domain models into a structured transfer payload with declared CRS and units.',
      language: 'typescript',
      code: `const handleExportToCAD = async () => {
  const transfer = await sdk.initiateTransfer({
    projectId: activeProject.projectId,
    sourceDatasetId: 'ds-gis-trunk-mains',
    destinationAppId: 'app-ev-mini-cad',
    changeSummary: 'Exported 12 trunk pipeline entities for road crossing alignment review.',
    payload: {
      crs: { code: 'EPSG:3857', name: 'WGS 84 / Pseudo-Mercator', unit: 'meters' },
      layerName: 'Trunk_Water_Mains',
      elements: myPipesArray,
    },
    units: 'meters',
    crs: 'EPSG:3857',
  });

  // Advance state from 'prepared' to 'sent'
  await sdk.updateTransferState(transfer.transferId, 'sent');
};`,
    },
    {
      key: 'sdk-events',
      title: '3. Real-Time Core Event Subscriptions',
      description: 'Receive instantaneous notifications when a new revision is committed without direct polling.',
      language: 'typescript',
      code: `useEffect(() => {
  // Subscribe to Core revision and transfer events
  const unsubscribe = sdk.subscribe('transfer:committed', (eventPayload) => {
    console.log('New Revision committed in Core:', eventPayload);
    // Reload local application geometry from the latest immutable snapshot
    reloadLatestRevision(eventPayload.datasetId);
  });

  return () => unsubscribe();
}, [sdk]);`,
    },
    {
      key: 'sdk-manifest',
      title: '4. Declaring Application Contract Manifest',
      description: 'Machine-readable schema registered to Core Application Registry.',
      language: 'typescript',
      code: `import { ApplicationManifest } from '@evlab/types';

export const MANIFEST: ApplicationManifest = {
  appId: 'app-ev-waterflow',
  name: 'EV WaterFlow',
  slug: 'ev-waterflow',
  version: '1.0.0',
  coreApiVersion: 'v1',
  description: '1D/2D hydraulic network solver for transient surges and steady-state pressure heads.',
  category: 'hydraulics',
  entryRoute: '/apps/waterflow',
  iconName: 'Activity',
  capabilities: ['hydraulic_modeling', 'simulation'],
  supportedProjectTypes: ['water_supply', 'urban_drainage'],
  requiredServices: ['data_exchange', 'validation_engine', 'audit_logger'],
  permissions: ['dataset:read', 'dataset:create'],
  releaseStatus: 'ga',
  author: 'EVLab Hydraulics Engineering Group',
  isSiblingApp: true,
};`,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">EVSoftware Space SDK & API Explorer</h1>
            <Badge variant="primary">TypeScript SDK v1.0.0</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Standard client library and typed SDK for building, running, and integrating software applications directly inside EVSoftware Space.
          </p>
        </div>
      </div>

      {/* Snippets */}
      <div className="space-y-5">
        {CODE_SNIPPETS.map((snippet) => (
          <div key={snippet.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">{snippet.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{snippet.description}</p>
              </div>

              <button
                onClick={() => handleCopy(snippet.code, snippet.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors font-medium shrink-0"
              >
                {copiedKey === snippet.key ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              {snippet.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
