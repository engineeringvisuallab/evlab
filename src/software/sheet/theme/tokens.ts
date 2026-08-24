export interface ThemeTokens {
  mode: 'dark' | 'light';
  bgApp: string;
  bgHeader: string;
  bgRibbon: string;
  bgGridHeader: string;
  bgGridHeaderActive: string;
  bgGridCell: string;
  bgGridCellAlt: string;
  bgSidebar: string;
  bgStatusBar: string;
  bgFormulaBar: string;
  
  borderPrimary: string;
  borderGrid: string;
  borderHeader: string;
  
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  accentCyan: string;
  accentCyanHover: string;
  accentBlue: string;
  accentGreen: string;
  
  selectionFill: string;
  selectionBorder: string;
  selectionHeader: string;
  
  sheetTabActiveBg: string;
  sheetTabActiveText: string;
  sheetTabBg: string;
  sheetTabText: string;
}

export const commonTokens = {
  fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};
