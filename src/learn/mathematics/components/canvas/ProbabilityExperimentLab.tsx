import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { Dices, Play, RotateCcw, HelpCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const ProbabilityExperimentLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [expType, setExpType] = useState<"dice-sum" | "coin-toss" | "random-walk">("dice-sum");
  const [diceFrequencies, setDiceFrequencies] = useState<number[]>(new Array(11).fill(0)); // sums 2 to 12
  const [totalRolls, setTotalRolls] = useState(0);

  // Coin toss state
  const [coinHeads, setCoinHeads] = useState(0);
  const [coinTosses, setCoinTosses] = useState(0);

  // Random walk state
  const [walkPositions, setWalkPositions] = useState<number[]>([0]);

  // Dice simulation runner
  const rollDice = (count: number) => {
    const newFreqs = [...diceFrequencies];
    for (let i = 0; i < count; i++) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      newFreqs[sum - 2]++;
    }
    setDiceFrequencies(newFreqs);
    setTotalRolls((prev) => prev + count);
  };

  // Coin simulation runner
  const flipCoins = (count: number) => {
    let heads = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.5) heads++;
    }
    setCoinHeads((prev) => prev + heads);
    setCoinTosses((prev) => prev + count);
  };

  // Random walk runner
  const stepWalk = (steps: number) => {
    const currentPos = walkPositions[walkPositions.length - 1] || 0;
    const nextPath = [...walkPositions];
    let pos = currentPos;
    for (let i = 0; i < steps; i++) {
      pos += Math.random() < 0.5 ? 1 : -1;
      nextPath.push(pos);
    }
    setWalkPositions(nextPath);
  };

  const resetExperiment = () => {
    setDiceFrequencies(new Array(11).fill(0));
    setTotalRolls(0);
    setCoinHeads(0);
    setCoinTosses(0);
    setWalkPositions([0]);
  };

  // Theoretical dice probabilities (sums 2 to 12): [1,2,3,4,5,6,5,4,3,2,1]/36
  const theoreticalDiceProb = [1/36, 2/36, 3/36, 4/36, 5/36, 6/36, 5/36, 4/36, 3/36, 2/36, 1/36];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dices className="text-purple-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Stochastic Experiments & Probability Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono border border-purple-800/50">
            Monte Carlo Engine
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setExpType("dice-sum")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              expType === "dice-sum" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            2-Dice Sum Distribution
          </button>
          <button
            onClick={() => setExpType("coin-toss")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              expType === "coin-toss" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Law of Large Numbers (Coins)
          </button>
          <button
            onClick={() => setExpType("random-walk")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              expType === "random-walk" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            1D Random Walk / Diffusion
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
        {/* EXP 1: 2-DICE SUM HISTOGRAM */}
        {expType === "dice-sum" && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
            {/* Histogram Bars */}
            <div className="w-full h-52 bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex items-end justify-between gap-1.5 relative">
              {diceFrequencies.map((count, idx) => {
                const sumVal = idx + 2;
                const experimentalPct = totalRolls > 0 ? (count / totalRolls) * 100 : 0;
                const theoreticalPct = theoreticalDiceProb[idx] * 100;
                const maxPct = 20; // 6/36 is ~16.67%
                const barHeight = Math.min(100, (experimentalPct / maxPct) * 100);

                return (
                  <div key={`sum-${sumVal}`} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Theoretical marker dot */}
                    <div
                      className="absolute w-2 h-2 rounded-full bg-amber-400 border border-slate-900 z-10"
                      style={{ bottom: `${(theoreticalPct / maxPct) * 100}%` }}
                      title={`Theoretical: ${theoreticalPct.toFixed(1)}%`}
                    />

                    {/* Experimental Bar */}
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-700 to-purple-400 transition-all duration-300 min-h-[4px]"
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="text-[11px] font-mono text-slate-300 mt-2 font-bold">{sumVal}</span>
                    <span className="text-[9px] font-mono text-purple-300">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Trial Launchers */}
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => rollDice(10)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
                >
                  +10 Rolls
                </button>
                <button
                  onClick={() => rollDice(100)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
                >
                  +100 Rolls
                </button>
                <button
                  onClick={() => rollDice(1000)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-mono text-white font-bold shadow-md"
                >
                  +1,000 Rolls
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-slate-300">
                  Total Rolls: <strong className="text-purple-300">{totalRolls}</strong>
                </div>
                <button
                  onClick={resetExperiment}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  title="Reset Data"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXP 2: COIN TOSSES */}
        {expType === "coin-toss" && (
          <div className="w-full max-w-xl flex flex-col items-center space-y-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-mono">Heads Count (H)</span>
                <div className="text-2xl font-bold text-amber-400 font-mono">{coinHeads}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {coinTosses > 0 ? `${((coinHeads / coinTosses) * 100).toFixed(2)}%` : "0.00%"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-mono">Tails Count (T)</span>
                <div className="text-2xl font-bold text-cyan-400 font-mono">{coinTosses - coinHeads}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {coinTosses > 0 ? `${(((coinTosses - coinHeads) / coinTosses) * 100).toFixed(2)}%` : "0.00%"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => flipCoins(50)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
              >
                +50 Flips
              </button>
              <button
                onClick={() => flipCoins(500)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
              >
                +500 Flips
              </button>
              <button
                onClick={() => flipCoins(2000)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-mono text-white font-bold shadow-md"
              >
                +2,000 Flips
              </button>
              <button
                onClick={resetExperiment}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        )}

        {/* EXP 3: RANDOM WALK */}
        {expType === "random-walk" && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
            <div className="w-full h-44 bg-slate-900/60 rounded-xl border border-slate-800 p-2 relative overflow-hidden flex items-center">
              <div className="absolute left-0 right-0 top-1/2 border-t border-slate-700 border-dashed" />
              {walkPositions.length > 1 && (
                <svg className="w-full h-full" viewBox={`0 0 ${walkPositions.length} 100`} preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    points={walkPositions.map((y, x) => `${x},${50 - y * 4}`).join(" ")}
                  />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => stepWalk(10)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
              >
                +10 Steps
              </button>
              <button
                onClick={() => stepWalk(100)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-mono text-white font-bold shadow-md"
              >
                +100 Steps (Brownian Path)
              </button>
              <button
                onClick={resetExperiment}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer KaTeX Explanation */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-purple-400 uppercase font-mono font-bold block">Theoretical Formula</span>
          {expType === "dice-sum" && (
            <MathFormula formula="P(\text{Sum}=7) = \frac{6}{36} = 0.1667 \approx 16.7\%" block />
          )}
          {expType === "coin-toss" && (
            <MathFormula formula="\lim_{N \to \infty} \frac{\text{Heads}}{N} = P(\text{Heads}) = 0.500" block />
          )}
          {expType === "random-walk" && (
            <MathFormula formula="\langle x^2 \rangle \propto N, \quad \sigma = \sqrt{N}" block />
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
          <HelpCircle size={16} className="text-purple-400 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Amber dots represent true mathematical probabilities. As the trial count $N$ grows, experimental frequencies smooth out and converge onto the exact theoretical distribution.
          </p>
        </div>
      </div>
    </div>
  );
};
