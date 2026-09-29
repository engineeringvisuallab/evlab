import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import {
  colIndexToLabel,
  isPositionInRange,
  normalizeRange,
  positionToCellId,
} from '../../core/cell/cellUtils';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';
import { CellPosition } from '../../types';

const INITIAL_VISIBLE_ROWS = 100;
const INITIAL_VISIBLE_COLS = 30;

export const SpreadsheetGrid: React.FC = () => {
  const {
    theme,
    workbookData,
    activeCell,
    selectionRange,
    setActiveCell,
    setSelectionRange,
    isEditing,
    editValue,
    setEditValue,
    startEditing,
    commitEditing,
    cancelEditing,
    updateCellValue,
    getFormattedCellValue,
    setColumnWidth,
    setRowHeight,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const activeSheet = workbookData.sheets.find((s) => s.id === workbookData.activeSheetId);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<CellPosition | null>(null);

  // Column / Row resize state
  const [resizingCol, setResizingCol] = useState<{ colIndex: number; startX: number; startWidth: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<{ rowIndex: number; startY: number; startHeight: number } | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const getColWidth = useCallback(
    (colIdx: number) => activeSheet?.columnWidths[colIdx] || 100,
    [activeSheet]
  );

  const getRowHeight = useCallback(
    (rowIdx: number) => activeSheet?.rowHeights[rowIdx] || 28,
    [activeSheet]
  );

  // Handle Cell Mouse Down
  const handleCellMouseDown = (pos: CellPosition, e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 2) return; // Only left or right click

    if (e.shiftKey) {
      setSelectionRange({ start: activeCell, end: pos });
    } else {
      setActiveCell(pos);
      setDragStartPos(pos);
      setIsMouseDown(true);
    }

    if (e.button === 2) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    } else {
      setContextMenu(null);
    }
  };

  // Handle Cell Mouse Over for Drag Selection
  const handleCellMouseOver = (pos: CellPosition) => {
    if (isMouseDown && dragStartPos) {
      setSelectionRange({ start: dragStartPos, end: pos });
    }
  };

  // Global Mouse Up to end drag selection or resize
  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false);
      setDragStartPos(null);
      setResizingCol(null);
      setResizingRow(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol && activeSheet) {
        const delta = e.clientX - resizingCol.startX;
        setColumnWidth(activeSheet.id, resizingCol.colIndex, resizingCol.startWidth + delta);
      } else if (resizingRow && activeSheet) {
        const delta = e.clientY - resizingRow.startY;
        setRowHeight(activeSheet.id, resizingRow.rowIndex, resizingRow.startHeight + delta);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resizingCol, resizingRow, activeSheet, setColumnWidth, setRowHeight]);

  // Keyboard Shortcuts Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing inside an input field not managed by grid, return
      if (
        document.activeElement?.tagName === 'INPUT' &&
        document.activeElement.id !== 'grid-inline-input'
      ) {
        return;
      }

      const { row, col } = activeCell;

      if (isEditing) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitEditing();
          setActiveCell({ row: row + 1, col });
        } else if (e.key === 'Tab') {
          e.preventDefault();
          commitEditing();
          setActiveCell({ row, col: col + 1 });
        } else if (e.key === 'Escape') {
          cancelEditing();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setActiveCell({ row: Math.max(0, row - 1), col }, e.shiftKey);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveCell({ row: row + 1, col }, e.shiftKey);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setActiveCell({ row, col: Math.max(0, col - 1) }, e.shiftKey);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setActiveCell({ row, col: col + 1 }, e.shiftKey);
          break;
        case 'Enter':
          e.preventDefault();
          if (e.shiftKey) {
            setActiveCell({ row: Math.max(0, row - 1), col });
          } else {
            setActiveCell({ row: row + 1, col });
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setActiveCell({ row, col: Math.max(0, col - 1) });
          } else {
            setActiveCell({ row, col: col + 1 });
          }
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          if (activeSheet) {
            const cellId = positionToCellId(activeCell);
            updateCellValue(activeSheet.id, cellId, '');
          }
          break;
        default:
          // Direct typing to start editing cell
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            startEditing(e.key);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCell,
    isEditing,
    activeSheet,
    setActiveCell,
    commitEditing,
    cancelEditing,
    startEditing,
    updateCellValue,
  ]);

  if (!activeSheet) return null;

  const normalizedSelection = normalizeRange(selectionRange);

  return (
    <div
      ref={gridRef}
      className="flex-1 overflow-auto relative select-none font-sans text-xs focus:outline-none"
      style={{
        backgroundColor: currentTheme.bgGridCell,
        color: currentTheme.textPrimary,
      }}
      tabIndex={0}
      onClick={() => setContextMenu(null)}
    >
      <table className="border-collapse table-fixed w-max">
        {/* Table Column Definitions */}
        <colgroup>
          {/* Row Header Column */}
          <col style={{ width: '45px' }} />
          {Array.from({ length: INITIAL_VISIBLE_COLS }).map((_, colIdx) => (
            <col key={colIdx} style={{ width: `${getColWidth(colIdx)}px` }} />
          ))}
        </colgroup>

        {/* Table Header: Column Letters */}
        <thead>
          <tr style={{ height: '28px' }}>
            {/* Top-Left Select-All Corner */}
            <th
              className="sticky top-0 left-0 z-30 border-r border-b font-medium text-[11px] text-center bg-slate-800 text-slate-400 cursor-pointer hover:bg-slate-700"
              style={{ borderColor: currentTheme.borderGrid }}
              onClick={() => {
                setSelectionRange({
                  start: { row: 0, col: 0 },
                  end: { row: INITIAL_VISIBLE_ROWS - 1, col: INITIAL_VISIBLE_COLS - 1 },
                });
              }}
            >
              ◢
            </th>

            {/* Column Headers A, B, C... */}
            {Array.from({ length: INITIAL_VISIBLE_COLS }).map((_, colIdx) => {
              const isColSelected =
                colIdx >= normalizedSelection.start.col && colIdx <= normalizedSelection.end.col;

              return (
                <th
                  key={colIdx}
                  className={`sticky top-0 z-20 border-r border-b font-semibold text-[11px] text-center relative select-none transition-colors ${
                    isColSelected
                      ? 'bg-cyan-950/80 text-cyan-300 font-bold border-cyan-800'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                  }`}
                  style={{
                    borderColor: currentTheme.borderGrid,
                    backgroundColor: isColSelected ? currentTheme.selectionHeader : currentTheme.bgGridHeader,
                  }}
                  onClick={(e) => {
                    setSelectionRange({
                      start: { row: 0, col: colIdx },
                      end: { row: INITIAL_VISIBLE_ROWS - 1, col: colIdx },
                    });
                  }}
                >
                  {colIndexToLabel(colIdx)}

                  {/* Column Resizer Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-cyan-500 z-30"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingCol({
                        colIndex: colIdx,
                        startX: e.clientX,
                        startWidth: getColWidth(colIdx),
                      });
                    }}
                  />
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body: Cells */}
        <tbody>
          {Array.from({ length: INITIAL_VISIBLE_ROWS }).map((_, rowIdx) => {
            const isRowSelected =
              rowIdx >= normalizedSelection.start.row && rowIdx <= normalizedSelection.end.row;

            return (
              <tr key={rowIdx} style={{ height: `${getRowHeight(rowIdx)}px` }}>
                {/* Row Header Number */}
                <td
                  className={`sticky left-0 z-10 border-r border-b font-mono text-[11px] text-center select-none relative ${
                    isRowSelected
                      ? 'bg-cyan-950/80 text-cyan-300 font-bold border-cyan-800'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700/80'
                  }`}
                  style={{
                    borderColor: currentTheme.borderGrid,
                    backgroundColor: isRowSelected ? currentTheme.selectionHeader : currentTheme.bgGridHeader,
                  }}
                  onClick={(e) => {
                    setSelectionRange({
                      start: { row: rowIdx, col: 0 },
                      end: { row: rowIdx, col: INITIAL_VISIBLE_COLS - 1 },
                    });
                  }}
                >
                  {rowIdx + 1}

                  {/* Row Resizer Handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1.5 cursor-row-resize hover:bg-cyan-500 z-30"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingRow({
                        rowIndex: rowIdx,
                        startY: e.clientY,
                        startHeight: getRowHeight(rowIdx),
                      });
                    }}
                  />
                </td>

                {/* Spreadsheet Data Cells */}
                {Array.from({ length: INITIAL_VISIBLE_COLS }).map((_, colIdx) => {
                  const pos = { row: rowIdx, col: colIdx };
                  const cellId = positionToCellId(pos);
                  const cell = activeSheet.cells[cellId];

                  const isActive = activeCell.row === rowIdx && activeCell.col === colIdx;
                  const isSelected = isPositionInRange(pos, selectionRange);

                  const displayVal = getFormattedCellValue(cell);
                  const style = cell?.style || {};

                  return (
                    <td
                      key={colIdx}
                      onMouseDown={(e) => handleCellMouseDown(pos, e)}
                      onMouseOver={() => handleCellMouseOver(pos)}
                      onDoubleClick={() => startEditing()}
                      className={`border-r border-b px-1.5 overflow-hidden text-ellipsis whitespace-nowrap relative transition-colors cursor-cell ${
                        isActive
                          ? 'z-20 ring-2 ring-cyan-400 bg-cyan-950/20'
                          : isSelected
                          ? 'bg-cyan-950/30'
                          : ''
                      }`}
                      style={{
                        borderColor: currentTheme.borderGrid,
                        backgroundColor: isActive
                          ? undefined
                          : isSelected
                          ? currentTheme.selectionFill
                          : style.backgroundColor || currentTheme.bgGridCell,
                        color: style.textColor || currentTheme.textPrimary,
                        fontWeight: style.bold ? 'bold' : 'normal',
                        fontStyle: style.italic ? 'italic' : 'normal',
                        textDecoration: [
                          style.underline ? 'underline' : '',
                          style.strikethrough ? 'line-through' : '',
                        ]
                          .filter(Boolean)
                          .join(' '),
                        textAlign: style.alignHorizontal || (typeof cell?.value === 'number' ? 'right' : 'left'),
                        fontSize: style.fontSize ? `${style.fontSize}pt` : '10pt',
                        fontFamily: style.fontFamily || 'sans-serif',
                      }}
                    >
                      {/* Active In-Cell Editor */}
                      {isActive && isEditing ? (
                        <input
                          id="grid-inline-input"
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          className="w-full h-full bg-slate-900 text-cyan-300 font-mono text-xs px-1 border-none focus:outline-none"
                        />
                      ) : (
                        <span>{displayVal}</span>
                      )}

                      {/* Corner Fill Handle for Active Cell */}
                      {isActive && !isEditing && (
                        <div className="absolute right-0 bottom-0 w-2 h-2 bg-cyan-400 cursor-crosshair z-30 shadow-sm" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-md border border-cyan-800 bg-slate-900 shadow-2xl py-1 text-xs font-medium w-44"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              startEditing();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/30 text-slate-200"
          >
            Edit Cell
          </button>
          <button
            onClick={() => {
              if (activeSheet) {
                updateCellValue(activeSheet.id, positionToCellId(activeCell), '');
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/30 text-slate-200"
          >
            Clear Content
          </button>
          <div className="h-[1px] bg-slate-800 my-1" />
          <button
            onClick={() => setContextMenu(null)}
            className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/30 text-cyan-400 font-semibold"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
