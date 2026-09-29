import React, { useState } from 'react';
import { Target, HelpCircle, CheckCircle2, XCircle, Play, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PredictionQuiz } from '../../types/physics';

interface PredictionModeProps {
  quiz: PredictionQuiz;
  onApplyCondition: (params: Record<string, number>) => void;
  onRunSimulation: () => void;
  isSimulationRunning: boolean;
}

export const PredictionMode: React.FC<PredictionModeProps> = ({
  quiz,
  onApplyCondition,
  onRunSimulation,
  isSimulationRunning,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasTested, setHasTested] = useState<boolean>(false);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleSelectOption = (id: string) => {
    if (hasTested) return;
    setSelectedOptionId(id);
  };

  const handleTestPrediction = () => {
    if (!selectedOptionId) return;
    onApplyCondition(quiz.conditionToTest);
    onRunSimulation();
    setHasTested(true);

    const chosenOption = quiz.options.find((o) => o.id === selectedOptionId);
    if (chosenOption?.isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setHasTested(false);
    setAiFeedback(null);
  };

  const chosenOption = quiz.options.find((o) => o.id === selectedOptionId);

  return (
    <div
      id="prediction-mode"
      className="bg-[#080808] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col h-full"
    >
      {/* Header - Elegant Dark */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Hypothesis & Prediction
            </h3>
            <p className="text-[10px] text-white/40 font-mono">
              Hypothesize → Test Condition → Empirical Verification
            </p>
          </div>
        </div>

        {hasTested && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-mono uppercase px-2.5 py-1 bg-[#050505] hover:bg-white/5 text-white/60 hover:text-white border border-white/10 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>

      {/* Question Box */}
      <div className="bg-[#050505] border border-white/10 rounded-lg p-3.5 mb-3">
        <div className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-1 flex items-center gap-1.5 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-500" /> Physical Question
        </div>
        <p className="text-xs font-semibold text-white leading-relaxed">{quiz.question}</p>
        <div className="text-[10px] text-white/50 mt-2 font-mono bg-[#0A0A0A] border border-white/5 p-2 rounded">
          {quiz.context}
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 space-y-2 overflow-y-auto mb-3">
        {quiz.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          let borderStyle = 'border-white/10 hover:border-white/20 bg-[#050505]';
          if (isSelected) {
            borderStyle = 'border-cyan-500/60 bg-[#0A0A0A] shadow-md shadow-cyan-500/10';
          }
          if (hasTested) {
            if (opt.isCorrect) {
              borderStyle = 'border-emerald-500/60 bg-emerald-950/20 text-emerald-200';
            } else if (isSelected && !opt.isCorrect) {
              borderStyle = 'border-rose-500/60 bg-rose-950/20 text-rose-200';
            }
          }

          return (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${borderStyle}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white/90">{opt.text}</span>
                {hasTested && opt.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                )}
                {hasTested && isSelected && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                )}
              </div>

              {/* Reveal explanation after testing */}
              {hasTested && (
                <div className="text-[11px] mt-2 pt-2 border-t border-white/5 text-white/60 leading-relaxed font-mono">
                  {opt.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Test Prediction Button */}
      {!hasTested && (
        <button
          disabled={!selectedOptionId}
          onClick={handleTestPrediction}
          className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            selectedOptionId
              ? 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-600/20'
              : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Run Empirical Test & Verify
        </button>
      )}
    </div>
  );
};
