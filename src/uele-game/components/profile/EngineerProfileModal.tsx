import React from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Building,
  Activity,
  Briefcase,
  CheckCircle2,
  Trophy,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { EngineerProfile } from '../../types/game';
import { CAREER_RANKS } from '../../data/geoData';

interface EngineerProfileModalProps {
  profile: EngineerProfile;
  onClose: () => void;
}

export const EngineerProfileModal: React.FC<EngineerProfileModalProps> = ({
  profile,
  onClose,
}) => {
  const currentRank = CAREER_RANKS[profile.rankIndex] || CAREER_RANKS[0];
  const nextRank = CAREER_RANKS[profile.rankIndex + 1];
  const xpNeeded = nextRank ? nextRank.minXp - currentRank.minXp : 10000;
  const currentProgress = nextRank ? ((profile.totalXp - currentRank.minXp) / xpNeeded) * 100 : 100;

  return (
    <div id="engineer-profile-dossier" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <UserCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Professional Engineer Dossier</h2>
              <p className="text-xs text-slate-400">UELE Accredited Engineering License Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-2xl text-slate-950 shadow-xl border-2 border-amber-300/40">
                L{profile.level}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h3 className="font-black text-lg text-slate-100">{profile.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {currentRank.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: UELE-BD50-2026-ENG • Specialization: {profile.specialization}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                  <span>Available Funds: <strong className="text-emerald-400 font-mono font-bold">${profile.funds.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Total XP: <strong className="text-cyan-400 font-mono font-bold">{profile.totalXp.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Rank Seal */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center min-w-[140px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Promotion</span>
              <div className="text-xs font-bold text-amber-400 mt-0.5">
                {nextRank ? nextRank.title : 'Master Rank Maxed'}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(currentProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 8-Discipline Competency XP Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>8-Pillar Engineering Competency Breakdown</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(profile.xpByDiscipline).map(([key, val]) => {
                const numericVal = Number(val) || 0;
                return (
                  <div key={key} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block capitalize">
                      {key} XP
                    </span>
                    <div className="text-sm font-bold font-mono text-cyan-300">{numericVal.toLocaleString()}</div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (numericVal / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Milestones & Certifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Career Milestones & Engineering Certifications</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Chartered Civil Engineering Practitioner</div>
                  <div className="text-[10px] text-slate-400">Accredited by Bangladesh Engineering Board</div>
                </div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
                <Building className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Hydraulic & Water Resources License</div>
                  <div className="text-[10px] text-slate-400">Sherpur Catchment Stormwater Authority</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
