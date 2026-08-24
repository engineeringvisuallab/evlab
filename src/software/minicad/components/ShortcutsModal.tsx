import React from 'react';
import { X, Command, MousePointer, HelpCircle } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Drawing Tools',
      shortcuts: [
        { key: 'L', description: 'Line Tool' },
        { key: 'P', description: 'Polyline Tool' },
        { key: 'R', description: 'Rectangle Tool' },
        { key: 'C', description: 'Circle Tool' },
        { key: 'A', description: 'Arc Tool' },
        { key: 'T', description: 'Text Tool' },
        { key: 'D', description: 'Dimension / Measure Tool' },
        { key: 'S', description: 'Select Tool' },
      ],
    },
    {
      title: 'Navigation & Canvas',
      shortcuts: [
        { key: 'Mouse Wheel', description: 'Zoom In / Out relative to cursor' },
        { key: 'Middle Mouse Drag', description: 'Pan drawing canvas' },
        { key: 'Spacebar Drag', description: 'Pan drawing canvas' },
        { key: 'Z + E', description: 'Zoom Extents (Fit All)' },
        { key: 'Esc', description: 'Cancel current tool / Deselect' },
      ],
    },
    {
      title: 'Toggles & Precision Snaps',
      shortcuts: [
        { key: 'F3', description: 'Toggle Object Snaps (Endpoint, Midpoint, Center)' },
        { key: 'F7', description: 'Toggle Grid' },
        { key: 'F8 / Shift', description: 'Toggle Ortho Mode (Horizontal/Vertical constraints)' },
      ],
    },
    {
      title: 'Editing & Modify Commands',
      shortcuts: [
        { key: 'M / MOVE', description: 'Move selected object(s)' },
        { key: 'CO / COPY', description: 'Copy selected object(s)' },
        { key: 'RO / ROTATE', description: 'Rotate selected object(s)' },
        { key: 'MI / MIRROR', description: 'Mirror selected object(s)' },
        { key: 'SC / SCALE', description: 'Scale selected object(s)' },
        { key: 'TR / TRIM', description: 'Trim object portion at intersection' },
        { key: 'EX / EXTEND', description: 'Extend line/arc to nearest boundary' },
        { key: 'O / OFFSET', description: 'Offset parallel / concentric curve' },
        { key: 'F / FILLET', description: 'Fillet rounded arc corner' },
        { key: 'CHA / CHAMFER', description: 'Chamfer bevel corner' },
        { key: 'BR / BREAK', description: 'Break object between two points' },
        { key: 'J / JOIN', description: 'Join connected lines/polylines' },
        { key: 'X / EXPLODE', description: 'Explode rectangle/polyline to lines' },
        { key: 'E / Delete', description: 'Erase / Delete object(s)' },
        { key: 'Ctrl + Z / Ctrl + Y', description: 'Undo / Redo' },
        { key: 'Ctrl + A', description: 'Select all objects' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#20232b] border border-[#3a3f4e] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs text-gray-200">
        {/* Header */}
        <div className="bg-[#181a20] px-4 py-3 border-b border-[#3a3f4e] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>EVL Mini CAD - Keyboard Shortcuts & Controls</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2e3340] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh] grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="bg-[#191b21] p-3 rounded-lg border border-[#2e3341] space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                {group.title}
              </div>

              <div className="space-y-1.5">
                {group.shortcuts.map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <span className="text-gray-300">{s.description}</span>
                    <kbd className="bg-[#2a2f3d] text-white font-mono px-2 py-0.5 rounded border border-[#3e4558] font-semibold text-[10px] shadow-sm">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#181a20] px-4 py-2.5 border-t border-[#3a3f4e] flex justify-between items-center text-gray-400 text-[11px]">
          <span>EVL Mini CAD • Precision HTML5 CAD System</span>
          <button
            onClick={onClose}
            className="bg-[#0078d4] hover:bg-[#106ebe] text-white px-3 py-1 rounded font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
