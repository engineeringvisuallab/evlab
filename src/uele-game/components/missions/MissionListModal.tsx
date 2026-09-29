import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  Droplets,
  Building2,
  Zap,
  FlaskConical,
  Compass,
  Navigation,
  Cog,
  Leaf,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Mission, EngineeringDistrictId } from '../../types/game';
import { MISSIONS_DATA } from '../../data/missionsData';
import { DISTRICT_REGISTRY } from '../../data/geoData';

interface MissionListModalProps {
  completedMissionIds: string[];
  selectedDistrict: EngineeringDistrictId | null;
  onClose: () => void;
  onSelectMission: (mission: Mission) => void;
}

export const MissionListModal: React.FC<MissionListModalProps> = ({
  completedMissionIds,
  selectedDistrict,
  onClose,
  onSelectMission,
}) => {
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');

  const getDisciplineIcon = (disc: string) => {
    switch (disc) {
      case 'water':
        return Droplets;
      case 'structural':
        return Building2;
      case 'civil':
        return Compass;
      case 'energy':
        return Zap;
      case 'materials':
        return FlaskConical;
      case 'survey_gis':
        return Compass;
      case 'mechanical':
        return Cog;
      case 'transport':
        return Navigation;
      case 'environmental':
        return Leaf;
      default:
        return GraduationCap;
    }
  };

  const filteredMissions = MISSIONS_DATA.filter((m) => {
    if (filterDiscipline !== 'all' && m.discipline !== filterDiscipline) return false;
    if (selectedDistrict && m.districtId !== selectedDistrict) return false;
    return true;
  });

  return (
    <div id="missions-browser-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Engineering Mission Dispatch</h2>
              <p className="text-xs text-slate-400">
                {selectedDistrict ? `Showing missions in ${DISTRICT_REGISTRY[selectedDistrict]?.name}` : 'Explore real-world technical problems across all districts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Filter:</span>
          {['all', 'civil', 'structural', 'water', 'energy', 'materials', 'transport', 'mechanical', 'survey_gis'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiscipline(d)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterDiscipline === d
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredMissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <p className="text-sm">No missions match the current filter.</p>
              <button
                onClick={() => setFilterDiscipline('all')}
                className="text-xs text-cyan-400 underline font-semibold"
              >
                Clear discipline filter
              </button>
            </div>
          ) : (
            filteredMissions.map((mission) => {
              const isCompleted = completedMissionIds.includes(mission.id);
              const distInfo = DISTRICT_REGISTRY[mission.districtId];
              const Icon = getDisciplineIcon(mission.discipline);

              return (
                <div
                  key={mission.id}
                  id={`mission-card-${mission.id}`}
                  onClick={() => onSelectMission(mission)}
                  className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/50 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0"
                      style={{ backgroundColor: `${distInfo?.color || '#38bdf8'}25`, borderColor: distInfo?.color || '#38bdf8', borderWidth: 1 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: distInfo?.color || '#38bdf8' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-cyan-400">
                          {distInfo?.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {mission.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {mission.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Rewards & Launch CTA */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">+${mission.rewardBudget.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">+{mission.rewardXp.knowledge + mission.rewardXp.practical} Total XP</div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all">
                      <span>{isCompleted ? 'Review' : 'Enter Mission'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
