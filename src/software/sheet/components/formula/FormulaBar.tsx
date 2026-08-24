import React, { useState, useEffect, useRef } from 'react';
import { FunctionSquare, Check, X } from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { colIndexToLabel, rangeToString } from '../../core/cell/cellUtils';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';
import { EngineeringFunctionRegistry } from '../../core/engineering/EngineeringFunctionRegistry';

export const FormulaBar: React.FC = () => {
  const {
    theme,
    activeCell,
    selectionRange,
    formulaBarValue,
    setFormulaBarValue,
    commitEditing,
    cancelEditing,
    isEditing,
    startEditing,
    selectRangeByString,
    setSidePanelTab,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  const currentCellId = rangeToString(selectionRange);
  const [nameBoxInput, setNameBoxInput] = useState(currentCellId);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameBoxInput(currentCellId);
  }, [currentCellId]);

  const handleNameBoxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectRangeByString(nameBoxInput)) {
      setNameBoxInput(currentCellId);
    }
  };

  const handleFormulaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormulaBarValue(val);

    if (val.startsWith('=')) {
      const match = val.match(/=([A-Za-z_]+)$/);
      if (match) {
        const query = match[1].toUpperCase();
        const allFuncs = [
          'SUM',
          'AVERAGE',
          'MIN',
          'MAX',
          'COUNT',
          'IF',
          'ROUND',
          'SQRT',
          ...EngineeringFunctionRegistry.getAll().map((f) => f.meta.name),
        ];
        const matched = allFuncs.filter((f) => f.startsWith(query)).slice(0, 5);
        setSuggestions(matched);
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (funcName: string) => {
    const updated = formulaBarValue.replace(/=([A-Za-z_]+)$/, `=${funcName}(`);
    setFormulaBarValue(updated);
    setSuggestions([]);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 border-b select-none text-xs relative"
      style={{
        backgroundColor: currentTheme.bgFormulaBar,
        borderColor: currentTheme.borderPrimary,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Name Box */}
      <form onSubmit={handleNameBoxSubmit} className="flex items-center">
        <input
          type="text"
          value={nameBoxInput}
          onChange={(e) => setNameBoxInput(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-24 px-2 py-1 text-center font-mono font-semibold rounded border border-slate-700/60 bg-slate-900/60 text-cyan-400 focus:outline-none focus:border-cyan-500"
          title="Name Box - Enter cell or range to jump (e.g. B10, A1:D20)"
        />
      </form>

      {/* Action Buttons: fx, Commit, Cancel */}
      <div className="flex items-center gap-1 border-x border-slate-700/40 px-2">
        <button
          onClick={() => cancelEditing()}
          className="p-1 rounded hover:bg-slate-800 text-rose-400 transition-colors"
          title="Cancel formula edit (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => commitEditing()}
          className="p-1 rounded hover:bg-slate-800 text-emerald-400 transition-colors"
          title="Accept formula edit (Enter)"
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setSidePanelTab('functions')}
          className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 transition-colors flex items-center gap-1"
          title="Open Engineering Functions Registry"
        >
          <FunctionSquare className="w-4 h-4" />
          <span className="font-mono font-bold text-[11px] italic">fx</span>
        </button>
      </div>

      {/* Formula Input Field */}
      <div className="flex-1 relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={formulaBarValue}
          onFocus={() => {
            if (!isEditing) startEditing();
          }}
          onChange={handleFormulaInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitEditing();
            } else if (e.key === 'Escape') {
              cancelEditing();
            }
          }}
          placeholder="Enter a value or formula (e.g. =SUM(A1:A10) or =PIPE_VELOCITY(50, 300))"
          className="w-full px-2.5 py-1 rounded border border-slate-700/60 bg-slate-900/40 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500 focus:bg-slate-900"
        />

        {/* Autocomplete Suggestions Popup */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-64 rounded-md border border-cyan-800 bg-slate-900 shadow-xl z-50 overflow-hidden font-mono text-xs">
            {suggestions.map((func) => (
              <button
                key={func}
                onClick={() => handleSuggestionSelect(func)}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/30 text-cyan-300 flex items-center justify-between"
              >
                <span className="font-bold">{func}</span>
                <span className="text-[10px] text-slate-400">Function</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
