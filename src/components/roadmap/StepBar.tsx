import React from 'react';
import { Check, Compass, GitBranch, Target, Layers } from 'lucide-react';

export interface StepBarStep {
  stepNumber: number;
  id: 'field' | 'branch' | 'specialization' | 'area';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selectedTitle?: string;
}

export interface StepBarProps {
  currentStep: number; // 1, 2, 3, or 4
  selectedPath: {
    fieldTitle?: string;
    branchTitle?: string;
    specTitle?: string;
    areaTitle?: string;
  };
  onSelectStep: (stepNumber: number) => void;
  className?: string;
}

export const StepBar: React.FC<StepBarProps> = ({
  currentStep,
  selectedPath,
  onSelectStep,
  className = '',
}) => {
  const steps: StepBarStep[] = [
    {
      stepNumber: 1,
      id: 'field',
      title: 'Field',
      subtitle: 'Discipline',
      icon: <Compass className="w-4 h-4" />,
      selectedTitle: selectedPath.fieldTitle,
    },
    {
      stepNumber: 2,
      id: 'branch',
      title: 'Branch',
      subtitle: 'Sub-Discipline',
      icon: <GitBranch className="w-4 h-4" />,
      selectedTitle: selectedPath.branchTitle,
    },
    {
      stepNumber: 3,
      id: 'specialization',
      title: 'Specialization',
      subtitle: 'Domain',
      icon: <Target className="w-4 h-4" />,
      selectedTitle: selectedPath.specTitle,
    },
    {
      stepNumber: 4,
      id: 'area',
      title: 'Focus Area',
      subtitle: 'Technical Area',
      icon: <Layers className="w-4 h-4" />,
      selectedTitle: selectedPath.areaTitle,
    },
  ];

  return (
    <div className={`w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-4 shadow-sm ${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {steps.map((step) => {
          const isCurrent = currentStep === step.stepNumber;
          const isCompleted = currentStep > step.stepNumber && Boolean(step.selectedTitle);
          const isClickable = isCompleted || (isCurrent && step.stepNumber > 1);

          return (
            <div
              key={step.id}
              onClick={() => {
                if (isClickable) {
                  onSelectStep(step.stepNumber);
                }
              }}
              className={`relative p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-center space-x-3 ${
                isCurrent
                  ? 'bg-[var(--accent-purple-bg)] border-[var(--accent-purple)] text-[var(--text-primary)] shadow-sm'
                  : isCompleted
                  ? 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-[var(--accent-purple)]/50 cursor-pointer text-[var(--text-primary)]'
                  : 'bg-[var(--bg-primary)]/50 border-[var(--border-color)]/60 text-[var(--text-muted)] opacity-70 cursor-not-allowed'
              }`}
            >
              {/* Step Circle / Badge */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                  isCurrent
                    ? 'bg-[var(--accent-purple)] text-white'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.stepNumber}
              </div>

              {/* Step Titles */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Step 0{step.stepNumber}
                  </span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)] animate-pulse" />
                  )}
                </div>

                <div className="font-bold text-xs sm:text-sm truncate text-[var(--text-primary)]">
                  {step.title}
                </div>

                <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">
                  {step.selectedTitle ? (
                    <span className="text-[var(--accent-purple)] font-medium">
                      {step.selectedTitle}
                    </span>
                  ) : (
                    step.subtitle
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
