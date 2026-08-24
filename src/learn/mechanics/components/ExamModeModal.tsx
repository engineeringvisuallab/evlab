import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { EXAM_CHALLENGES } from '../data/examChallenges';
import { ExamChallenge } from '../types/unifiedModel';

interface ExamModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChallengeId?: string;
  isDark: boolean;
}

export const ExamModeModal: React.FC<ExamModeModalProps> = ({
  isOpen,
  onClose,
  initialChallengeId = 'exam-01-beam-reaction',
  isDark,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(initialChallengeId);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const challenge = EXAM_CHALLENGES.find((c) => c.id === selectedChallengeId) || EXAM_CHALLENGES[0];

  // Reset state when challenge changes
  useEffect(() => {
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setTimeLeft(challenge.timeLimitSec);
    setIsTimerRunning(true);
  }, [selectedChallengeId, challenge.timeLimitSec]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, submitted, timeLeft]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(userAnswer);
    if (isNaN(val)) return;

    const diff = Math.abs(val - challenge.correctAnswer);
    const allowedMargin = (challenge.correctAnswer * challenge.tolerancePercent) / 100;
    const pass = diff <= allowedMargin;

    setIsCorrect(pass);
    setSubmitted(true);
    setIsTimerRunning(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Engineering Exam Challenge Mode</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solve deterministic mechanics problems with timer and automated evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Challenge Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {EXAM_CHALLENGES.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  ch.id === challenge.id
                    ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                    : isDark
                    ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ch.title}
              </button>
            ))}
          </div>

          {/* Problem Card */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {challenge.difficulty}
              </span>

              {/* Countdown Timer */}
              <div
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold ${
                  timeLeft < 30
                    ? 'bg-rose-500/20 text-rose-500 animate-pulse'
                    : isDark
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-white border text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Time: {formatTime(timeLeft)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {challenge.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {challenge.problemStatement}
              </p>
            </div>

            {/* Input submission form */}
            <form onSubmit={handleSubmit} className="pt-2 flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {challenge.questionPrompt}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="any"
                  disabled={submitted}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={`Value in ${challenge.unit}`}
                  className="px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none w-36"
                  required
                />
                <span className="text-xs font-bold text-slate-500">{challenge.unit}</span>
              </div>

              {!submitted ? (
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setUserAnswer('');
                    setIsTimerRunning(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </form>
          </div>

          {/* Submission Result Feedback */}
          {submitted && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-500">Correct! Solution Verified.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <span className="text-rose-500">
                      Incorrect. Correct Answer: {challenge.correctAnswer} {challenge.unit}
                    </span>
                  </>
                )}
              </div>

              {/* Step-by-step solution derivation */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Complete Step-by-Step Derivation:
                </div>
                {challenge.stepByStepSolution.map((s, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-slate-900/50 text-slate-300">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Hint */}
          {!submitted && (
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Show Method Hint'}</span>
              </button>
              {showHint && (
                <span className="text-slate-500 italic max-w-md">{challenge.hint}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
