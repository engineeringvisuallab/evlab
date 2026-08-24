import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket,
  Type,
  Sigma,
  DollarSign,
  Percent,
  Binary,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';
import { NumberFormatType } from '../../types';

export const RibbonToolbar: React.FC = () => {
  const {
    theme,
    updateCellStyle,
    commitEditing,
    activeCell,
    workbookData,
    startEditing,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'engineering' | 'view'>('home');

  const activeSheet = workbookData.sheets.find((s) => s.id === workbookData.activeSheetId);
  const colLabel = String.fromCharCode(65 + activeCell.col);
  const cellId = `${colLabel}${activeCell.row + 1}`;
  const activeStyle = activeSheet?.cells[cellId]?.style || {};

  const fontFamilies = ['sans-serif', 'monospace', 'serif', 'Inter', 'Roboto', 'JetBrains Mono'];
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24];

  const toggleBold = () => updateCellStyle({ bold: !activeStyle.bold });
  const toggleItalic = () => updateCellStyle({ italic: !activeStyle.italic });
  const toggleUnderline = () => updateCellStyle({ underline: !activeStyle.underline });
  const toggleStrikethrough = () => updateCellStyle({ strikethrough: !activeStyle.strikethrough });

  const setAlignH = (align: 'left' | 'center' | 'right') => updateCellStyle({ alignHorizontal: align });
  const setAlignV = (align: 'top' | 'middle' | 'bottom') => updateCellStyle({ alignVertical: align });

  const setNumberFormat = (fmt: NumberFormatType) => updateCellStyle({ numberFormat: fmt });

  const insertQuickFormula = (funcName: string) => {
    startEditing(`=${funcName}(A1:A5)`);
  };

  return (
    <div
      className="flex flex-col border-b select-none"
      style={{
        backgroundColor: currentTheme.bgRibbon,
        borderColor: currentTheme.borderPrimary,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Ribbon Tabs Header */}
      <div className="flex items-center gap-1 px-3 pt-1 border-b border-slate-700/30 text-xs font-medium">
        {(['home', 'insert', 'engineering', 'view'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-t border-t border-x transition-colors capitalize ${
              activeTab === tab
                ? 'bg-slate-800 text-cyan-400 border-slate-700 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ribbon Controls Body */}
      <div className="flex items-center gap-3 px-3 py-1.5 overflow-x-auto text-xs min-h-[42px]">
        {activeTab === 'home' && (
          <>
            {/* Font Family & Size */}
            <div className="flex items-center gap-1 border-r border-slate-700/40 pr-3">
              <select
                value={activeStyle.fontFamily || 'sans-serif'}
                onChange={(e) => updateCellStyle({ fontFamily: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs focus:outline-none"
              >
                {fontFamilies.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <select
                value={activeStyle.fontSize || 10}
                onChange={(e) => updateCellStyle({ fontSize: Number(e.target.value) })}
                className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-xs focus:outline-none w-14"
              >
                {fontSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}pt
                  </option>
                ))}
              </select>
            </div>

            {/* Typography Styles */}
            <div className="flex items-center gap-0.5 border-r border-slate-700/40 pr-3">
              <button
                onClick={toggleBold}
                className={`p-1.5 rounded transition-colors ${
                  activeStyle.bold ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'hover:bg-slate-800'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleItalic}
                className={`p-1.5 rounded transition-colors ${
                  activeStyle.italic ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'hover:bg-slate-800'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleUnderline}
                className={`p-1.5 rounded transition-colors ${
                  activeStyle.underline ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'hover:bg-slate-800'
                }`}
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleStrikethrough}
                className={`p-1.5 rounded transition-colors ${
                  activeStyle.strikethrough ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'hover:bg-slate-800'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 border-r border-slate-700/40 pr-3">
              <button
                onClick={() => setAlignH('left')}
                className={`p-1.5 rounded ${
                  activeStyle.alignHorizontal === 'left' ? 'bg-cyan-950 text-cyan-400' : 'hover:bg-slate-800'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAlignH('center')}
                className={`p-1.5 rounded ${
                  activeStyle.alignHorizontal === 'center' ? 'bg-cyan-950 text-cyan-400' : 'hover:bg-slate-800'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAlignH('right')}
                className={`p-1.5 rounded ${
                  activeStyle.alignHorizontal === 'right' ? 'bg-cyan-950 text-cyan-400' : 'hover:bg-slate-800'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1 border-r border-slate-700/40 pr-3">
              <label className="p-1 rounded hover:bg-slate-800 cursor-pointer flex items-center gap-1" title="Fill Background Color">
                <PaintBucket className="w-3.5 h-3.5 text-cyan-400" />
                <input
                  type="color"
                  onChange={(e) => updateCellStyle({ backgroundColor: e.target.value })}
                  className="w-4 h-4 rounded cursor-pointer opacity-0 absolute"
                />
              </label>
              <label className="p-1 rounded hover:bg-slate-800 cursor-pointer flex items-center gap-1" title="Text Color">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="color"
                  onChange={(e) => updateCellStyle({ textColor: e.target.value })}
                  className="w-4 h-4 rounded cursor-pointer opacity-0 absolute"
                />
              </label>
            </div>

            {/* Number Format */}
            <div className="flex items-center gap-1 border-r border-slate-700/40 pr-3">
              <button
                onClick={() => setNumberFormat('currency')}
                className="p-1.5 rounded hover:bg-slate-800 flex items-center gap-1 text-slate-300"
                title="Format Currency"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={() => setNumberFormat('percentage')}
                className="p-1.5 rounded hover:bg-slate-800 flex items-center gap-1 text-slate-300"
                title="Format Percent"
              >
                <Percent className="w-3.5 h-3.5 text-sky-400" />
              </button>
              <button
                onClick={() => setNumberFormat('scientific')}
                className="p-1.5 rounded hover:bg-slate-800 flex items-center gap-1 text-slate-300"
                title="Scientific Notation"
              >
                <Binary className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>

            {/* Quick AutoSum */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => insertQuickFormula('SUM')}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-medium"
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>AutoSum</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'engineering' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => insertQuickFormula('PIPE_VELOCITY')}
              className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-medium hover:bg-cyan-900"
            >
              =PIPE_VELOCITY(flow, dia)
            </button>
            <button
              onClick={() => insertQuickFormula('REYNOLDS')}
              className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-medium hover:bg-cyan-900"
            >
              =REYNOLDS(vel, dia)
            </button>
            <button
              onClick={() => insertQuickFormula('CONVERT_UNIT')}
              className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-medium hover:bg-cyan-900"
            >
              =CONVERT_UNIT(val, "mm", "m")
            </button>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="text-slate-400 text-xs">
            Insert Charts, Tables, and Engineering Diagrams linked to grid ranges.
          </div>
        )}

        {activeTab === 'view' && (
          <div className="text-slate-400 text-xs">
            Toggle Gridlines, Freeze Panes, and Zoom controls.
          </div>
        )}
      </div>
    </div>
  );
};
