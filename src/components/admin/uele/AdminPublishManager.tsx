import React, { useState } from 'react';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Building2,
  Boxes,
  Cpu,
  Share2,
  Box,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface AdminPublishManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminPublishManager: React.FC<AdminPublishManagerProps> = ({
  database,
  onRefreshDatabase,
}) => {
  const [updating, setUpdating] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  const totalFacilities = database.facilities.length;
  const publishedFacilities = database.facilities.filter((f) => f.status === 'published').length;

  const totalModels = database.models3D.length;
  const publishedModels = database.models3D.filter((m) => m.status === 'published').length;

  const totalGIS = database.gisLayers.length;
  const publishedGIS = database.gisLayers.filter((g) => g.status === 'published').length;

  const handlePublishAll = async (entityType: any) => {
    setUpdating(true);
    try {
      setMsg(`Batch publishing all ${entityType} entities to Live...`);
      onRefreshDatabase();
    } catch (err: any) {
      setMsg(err?.message || 'Failed batch publish');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <span>17. Central Publish & Global Visibility Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit and publish objects across 2D Map, 3D Twin & Public Website views
          </p>
        </div>

        <Button
          variant="outline"
          onClick={onRefreshDatabase}
          className="gap-2 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Database</span>
        </Button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Facilities</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{publishedFacilities}</span>
            <span className="text-xs text-slate-500">/ {totalFacilities} Live</span>
          </div>
          <Badge variant="emerald" size="sm">
            {totalFacilities > 0 ? `${Math.round((publishedFacilities / totalFacilities) * 100)}% Live` : '0%'}
          </Badge>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">3D Models</span>
            <Box className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{publishedModels}</span>
            <span className="text-xs text-slate-500">/ {totalModels} Live</span>
          </div>
          <Badge variant="emerald" size="sm">
            {totalModels > 0 ? `${Math.round((publishedModels / totalModels) * 100)}% Live` : '0%'}
          </Badge>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">GIS Layers</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{publishedGIS}</span>
            <span className="text-xs text-slate-500">/ {totalGIS} Live</span>
          </div>
          <Badge variant="emerald" size="sm">
            {totalGIS > 0 ? `${Math.round((publishedGIS / totalGIS) * 100)}% Live` : '0%'}
          </Badge>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Total Entities</span>
            <Globe2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">
              {totalFacilities + totalModels + totalGIS + (database.components?.length || 0) + (database.networks?.length || 0)}
            </span>
            <span className="text-xs text-slate-500">Objects</span>
          </div>
          <Badge variant="emerald" size="sm">Single Source of Truth</Badge>
        </div>
      </div>
    </div>
  );
};
