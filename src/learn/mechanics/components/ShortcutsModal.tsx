import React from 'react';
import { Command, Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', description: 'Select & Inspect object properties' },
    { key: 'M', description: 'Translate / Move objects' },
    { key: 'B', description: 'Add Structural Beam' },
    { key: 'F', description: 'Apply Force Vector' },
    { key: 'S', description: 'Place Boundary Support' },
    { key: 'R', description: 'Solve Current Equilibrium State' },
    { key: 'Space', description: 'Play / Pause Simulation' },
    { key: 'Ctrl + Z', description: 'Undo last model action' },
    { key: 'Ctrl + Y', description: 'Redo last model action' },
    { key: '?', description: 'Open Keyboard Shortcuts dialog' },
    { key: 'Esc', description: 'Deselect active tool / Close modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold">Engineering CAD Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200 dark:border-slate-800/60 last:border-0"
            >
              <span className="text-slate-600 dark:text-slate-300">{sc.description}</span>
              <kbd className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
