/**
 * EV Software Core - Application Registry & Manifest Explorer
 * Central application registry enabling future engineering applications
 * to register dynamically following the Application Contract.
 */

import React, { useState } from 'react';
import {
  Grid,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Globe2,
  Compass,
  Droplets,
  Layers,
  Calculator,
  Activity,
  FileSpreadsheet,
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
  X,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { ApplicationManifest, ApplicationRegistrationPayload } from '../../types/application';
import { Badge } from '../common/Badge';

export const RegistryView: React.FC = () => {
  const { applications, registerApplication } = useCore();

  const [selectedApp, setSelectedApp] = useState<ApplicationManifest>(applications[0]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New App Form
  const [newAppId, setNewAppId] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newAppSlug, setNewAppSlug] = useState('');
  const [newAppVersion, setNewAppVersion] = useState('1.0.0');
  const [newAppCategory, setNewAppCategory] = useState<ApplicationManifest['category']>('utilities');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppRoute, setNewAppRoute] = useState('/apps/new-tool');
  const [errorText, setErrorText] = useState<string | null>(null);

  const appIconMap: Record<string, any> = {
    'app-ev-gis': Globe2,
    'app-ev-mini-cad': Compass,
    'app-ev-wtp': Droplets,
    'app-ev-stp': Layers,
    'app-ev-boq': Calculator,
    'app-ev-waterflow': Activity,
    'app-ev-sheet': FileSpreadsheet,
    'app-ev-ai': Sparkles,
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    try {
      const payload: ApplicationRegistrationPayload = {
        manifest: {
          appId: newAppId || `app-ev-${newAppSlug}`,
          name: newAppName,
          slug: newAppSlug,
          version: newAppVersion,
          coreApiVersion: 'v1',
          description: newAppDesc,
          category: newAppCategory,
          entryRoute: newAppRoute,
          iconName: 'Cpu',
          capabilities: ['reporting'],
          supportedProjectTypes: ['general', 'water_supply'],
          requiredServices: ['data_exchange', 'validation_engine', 'audit_logger'],
          permissions: ['dataset:read', 'dataset:create'],
          releaseStatus: 'preview',
          author: 'EVLab Engineering Contributor',
          isSiblingApp: true,
        },
      };

      const registered = registerApplication(payload);
      setSelectedApp(registered);
      setIsRegisterModalOpen(false);
      setNewAppId('');
      setNewAppName('');
      setNewAppSlug('');
      setNewAppDesc('');
    } catch (err: any) {
      setErrorText(err.message);
    }
  };

  const Icon = appIconMap[selectedApp.appId] || Cpu;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Application Registry & Manifests</h1>
            <Badge variant="primary">{applications.length} Registered Sibling Apps</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every EV Software application registers a machine-readable manifest adhering to the domain-neutral Application Contract.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Sibling Application
        </button>
      </div>

      {/* Main Split: Application List & Manifest Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Applications List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Registered Applications
          </div>

          <div className="space-y-2">
            {applications.map((app) => {
              const AppIcon = appIconMap[app.appId] || Cpu;
              const isSelected = app.appId === selectedApp.appId;

              return (
                <div
                  key={app.appId}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`p-2 rounded-lg border ${
                      isSelected ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <AppIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-200">{app.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">v{app.version}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{app.description}</div>
                    </div>
                  </div>

                  <Badge variant={app.releaseStatus === 'ga' ? 'success' : 'primary'} size="sm">
                    {app.releaseStatus}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Manifest Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100">{selectedApp.name}</h2>
                  <Badge variant={selectedApp.releaseStatus === 'ga' ? 'success' : 'primary'}>
                    {selectedApp.releaseStatus}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  App ID: <span className="text-slate-300">{selectedApp.appId}</span> • Slug: <span className="text-slate-300">{selectedApp.slug}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Core API Compatibility</div>
              <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedApp.coreApiVersion} Compatible
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Application Overview
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {selectedApp.description}
            </p>
          </div>

          {/* Capabilities & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Declared Capabilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedApp.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Required Core Services
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedApp.requiredServices.map((srv) => (
                  <span
                    key={srv}
                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-300"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Raw JSON Manifest Inspector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                Raw Machine-Readable Manifest
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Contract Spec 1.0</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {JSON.stringify(selectedApp, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100">Register Sibling Application</h2>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorText && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {errorText}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Application Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EV Drainage Flow"
                  value={newAppName}
                  onChange={(e) => {
                    setNewAppName(e.target.value);
                    if (!newAppSlug) {
                      setNewAppSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="ev-drainage"
                    value={newAppSlug}
                    onChange={(e) => setNewAppSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Category</label>
                  <select
                    value={newAppCategory}
                    onChange={(e) => setNewAppCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="geospatial">Geospatial</option>
                    <option value="drafting_cad">CAD / Drafting</option>
                    <option value="process_engineering">Process Engineering</option>
                    <option value="hydraulics">Hydraulics</option>
                    <option value="cost_estimation">Cost Estimation</option>
                    <option value="data_calculation">Data Calculation</option>
                    <option value="ai_assistant">AI Assistant</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Engineering purpose and domain boundary of this sibling application..."
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition-all"
                >
                  Register Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
