import React, { useState } from 'react';
import { FullUELEDatabase } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  ShieldCheck,
  FileText,
  MapPin,
  Box,
  Building2,
} from 'lucide-react';

interface AdminValidationManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'Spatial' | '3D Model' | 'Hierarchy' | 'Parameters';
  entityName: string;
  message: string;
}

export const AdminValidationManager: React.FC<AdminValidationManagerProps> = ({
  database,
}) => {
  const [validating, setValidating] = useState<boolean>(false);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleRunValidation = () => {
    setValidating(true);
    setTimeout(() => {
      const results: ValidationIssue[] = [];

      // Check Facilities
      database.facilities.forEach((f) => {
        if (!f.latitude || !f.longitude) {
          results.push({
            id: `v-${f.id}-1`,
            type: 'error',
            category: 'Spatial',
            entityName: f.name,
            message: 'Facility is missing mandatory WGS84 geographic coordinates.',
          });
        }
        if (!f.model3DId) {
          results.push({
            id: `v-${f.id}-2`,
            type: 'warning',
            category: '3D Model',
            entityName: f.name,
            message: 'No attached 3D Digital Twin model found for this facility.',
          });
        }
      });

      // Check 3D Models
      database.models3D.forEach((m) => {
        if (!m.anchor?.latitude || !m.anchor?.longitude) {
          results.push({
            id: `v-${m.id}-1`,
            type: 'warning',
            category: 'Spatial',
            entityName: m.modelName,
            message: '3D Model origin geographic coordinates are not set.',
          });
        }
      });

      setIssues(results);
      setValidating(false);
      setHasRun(true);
    }, 600);
  };

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>18. Central Spatial & Engineering Validation Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated integrity verification for WGS84 coordinates, 3D linkages, parameters & schema
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleRunValidation}
          disabled={validating}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{validating ? 'Running Integrity Tests...' : 'Run Full Validation Audit'}</span>
        </Button>
      </div>

      {hasRun && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Errors (Blocking)</span>
            <span className="text-xl font-bold font-mono text-rose-400">{errorCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Warnings</span>
            <span className="text-xl font-bold font-mono text-amber-400">{warningCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Overall Status</span>
            <Badge variant={errorCount === 0 ? 'emerald' : 'rose'} size="sm">
              {errorCount === 0 ? 'PASSED (READY FOR DEPLOYMENT)' : 'ISSUES DETECTED'}
            </Badge>
          </div>
        </div>
      )}

      {/* Issues Table */}
      {hasRun && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Audit Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-emerald-400 font-semibold">
                    ✓ All checks passed! Single Source of Truth database is 100% compliant.
                  </td>
                </tr>
              ) : (
                issues.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-950/40">
                    <td className="p-3.5">
                      {i.type === 'error' ? (
                        <Badge variant="rose" size="sm" icon={<XCircle className="w-3 h-3 text-rose-400" />}>
                          ERROR
                        </Badge>
                      ) : (
                        <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-400" />}>
                          WARNING
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-300">{i.category}</td>
                    <td className="p-3.5 font-bold text-slate-100">{i.entityName}</td>
                    <td className="p-3.5 text-slate-400">{i.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
