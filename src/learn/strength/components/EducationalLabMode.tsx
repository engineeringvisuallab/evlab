import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Trophy, 
  X, 
  Zap 
} from 'lucide-react';

interface EducationalLabModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalLabMode: React.FC<EducationalLabModeProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeLabId, setActiveLabId] = useState<'lab_tensile' | 'lab_beam' | 'lab_buckling'>('lab_tensile');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const labs = {
    lab_tensile: {
      title: 'Lab 1: Tensile Testing of Structural Metals',
      objective: 'Observe elastic limit, 0.2% yield offset, strain hardening, necking, and cup-and-cone ductile fracture.',
      steps: [
        'Select A36 Structural Steel and apply progressive tensile pull.',
        'Observe linear Hookean behavior where stress is directly proportional to strain (σ = E·ε).',
        'Identify the exact yield plateau where atomic dislocation slip initiates.',
        'Push displacement past Ultimate Tensile Strength (UTS) to observe localized cross-sectional necking.',
        'Record final fracture strain and identify the cup-and-cone shear rupture profile.',
      ],
      quiz: {
        question: 'Why does stress decrease on the engineering stress-strain curve after reaching UTS?',
        options: [
          'The material at the atomic level becomes softer.',
          'Engineering stress uses original area A₀, ignoring the drastic localized cross-sectional necking.',
          'Young’s modulus becomes negative.',
          'Thermal expansion cools the specimen down.',
        ],
        correct: 1,
        explanation: 'Engineering stress is defined as P / A₀. When localized necking occurs, the true area drops rapidly, so less force is needed to continue elongating the neck, causing the engineering curve to droop.',
      },
    },
    lab_beam: {
      title: 'Lab 2: Bending & Deflection of Steel Wide-Flange Beams',
      objective: 'Investigate how beam span length L and section depth h govern flexural stresses and deflections.',
      steps: [
        'Place a 25 kN point load at the center of a 4m simply supported beam.',
        'Switch to the SFD and BMD views to locate points of zero shear and maximum bending moment.',
        'Examine the cross-section stress profile to identify the Neutral Axis (where σ = 0).',
        'Double the beam depth h and observe why deflection drops by 87.5% (1/h³).',
      ],
      quiz: {
        question: 'If you double the span length of a simply supported beam with a central point load, by what factor does midspan deflection increase?',
        options: [
          '2× (Linear)',
          '4× (Quadratic)',
          '8× (Cubic: δ ∝ L³)',
          '16× (Quartic)',
        ],
        correct: 2,
        explanation: 'For a central point load, max deflection is δ = P·L³ / (48·E·I). Because deflection scales with L³, doubling L results in 2³ = 8 times greater deflection.',
      },
    },
    lab_buckling: {
      title: 'Lab 3: Euler Column Stability & Bifurcation',
      objective: 'Analyze why slender columns fail abruptly via geometric instability rather than material crushing.',
      steps: [
        'Configure a Pin-Pin column (K = 1.0) and calculate its Euler critical buckling load P_cr.',
        'Gradually increase the compression jack towards P_cr to observe neutral bifurcation.',
        'Change end conditions to Fixed-Fixed (K = 0.5) and verify why critical capacity quadruples (4×).',
        'Analyze the Euler hyperbola to see where buckling transitions to material yielding for short columns.',
      ],
      quiz: {
        question: 'How do Fixed-Fixed end conditions affect the Euler critical buckling load compared to Pin-Pin?',
        options: [
          'Halves the capacity (0.5×)',
          'Doubles the capacity (2×)',
          'Quadruples the capacity (4× because K=0.5 and P_cr ∝ 1/K²)',
          'Has no effect on elastic stability',
        ],
        correct: 2,
        explanation: 'In Euler buckling, P_cr = π²·EI / (K·L)². For Fixed-Fixed, K = 0.5, so (1/0.5)² = 4. The column is 4 times stronger against buckling!',
      },
    },
  };

  const currentLab = labs[activeLabId];

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                EVLab Guided Engineering Laboratory Experiments
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step experimental protocols with interactive conceptual check quizzes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lab Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(labs) as Array<keyof typeof labs>).map(id => (
              <button
                key={id}
                onClick={() => {
                  setActiveLabId(id);
                  setCompletedSteps([]);
                  setQuizAnswer(null);
                  setQuizSubmitted(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-center transition border ${
                  activeLabId === id
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {labs[id].title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Active Lab Guide */}
          <div className="bg-slate-950/80 rounded-lg border border-slate-800 p-4 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-100">{currentLab.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{currentLab.objective}</p>
            </div>

            {/* Step-by-Step Procedure Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                Experimental Protocol Checklist:
              </span>
              {currentLab.steps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-2.5 rounded-md flex items-start space-x-2.5 text-xs transition border ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200 line-through opacity-80'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 border ${
                      isDone ? 'bg-emerald-600 text-white border-emerald-500' : 'border-slate-600 text-slate-400'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </button>
                );
              })}
            </div>

            {/* Conceptual Engineering Quiz */}
            <div className="bg-slate-900/90 p-4 rounded-lg border border-indigo-900/40 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Concept Mastery Check</span>
              </div>

              <p className="text-xs font-semibold text-slate-200">
                {currentLab.quiz.question}
              </p>

              <div className="space-y-1.5">
                {currentLab.quiz.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => {
                      if (!quizSubmitted) setQuizAnswer(oIdx);
                    }}
                    className={`w-full text-left p-2 rounded text-xs transition border ${
                      quizAnswer === oIdx
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={quizAnswer === null}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  Submit Answer
                </button>
              ) : (
                <div className={`p-3 rounded-md text-xs leading-relaxed border ${
                  quizAnswer === currentLab.quiz.correct
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                }`}>
                  <span className="font-bold block mb-1">
                    {quizAnswer === currentLab.quiz.correct ? '✓ Correct!' : '✕ Incorrect'}
                  </span>
                  {currentLab.quiz.explanation}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Close Guided Lab
          </button>
        </div>
      </div>
    </div>
  );
};
