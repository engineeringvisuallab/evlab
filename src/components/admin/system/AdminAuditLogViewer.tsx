import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../../types/admin';
import { AdminAuthService } from '../../../services/adminAuthService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  History,
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  Filter,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AdminAuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await AdminAuthService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = moduleFilter === 'all' || log.module.toLowerCase() === moduleFilter.toLowerCase();

    return matchesQuery && matchesModule;
  });

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('login successful')) return <Badge variant="emerald" size="sm">Auth Success</Badge>;
    if (act.includes('failed') || act.includes('locked')) return <Badge variant="rose" size="sm">Security Event</Badge>;
    if (act.includes('created')) return <Badge variant="cyan" size="sm">Created</Badge>;
    if (act.includes('updated') || act.includes('changed')) return <Badge variant="amber" size="sm">Updated</Badge>;
    if (act.includes('deleted')) return <Badge variant="rose" size="sm">Deleted</Badge>;
    return <Badge variant="slate" size="sm">{action}</Badge>;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>System Audit Trail & Security Events</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authoritative, unalterable log of authentication attempts, database changes, and Google Sheets sync operations.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2 text-xs border-slate-700">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, Admin ID, or details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Modules</option>
            <option value="auth">Auth & Security</option>
            <option value="usermanagement">User Management</option>
            <option value="settings">Settings</option>
            <option value="world">UELE World</option>
            <option value="facilities">UELE Facilities</option>
            <option value="gislayer">GIS Layers</option>
            <option value="model3d">3D Models</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Loading Audit Logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No audit log entries matching search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Admin ID / User</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        {getActionBadge(log.action)}
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-cyan-300">
                      {log.admin_id}
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-[10px] uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {log.module}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>

                    <td className="p-4 font-mono text-slate-500 text-[10px]">
                      {log.ip_or_context || 'EVLab API'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
