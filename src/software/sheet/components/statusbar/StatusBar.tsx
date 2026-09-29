import React from 'react';
import { ZoomIn, ZoomOut, CheckCircle, Edit3 } from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';
import { rangeToString } from '../../core/cell/cellUtils';

export const StatusBar: React.FC = () => {
  const {
    theme,
    statusMessage,
    isEditing,
    selectionRange,
    getSelectionStats,
    zoom,
    setZoom,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const stats = getSelectionStats();
  const selectedRangeStr = rangeToString(selectionRange);

  return (
    <div
      className="flex items-center justify-between px-3 py-1 border-t select-none text-[11px] font-mono h-7"
      style={{
        backgroundColor: currentTheme.bgStatusBar,
        borderColor: currentTheme.borderPrimary,
        color: currentTheme.textSecondary,
      }}
    >
      {/* Left: Status Message & Cell Location */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
          {isEditing ? (
            <Edit3 className="w-3 h-3 text-amber-400 animate-pulse" />
          ) : (
            <CheckCircle className="w-3 h-3 text-emerald-400" />
          )}
          <span>{isEditing ? 'EDITING' : 'READY'}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700/50" />

        <div className="text-slate-300 font-bold">{statusMessage}</div>

        <div className="h-3 w-[1px] bg-slate-700/50" />

        <div className="text-slate-400">
          Selection: <span className="text-cyan-300 font-bold">{selectedRangeStr}</span>
        </div>
      </div>

      {/* Middle: Selection Statistics */}
      {stats.count > 0 && (
        <div className="flex items-center gap-3 text-slate-300">
          {stats.numericCount > 0 && (
            <>
              <div>
                Average: <span className="text-cyan-300 font-bold">{stats.average.toFixed(2)}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700/50" />
              <div>
                Count: <span className="text-cyan-300 font-bold">{stats.numericCount}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700/50" />
              <div>
                Sum: <span className="text-emerald-400 font-bold">{stats.sum.toFixed(2)}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700/50" />
              <div>
                Min: <span className="text-sky-300 font-bold">{stats.min.toFixed(2)}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700/50" />
              <div>
                Max: <span className="text-purple-300 font-bold">{stats.max.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Right: Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(zoom - 10)}
          className="p-0.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <span className="w-10 text-center text-cyan-300 font-bold">{zoom}%</span>

        <button
          onClick={() => setZoom(zoom + 10)}
          className="p-0.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
          title="Zoom In"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
