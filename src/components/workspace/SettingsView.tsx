/**
 * EV Software Core - Settings & Ecosystem Configuration
 * Configure organization details, Core API routing, Storage Provider, and default coordinate systems.
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  HardDrive,
  Globe2,
  Check,
  Server,
  Building,
  RotateCcw,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { Badge } from '../common/Badge';

export const SettingsView: React.FC = () => {
  const { organization, resetToInitialState } = useCore();
  const [orgName, setOrgName] = useState(organization.name);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">EVSoftware Space Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Space infrastructure configuration, organization metadata, and storage engine adapters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-200">Organization & Tenancy</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Organization Slug</label>
              <input
                type="text"
                disabled
                value={organization.slug}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* API & Infrastructure */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Server className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200">Core Engine API & Storage Provider</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Core API Protocol</label>
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                v1 (RESTful + Reactive Subscriptions)
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Storage Abstraction Tier</label>
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                S3 / Cloud Storage Compatible with SHA-256
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Default CRS Coordinate System</label>
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                EPSG:3857 (WGS 84 / Pseudo-Mercator)
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Audit Log Mode</label>
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300">
                Tamper-Evident SHA-256 Hash Chain
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetToInitialState}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Seed Initial State
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
