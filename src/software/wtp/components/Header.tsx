import React from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  Box
} from 'lucide-react';
import { ProjectMetadata, ValidationResult } from '../types/wtp';
import { CalculatedWtpState } from '../core/dependencyEngine';

interface HeaderProps {
  project: ProjectMetadata;
  state?: CalculatedWtpState;
  validations?: ValidationResult[];
  onUpdateProject?: (updated: Partial<ProjectMetadata>) => void;
  onOpenAiAssistant: () => void;
  onOpenFormulaInspector: (paramId?: string) => void;
  onPublishToBim?: () => void;
  validationPassCount?: number;
  validationWarnCount?: number;
  validationFailCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  validations = [],
  onOpenAiAssistant,
  onOpenFormulaInspector,
  onPublishToBim,
  validationPassCount,
  validationWarnCount,
  validationFailCount
}) => {
  const passes = validationPassCount ?? validations.filter(v => v.status === 'PASS').length;
  const warns = validationWarnCount ?? validations.filter(v => v.status === 'WARNING').length;
  const fails = validationFailCount ?? validations.filter(v => v.status === 'FAIL').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-lg">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-cyan-100 tracking-wide">{project.name || 'Untitled WTP Project'}</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded font-mono font-medium border border-cyan-500/30">
                {project.revision}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>{project.plantCapacityMLD} MLD</span>
              <span>•</span>
              <span>{project.designStandard}</span>
              <span>•</span>
              <span>{project.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Validation Matrix Quick Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
          <span className="text-slate-400 text-2xs uppercase tracking-wider font-semibold mr-1">Design Status:</span>
          <div className="flex items-center gap-1 text-emerald-400" title="Passing Criteria">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{passes}</span>
          </div>
          {warns > 0 && (
            <div className="flex items-center gap-1 text-amber-400" title="Warnings">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warns}</span>
            </div>
          )}
          {fails > 0 && (
            <div className="flex items-center gap-1 text-rose-400 font-bold" title="Critical Failures">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{fails}</span>
            </div>
          )}
        </div>

        {/* Formula Inspector Button */}
        <button
          onClick={() => onOpenFormulaInspector()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Formula Inspector</span>
        </button>

        {/* Publish to BIM Button */}
        {onPublishToBim && (
          <button
            onClick={onPublishToBim}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Publish this design's 3D model to the shared EVLab BIM workspace"
          >
            <Box className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Publish to BIM</span>
          </button>
        )}

        {/* EVL AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition transform hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span>EVL AI Assistant</span>
        </button>
      </div>
    </header>
  );
};
