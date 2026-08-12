import React from 'react';
import { useGIS } from '../../context/GISContext';
import { History, X, CheckCircle2 } from 'lucide-react';

export const HistoryPanelModal: React.FC = () => {
  const { historyStack, historyIndex, isHistoryPanelOpen, setIsHistoryPanelOpen } = useGIS();

  if (!isHistoryPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-xs text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <History size={18} />
            <span>Project History Log</span>
          </div>
          <button
            onClick={() => setIsHistoryPanelOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* History Stack List */}
        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {historyStack.map((item, idx) => {
            const isCurrent = idx === historyIndex;

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  isCurrent
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-semibold shadow'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrent && <CheckCircle2 size={15} className="text-cyan-400" />}
                  <span>{item.description}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{item.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsHistoryPanelOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
