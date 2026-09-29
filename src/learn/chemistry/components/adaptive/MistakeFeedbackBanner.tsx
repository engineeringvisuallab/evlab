import React from 'react';
import { MistakeFeedback } from '../../types/chemistry';
import { AlertCircle, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';

interface MistakeFeedbackBannerProps {
  feedback: MistakeFeedback | null;
  onRetry?: () => void;
  className?: string;
}

export const MistakeFeedbackBanner: React.FC<MistakeFeedbackBannerProps> = ({
  feedback,
  onRetry,
  className = ''
}) => {
  if (!feedback) return null;

  return (
    <div
      className={`bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 shadow-lg space-y-3 animate-fadeIn ${className}`}
      id="mistake-feedback-banner"
    >
      <div className="flex items-center justify-between border-b border-rose-900/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-rose-200 uppercase tracking-wider">
            Pedagogical Error Analysis & Correction
          </h4>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#0F172A] border border-rose-900/50 space-y-1">
          <span className="font-mono font-bold text-rose-400 uppercase text-[10px]">
            What You Did:
          </span>
          <p className="text-slate-200 leading-relaxed">{feedback.whatHappened}</p>
        </div>

        <div className="p-3 rounded-xl bg-[#0F172A] border border-emerald-900/50 space-y-1">
          <span className="font-mono font-bold text-emerald-400 uppercase text-[10px]">
            What Was Expected:
          </span>
          <p className="text-slate-200 leading-relaxed">{feedback.expectedBehavior}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 uppercase text-[10px]">
          <Lightbulb className="w-3.5 h-3.5" /> Why It Occurred & Chemical Explanation:
        </div>
        <p className="text-slate-300 leading-relaxed">{feedback.scientificReason}</p>
        <div className="text-teal-300 font-semibold pt-1">
          Remedy: {feedback.remedyAction}
        </div>
      </div>
    </div>
  );
};
