import React, { useState } from 'react';
import { Plus, MoreVertical, Trash2, Copy, Edit2 } from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';

export const SheetTabBar: React.FC = () => {
  const {
    theme,
    workbookData,
    setActiveSheet,
    addSheet,
    renameSheet,
    deleteSheet,
    duplicateSheet,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [activeMenuSheetId, setActiveMenuSheetId] = useState<string | null>(null);

  const handleStartRename = (sheetId: string, currentName: string) => {
    setEditingSheetId(sheetId);
    setRenameInput(currentName);
    setActiveMenuSheetId(null);
  };

  const handleConfirmRename = (sheetId: string) => {
    if (renameInput.trim()) {
      renameSheet(sheetId, renameInput.trim());
    }
    setEditingSheetId(null);
  };

  return (
    <div
      className="flex items-center gap-1 px-2 border-t select-none text-xs font-medium h-9 overflow-x-auto relative"
      style={{
        backgroundColor: currentTheme.bgHeader,
        borderColor: currentTheme.borderPrimary,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Sheet Tabs */}
      <div className="flex items-center gap-1">
        {workbookData.sheets.map((sheet) => {
          const isActive = sheet.id === workbookData.activeSheetId;

          return (
            <div
              key={sheet.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t border-t border-x cursor-pointer transition-all relative ${
                isActive
                  ? 'bg-slate-900 text-cyan-400 border-cyan-500 font-bold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
              }`}
              onClick={() => setActiveSheet(sheet.id)}
            >
              {editingSheetId === sheet.id ? (
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onBlur={() => handleConfirmRename(sheet.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename(sheet.id);
                  }}
                  autoFocus
                  className="w-24 px-1 bg-slate-900 border border-cyan-400 rounded text-cyan-300 text-xs focus:outline-none"
                />
              ) : (
                <span onDoubleClick={() => handleStartRename(sheet.id, sheet.name)}>
                  {sheet.name}
                </span>
              )}

              {/* Sheet Context Menu Trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuSheetId(activeMenuSheetId === sheet.id ? null : sheet.id);
                }}
                className="p-0.5 rounded hover:bg-slate-700/60 transition-colors"
              >
                <MoreVertical className="w-3 h-3 text-slate-400" />
              </button>

              {/* Sheet Context Options Popup */}
              {activeMenuSheetId === sheet.id && (
                <div
                  className="absolute left-0 bottom-full mb-1 w-36 rounded-md border border-slate-700 bg-slate-900 shadow-xl z-50 py-1 font-normal text-xs text-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStartRename(sheet.id, sheet.name)}
                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/30 flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3 text-cyan-400" />
                    <span>Rename</span>
                  </button>

                  <button
                    onClick={() => {
                      duplicateSheet(sheet.id);
                      setActiveMenuSheetId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/30 flex items-center gap-2"
                  >
                    <Copy className="w-3 h-3 text-amber-400" />
                    <span>Duplicate</span>
                  </button>

                  {workbookData.sheets.length > 1 && (
                    <button
                      onClick={() => {
                        deleteSheet(sheet.id);
                        setActiveMenuSheetId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-rose-600/30 text-rose-400 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Sheet (+) Button */}
      <button
        onClick={() => addSheet()}
        className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 border border-slate-700/80 transition-colors ml-1"
        title="Add new worksheet"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
