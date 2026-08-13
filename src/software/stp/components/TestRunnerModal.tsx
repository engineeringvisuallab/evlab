/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Interactive Automated Unit Test Suite Modal
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TestCaseResult, Phase01TestSuite } from '../engine/tests';
import { TestTube, CheckCircle2, AlertCircle, X, Play } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = Phase01TestSuite.runAllTests();
      setTestResults(results);
      setIsRunning(false);
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = testResults.filter((r) => r.status === 'PASS').length;
  const failedCount = testResults.filter((r) => r.status === 'FAIL').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-950 text-cyan-400 rounded-lg">
              <TestTube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Phase 01 Automated Engineering Test Runner</h3>
              <p className="text-xs text-slate-400">Verifies unit conversion, parameter audit, calculations, scenarios, and serialization.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Summary Bar */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-bold">{passedCount} PASSED</span>
            <span className="text-slate-600">|</span>
            <span className={failedCount > 0 ? 'text-red-400 font-bold' : 'text-slate-500'}>{failedCount} FAILED</span>
          </div>

          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Re-Run All Tests</span>
          </button>
        </div>

        {/* Test Results Console List */}
        <div className="p-6 max-h-[450px] overflow-y-auto space-y-3 font-mono text-xs">
          {isRunning ? (
            <div className="text-center py-12 text-slate-400">
              <TestTube className="w-8 h-8 animate-bounce mx-auto text-cyan-400 mb-2" />
              <p>Executing deterministic engineering unit test assertions...</p>
            </div>
          ) : (
            testResults.map((res, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start justify-between ${
                  res.status === 'PASS'
                    ? 'bg-slate-950/60 border-emerald-900/60 text-slate-200'
                    : 'bg-red-950/30 border-red-800/60 text-red-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {res.suiteName}
                    </span>
                    <span className="font-bold text-slate-100">{res.testName}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">{res.message}</p>
                </div>

                <div className="text-right shrink-0 ml-4">
                  {res.status === 'PASS' ? (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PASS</span>
                    </span>
                  ) : (
                    <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>FAIL</span>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 block mt-1">{res.executionTimeMs} ms</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
