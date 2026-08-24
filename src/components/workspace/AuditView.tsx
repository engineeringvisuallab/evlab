/**
 * EV Software Core - Immutable Audit Trail
 * Provides tamper-evident chronological event log tracking actors,
 * actions, entity snapshots, and cryptographic signatures.
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCode,
  ArrowRightLeft,
  Database,
  Grid,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { AuditLogEntry } from '../../types/audit';
import { Badge } from '../common/Badge';

export const AuditView: React.FC = () => {
  const { auditLogs, activeProject } = useCore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(auditLogs[0] || null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedActionFilter === 'all' || log.action.toLowerCase().includes(selectedActionFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Tamper-Evident Audit Trail</h1>
            <Badge variant="primary">{auditLogs.length} Immutable Entries</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically linked record of every project creation, dataset revision, transfer state change, and validation event.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, description, or actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
          >
            <option value="all">All Actions</option>
            <option value="transfer">Transfers</option>
            <option value="revision">Revisions</option>
            <option value="dataset">Datasets</option>
            <option value="app">Apps</option>
            <option value="project">Projects</option>
          </select>
        </div>
      </div>

      {/* Main Split: Audit Log List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Log Table */}
        <div className="lg:col-span-7 space-y-2">
          {filteredLogs.map((log) => {
            const isSelected = selectedLog?.auditId === log.auditId;

            return (
              <div
                key={log.auditId}
                onClick={() => setSelectedLog(log)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="font-mono text-blue-400 font-semibold">{log.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-mono text-[10px]">{log.entityId}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-1 leading-relaxed">
                  {log.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>{log.userName}</span>
                  </div>
                  {log.applicationName && (
                    <span className="font-mono text-[10px] text-slate-400">Via: {log.applicationName}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Log Detail */}
        {selectedLog ? (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Audit Proof Details</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{selectedLog.auditId}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Action</span>
                <div className="font-mono font-bold text-blue-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {selectedLog.action}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Description</span>
                <div className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed text-[11px]">
                  {selectedLog.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Actor / User</span>
                  <span className="text-slate-200 font-medium">{selectedLog.userName}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Application Context</span>
                  <span className="text-slate-200 font-medium">{selectedLog.applicationName || 'Core System'}</span>
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-blue-400" /> Event Metadata
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-56">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            Select an audit entry to inspect cryptographic details and payload state.
          </div>
        )}
      </div>
    </div>
  );
};
