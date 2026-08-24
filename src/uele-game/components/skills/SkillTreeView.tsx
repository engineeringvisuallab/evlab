import React, { useState } from 'react';
import {
  X,
  Layers,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Compass,
  Cpu,
} from 'lucide-react';
import { SkillNode } from '../../types/game';
import { SKILL_TREE_DATA } from '../../data/skillTreeData';
import { audioEngine } from '../../utils/audioEngine';
import confetti from 'canvas-confetti';

interface SkillTreeViewProps {
  unlockedSkillIds: string[];
  totalXp: number;
  onUnlockSkill: (skillId: string, xpCost: number) => void;
  onClose: () => void;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  unlockedSkillIds,
  totalXp,
  onUnlockSkill,
  onClose,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(SKILL_TREE_DATA[0]);

  const tiers = [1, 2, 3, 4, 5];

  const handleUnlock = (skill: SkillNode) => {
    if (totalXp < skill.xpCost) return;
    audioEngine.playSuccessChime();
    confetti({ particleCount: 50, spread: 50 });
    onUnlockSkill(skill.id, skill.xpCost);
  };

  return (
    <div id="skill-tree-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Engineering Discipline Skill Tree</h2>
              <p className="text-xs text-slate-400">Unlock professional competencies, calculation engines & field mastery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-indigo-950/70 border border-indigo-500/40 rounded-xl text-xs font-mono text-indigo-300">
              Available XP: <strong className="text-white font-bold">{totalXp.toLocaleString()} XP</strong>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tree Canvas Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Main Visual Nodes Map */}
          <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 overflow-x-auto space-y-6">
            {tiers.map((tier) => {
              const tierSkills = SKILL_TREE_DATA.filter((s) => s.tier === tier);
              if (tierSkills.length === 0) return null;

              return (
                <div key={tier} className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Tier {tier} — {tier === 1 ? 'Fundamental Principles' : tier === 2 ? 'Discipline Mechanics' : tier === 3 ? 'Professional Design' : tier === 4 ? 'Digital Twin & Smart Infrastructure' : 'Master Disaster Engineering'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {tierSkills.map((skill) => {
                      const isUnlocked = unlockedSkillIds.includes(skill.id);
                      const isSelected = selectedSkill?.id === skill.id;
                      const prereqsMet = skill.prerequisiteIds.every((id) => unlockedSkillIds.includes(id));
                      const canUnlock = prereqsMet && !isUnlocked && totalXp >= skill.xpCost;

                      return (
                        <div
                          key={skill.id}
                          id={`skill-node-${skill.id}`}
                          onClick={() => {
                            audioEngine.playClick(500, 0.02);
                            setSelectedSkill(skill);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 relative group ${
                            isSelected
                              ? 'bg-indigo-950/50 border-indigo-400 ring-2 ring-indigo-500/30'
                              : isUnlocked
                              ? 'bg-slate-900/90 border-indigo-500/50 text-slate-100 hover:border-indigo-400'
                              : prereqsMet
                              ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-indigo-400">
                              {skill.category}
                            </span>
                            {isUnlocked ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Mastered</span>
                              </span>
                            ) : prereqsMet ? (
                              <span className="text-[10px] text-amber-400 font-mono font-bold">
                                {skill.xpCost} XP
                              </span>
                            ) : (
                              <Lock className="w-3 h-3 text-slate-600" />
                            )}
                          </div>

                          <div className="font-bold text-xs leading-snug text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {skill.name}
                          </div>

                          <div className="text-[11px] text-slate-400 line-clamp-2">
                            {skill.practicalSkill}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Selected Skill Inspector Dossier */}
          {selectedSkill && (
            <div className="w-full lg:w-80 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block">
                      {selectedSkill.discipline.toUpperCase()} • TIER {selectedSkill.tier}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{selectedSkill.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {selectedSkill.description}
                </p>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                    Practical Application
                  </span>
                  <p className="text-xs text-slate-200">{selectedSkill.practicalSkill}</p>
                </div>
              </div>

              {/* Unlock Action Button */}
              <div>
                {unlockedSkillIds.includes(selectedSkill.id) ? (
                  <div className="w-full py-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skill Node Active</span>
                  </div>
                ) : (
                  <button
                    id="btn-unlock-skill-node"
                    disabled={
                      !selectedSkill.prerequisiteIds.every((id) => unlockedSkillIds.includes(id)) ||
                      totalXp < selectedSkill.xpCost
                    }
                    onClick={() => handleUnlock(selectedSkill)}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Skill ({selectedSkill.xpCost} XP)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
