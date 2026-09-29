import React from 'react';
import { COMPACT_EXPERIENCE, EDUCATION_COMPACT, TRAINING_COMPACT, LANGUAGE_PROFICIENCY } from '../data/portfolioData';
import { PORTFOLIO_CONFIG } from '../data/config';
import { Briefcase, GraduationCap, Award, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function Experience() {
  return (
    <section id="experience" className="py-16 sm:py-24 relative bg-[#070d1a] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1">
              <span>EMPLOYMENT & CREDENTIALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Experience, Education & Training
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>IDEB Member ID: {PORTFOLIO_CONFIG.membershipId}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Experience Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase mb-2">
              <Briefcase className="w-4 h-4" />
              <span>Employment Record</span>
            </div>

            {COMPACT_EXPERIENCE.map((exp, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#091122] border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">
                    {exp.role}
                  </h3>
                  <span className="font-mono text-cyan-400 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {exp.period}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-300 font-semibold">{exp.firm}</div>

                <ul className="space-y-1.5 pt-2 text-xs text-slate-300">
                  {exp.highlights.map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">·</span>
                      <span className="leading-relaxed">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Professional Association Badge */}
            <div className="p-4 rounded-2xl bg-[#091122] border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400">
                  ID
                </div>
                <div>
                  <span className="text-white font-bold block">Institution of Diploma Engineers Bangladesh (IDEB)</span>
                  <span className="text-slate-400 text-[11px]">Member ID: 72993 (MIDEB)</span>
                </div>
              </div>
              <span className="text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40 text-[11px]">
                Registered Member
              </span>
            </div>
          </div>

          {/* Education & Training Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Education */}
            <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-950/80 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                <GraduationCap className="w-4 h-4" />
                <span>Formal Education</span>
              </div>

              {EDUCATION_COMPACT.map((edu, eIdx) => (
                <div key={eIdx} className="pt-2 border-t first:border-t-0 border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white font-display">{edu.degree}</h3>
                    <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      {edu.year}
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">{edu.institution}</p>
                  <p className="text-slate-400 text-[11px]">{edu.details}</p>
                </div>
              ))}
            </div>

            {/* Specialized Training */}
            <div className="p-5 rounded-2xl bg-[#091122] border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
                <Award className="w-4 h-4" />
                <span>Specialized Professional Training</span>
              </div>

              <div className="space-y-2 text-slate-300 text-[11px] pt-1">
                {TRAINING_COMPACT.map((tr, tIdx) => (
                  <div key={tIdx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="font-bold text-white mb-0.5">{tr.title}</div>
                    <div className="text-cyan-400 text-[10px] font-mono">{tr.provider} {tr.period && `(${tr.period})`}</div>
                    <div className="text-slate-400 mt-0.5">{tr.details}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Proficiency */}
            <div className="p-4 rounded-2xl bg-[#091122] border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Globe className="w-4 h-4" />
                <span>Language Proficiency</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {LANGUAGE_PROFICIENCY.map((lang, lIdx) => (
                  <div key={lIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-white font-bold block">{lang.language}</span>
                    <span className="text-slate-400 text-[10px]">Speaking: {lang.speaking}</span>
                    <span className="text-slate-400 text-[10px] block">Read/Write: {lang.reading}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
