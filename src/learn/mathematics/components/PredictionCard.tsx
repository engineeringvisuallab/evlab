import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react";
import { MathFormula } from "./MathFormula";

interface PredictionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface Props {
  topicTitle: string;
  question: string;
  options: PredictionOption[];
  onPredict: (selectedOption: PredictionOption) => void;
}

export const PredictionCard: React.FC<Props> = ({
  topicTitle,
  question,
  options,
  onPredict,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedOption = options.find((o) => o.id === selectedId);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    onPredict(selectedOption);
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/90 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-400" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
            Predict Before You Change (Question-First Intuition)
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 font-mono border border-indigo-700/50">
          Hypothesis Engine
        </span>
      </div>

      {/* Question */}
      <div className="text-sm font-semibold text-slate-100 leading-relaxed">
        {question}
      </div>

      {/* Options List */}
      <div className="space-y-2 pt-1">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          let btnClass = "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-850";

          if (submitted) {
            if (opt.isCorrect) {
              btnClass = "border-emerald-500/80 bg-emerald-950/60 text-emerald-200 font-semibold";
            } else if (isSelected && !opt.isCorrect) {
              btnClass = "border-rose-500/80 bg-rose-950/60 text-rose-200";
            } else {
              btnClass = "opacity-50 border-slate-800 bg-slate-900 text-slate-400";
            }
          } else if (isSelected) {
            btnClass = "border-indigo-500 bg-indigo-950 text-indigo-200 font-semibold shadow-md";
          }

          return (
            <button
              key={opt.id}
              disabled={submitted}
              onClick={() => setSelectedId(opt.id)}
              className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${btnClass}`}
            >
              <span>{opt.text}</span>
              {submitted && opt.isCorrect && (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-2" />
              )}
              {submitted && isSelected && !opt.isCorrect && (
                <XCircle size={16} className="text-rose-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / Feedback */}
      {!submitted ? (
        <div className="pt-2 flex justify-end">
          <button
            disabled={!selectedId}
            onClick={handleSubmit}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              selectedId
                ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <span>Lock In Prediction</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <div
          className={`p-3 rounded-lg text-xs leading-relaxed border ${
            selectedOption?.isCorrect
              ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              : "bg-amber-950/40 border-amber-800/50 text-amber-300"
          }`}
        >
          <strong className="block mb-1 font-mono">
            {selectedOption?.isCorrect ? "✓ Excellent Prediction!" : "Explore the Insight:"}
          </strong>
          {selectedOption?.explanation}
        </div>
      )}
    </div>
  );
};
