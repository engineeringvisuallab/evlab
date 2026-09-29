/**
 * EVLab BOQ - Keyboard Shortcuts Reference Modal
 */

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutGuideModalProps {
  onClose: () => void;
}

export const ShortcutGuideModal: React.FC<ShortcutGuideModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + S', description: 'Save current project bundle to IndexedDB' },
    { key: 'Ctrl + K', description: 'Open Global Command Palette search' },
    { key: 'Ctrl + Z', description: 'Undo last change' },
    { key: 'Ctrl + Y', description: 'Redo previously undone change' },
    { key: 'Ctrl + F', description: 'Focus search filter in active module' },
    { key: 'Enter', description: 'Edit selected cell in BOQ grid' },
    { key: 'Delete', description: 'Delete selected BOQ item' },
    { key: 'Escape', description: 'Cancel edit / close modal dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-slate-200">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-slate-100 font-mono">Desktop Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 text-xs">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-300 font-sans">{sc.description}</span>
              <kbd className="bg-slate-950 text-cyan-300 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700 shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
          EVLab BOQ • Professional Engineering Workstation
        </div>
      </div>
    </div>
  );
};
