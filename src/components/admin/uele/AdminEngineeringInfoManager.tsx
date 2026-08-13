import React, { useState } from 'react';
import { UELEFacility, UELEEngineeringInfo } from '../../../types/adminUele';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  FileText,
  Save,
  CheckCircle2,
  Building2,
  AlertTriangle,
  BookOpen,
  Wrench,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface AdminEngineeringInfoManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminEngineeringInfoManager: React.FC<AdminEngineeringInfoManagerProps> = ({
  database,
  onRefreshDatabase,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    database.facilities[0]?.id || ''
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const facility = database.facilities.find((f) => f.id === selectedFacilityId);

  const [info, setInfo] = useState<UELEEngineeringInfo>({
    overview: facility?.engineeringInfo?.overview || '',
    purpose: facility?.engineeringInfo?.purpose || '',
    whatIsIt: facility?.engineeringInfo?.whatIsIt || '',
    whyRequired: facility?.engineeringInfo?.whyRequired || '',
    howItWorks: facility?.engineeringInfo?.howItWorks || '',
    designStandards: facility?.engineeringInfo?.designStandards || [],
  });

  const handleFacilityChange = (facId: string) => {
    setSelectedFacilityId(facId);
    const found = database.facilities.find((f) => f.id === facId);
    if (found?.engineeringInfo) {
      setInfo(found.engineeringInfo);
    } else {
      setInfo({ overview: '', purpose: '', whatIsIt: '', whyRequired: '', howItWorks: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updatedFacility: UELEFacility = {
        ...facility,
        engineeringInfo: info,
      };

      await UELEAdminService.saveEntity('facility', updatedFacility);
      onRefreshDatabase();
      setSuccessMsg(`Engineering dossier saved for "${facility.name}".`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save engineering info.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>9. Engineering Information & Technical Dossier Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed engineering dossier: WHAT, WHY, HOW, Purpose, Design, Ops, Maintenance & Safety
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Facility
          </label>
          <select
            value={selectedFacilityId}
            onChange={(e) => handleFacilityChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
          >
            {database.facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {facility ? (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                WHAT IS IT? (System Definition)
              </label>
              <textarea
                rows={3}
                value={info.whatIsIt || ''}
                onChange={(e) => setInfo({ ...info, whatIsIt: e.target.value })}
                placeholder="Explain what this engineering infrastructure object is..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                WHY IS IT REQUIRED? (Engineering Purpose)
              </label>
              <textarea
                rows={3}
                value={info.whyRequired || ''}
                onChange={(e) => setInfo({ ...info, whyRequired: e.target.value })}
                placeholder="Explain the necessity and hydraulic/structural purpose..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-400" />
                HOW DOES IT WORK? (Operational Principle)
              </label>
              <textarea
                rows={4}
                value={info.howItWorks || ''}
                onChange={(e) => setInfo({ ...info, howItWorks: e.target.value })}
                placeholder="Step-by-step description of process and operation..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                SAFETY & MAINTENANCE GUIDELINES
              </label>
              <textarea
                rows={4}
                value={info.overview || ''}
                onChange={(e) => setInfo({ ...info, overview: e.target.value })}
                placeholder="Safety protocols, hazard mitigation, and maintenance schedules..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="gap-2 font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-500"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Dossier'}</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
          No facilities available. Please create a facility in Module 4 first.
        </div>
      )}
    </div>
  );
};
