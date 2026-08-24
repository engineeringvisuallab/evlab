/**
 * EVLab WaterFlow - Application State Context
 * Manages model state, undo/redo history, active tools, selection, simulation results, dialogs.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  NetworkModel,
  NetworkElement,
  NetworkNode,
  NetworkLink,
  Junction,
  Reservoir,
  Tank,
  Pipe,
  Pump,
  Valve,
  ToolMode,
  ResultTheme,
  SimulationSettings,
  SimulationDiagnostics,
  ValidationIssue,
  CADAnnotation,
  getNodesList,
  getLinksList
} from '../types/waterflow';
import { createSampleCityNetwork } from '../core/sampleData/sampleNetworks';
import { HydraulicSolver } from '../core/solver/HydraulicSolver';
import { NetworkValidator } from '../core/validation/NetworkValidator';

interface WaterFlowContextType {
  // Model state
  model: NetworkModel;
  setModel: React.Dispatch<React.SetStateAction<NetworkModel>>;
  updateModel: (updater: (prev: NetworkModel) => NetworkModel) => void;
  
  // Selection
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectedElements: NetworkElement[];

  // Tools & View Mode
  activeTool: ToolMode;
  setActiveTool: (tool: ToolMode) => void;
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
  resultTheme: ResultTheme;
  setResultTheme: (theme: ResultTheme) => void;

  // Drawing State (Pipe/Link creation)
  drawingStartNodeId: string | null;
  setDrawingStartNodeId: (id: string | null) => void;

  // Snapping & Grid Options
  gridSnap: boolean;
  setGridSnap: (snap: boolean) => void;
  nodeSnap: boolean;
  setNodeSnap: (snap: boolean) => void;
  orthoMode: boolean;
  setOrthoMode: (ortho: boolean) => void;

  // Simulation & Diagnostics
  settings: SimulationSettings;
  setSettings: React.Dispatch<React.SetStateAction<SimulationSettings>>;
  diagnostics: SimulationDiagnostics | null;
  runSimulation: () => void;
  isSimulating: boolean;

  // Validation
  validationIssues: ValidationIssue[];
  runValidation: () => void;

  // Dialog Toggles
  activeDialog: string | null;
  setActiveDialog: (dialogName: string | null) => void;

  // History (Undo / Redo)
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Element Actions
  addElement: (element: NetworkElement) => void;
  updateElement: (id: string, changes: Partial<NetworkElement>) => void;
  deleteSelected: () => void;
  deleteElement: (id: string) => void;

  // Profile View Path Selection
  profileNodeIds: string[];
  setProfileNodeIds: (ids: string[]) => void;
  toggleProfileNode: (nodeId: string) => void;

  // Console Commands
  commandLogs: string[];
  executeCommand: (commandStr: string) => void;
}

const defaultSettings: SimulationSettings = {
  unitSystem: 'SI',
  flowUnit: 'LPS',
  headlossFormula: 'Hazen-Williams',
  specificGravity: 1.0,
  kinematicViscosity: 1.004e-6,
  maxIterations: 100,
  accuracyTolerance: 0.0001,
  unbalanced: 'STOP',
  isEPS: false,
  durationHours: 24,
  hydraulicStepMinutes: 60,
  patternStepMinutes: 60,
  startHour: 0
};

const WaterFlowContext = createContext<WaterFlowContextType | undefined>(undefined);

export const WaterFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load sample model on start
  const [model, setModel] = useState<NetworkModel>(createSampleCityNetwork);
  const [history, setHistory] = useState<NetworkModel[]>([]);
  const [future, setFuture] = useState<NetworkModel[]>([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Canvas Tools & Theme State
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [resultTheme, setResultTheme] = useState<ResultTheme>('pressure');
  const [drawingStartNodeId, setDrawingStartNodeId] = useState<string | null>(null);

  // Drawing Aids
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [nodeSnap, setNodeSnap] = useState<boolean>(true);
  const [orthoMode, setOrthoMode] = useState<boolean>(false);

  // Simulation & Settings State
  const [settings, setSettings] = useState<SimulationSettings>(defaultSettings);
  const [diagnostics, setDiagnostics] = useState<SimulationDiagnostics | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Validation State
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);

  // Dialog State
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Profile Path Selection
  const [profileNodeIds, setProfileNodeIds] = useState<string[]>([]);

  // Console Logs
  const [commandLogs, setCommandLogs] = useState<string[]>([
    'EVLab WaterFlow System Initialized.',
    'Loaded Metro Municipal District 4 Network.',
    'Type "HELP" or click toolbar tools to start modeling.'
  ]);

  // Helper to record state for Undo/Redo
  const pushHistory = useCallback((currentModel: NetworkModel) => {
    setHistory(prev => [...prev.slice(-30), currentModel]); // Keep up to 30 history states
    setFuture([]);
  }, []);

  const updateModel = useCallback((updater: (prev: NetworkModel) => NetworkModel) => {
    setModel(prev => {
      pushHistory(prev);
      return updater(prev);
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [model, ...prev]);
    setModel(previous);
    setHistory(prev => prev.slice(0, prev.length - 1));
  }, [history, model]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, model]);
    setModel(next);
    setFuture(prev => prev.slice(1));
  }, [future, model]);

  // Selection functions
  const selectElement = useCallback((id: string, multi = false) => {
    if (multi) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelectedIds([id]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectedElements = useMemo(() => {
    const nodes = getNodesList(model.nodes);
    const links = getLinksList(model.links);
    
    return [...nodes, ...links].filter(el => selectedIds.includes(el.id));
  }, [model, selectedIds]);

  // Run Hydraulic Simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const { updatedModel, diagnostics: diag } = HydraulicSolver.solve(model, settings);
        setModel(updatedModel);
        setDiagnostics(diag);
        setResultTheme('pressure');
        setCommandLogs(prev => [...prev, `[SIMULATION] Converged in ${diag.iterations} iterations. Total Demand: ${diag.totalSystemDemand} L/s`]);
      } catch (err: any) {
        setCommandLogs(prev => [...prev, `[SIMULATION ERROR] ${err?.message || 'Unknown error during calculation'}`]);
      } finally {
        setIsSimulating(false);
      }
    }, 100);
  }, [model, settings]);

  // Run Network Validation
  const runValidation = useCallback(() => {
    const issues = NetworkValidator.validate(model);
    setValidationIssues(issues);
    setActiveDialog('validation');
  }, [model]);

  // Execute Command Console Input
  const executeCommand = useCallback((commandStr: string) => {
    const trimmed = commandStr.trim().toUpperCase();
    if (!trimmed) return;

    setCommandLogs(prev => [...prev, `> ${commandStr}`]);

    if (trimmed === 'RUN' || trimmed === 'RUN ANALYSIS' || trimmed === 'SIMULATE') {
      runSimulation();
    } else if (trimmed === 'VALIDATE') {
      runValidation();
    } else if (trimmed === 'ZOOM EXTENTS' || trimmed === 'ZOOM ALL') {
      setCommandLogs(prev => [...prev, 'Canvas view reset to extents.']);
    } else if (trimmed === 'SELECT ALL') {
      const nodes = getNodesList(model.nodes);
      const links = getLinksList(model.links);
      setSelectedIds([...nodes.map(n => n.id), ...links.map(l => l.id)]);
    } else if (trimmed.startsWith('DRAW PIPE')) {
      setActiveTool('pipe');
    } else if (trimmed.startsWith('ADD JUNCTION')) {
      setActiveTool('junction');
    } else if (trimmed === 'CLEAR' || trimmed === 'CLS') {
      setCommandLogs([]);
    } else if (trimmed === 'HELP') {
      setCommandLogs(prev => [
        ...prev,
        'Available Commands:',
        '  RUN ANALYSIS - Run hydraulic solver',
        '  VALIDATE - Audit network topology & parameters',
        '  DRAW PIPE / ADD JUNCTION - Activate modeling tools',
        '  SELECT ALL - Select all elements',
        '  CLEAR - Clear console history'
      ]);
    } else {
      setCommandLogs(prev => [...prev, `Command "${commandStr}" unrecognized. Type HELP for command list.`]);
    }
  }, [runSimulation, runValidation, model]);

  // Add Element to Model
  const addElement = useCallback((element: NetworkElement) => {
    updateModel(prev => {
      const isNode = ['junction', 'reservoir', 'tank'].includes(element.type);
      const newNodes = new Map(prev.nodes instanceof Map ? prev.nodes : Object.entries(prev.nodes));
      const newLinks = new Map(prev.links instanceof Map ? prev.links : Object.entries(prev.links));

      if (isNode) {
        newNodes.set(element.id, element as NetworkNode);
      } else {
        newLinks.set(element.id, element as NetworkLink);
      }

      return {
        ...prev,
        nodes: newNodes,
        links: newLinks
      };
    });
  }, [updateModel]);

  // Update Element in Model
  const updateElement = useCallback((id: string, changes: Partial<NetworkElement>) => {
    updateModel(prev => {
      const newNodes = new Map(prev.nodes instanceof Map ? prev.nodes : Object.entries(prev.nodes));
      const newLinks = new Map(prev.links instanceof Map ? prev.links : Object.entries(prev.links));

      if (newNodes.has(id)) {
        const existing = newNodes.get(id)!;
        newNodes.set(id, Object.assign({}, existing, changes) as NetworkNode);
      } else if (newLinks.has(id)) {
        const existing = newLinks.get(id)!;
        newLinks.set(id, Object.assign({}, existing, changes) as NetworkLink);
      }

      return {
        ...prev,
        nodes: newNodes,
        links: newLinks
      };
    });
  }, [updateModel]);

  // Delete Element or Selected
  const deleteElement = useCallback((id: string) => {
    updateModel(prev => {
      const newNodes = new Map<string, NetworkNode>(prev.nodes instanceof Map ? prev.nodes : Object.entries(prev.nodes));
      const newLinks = new Map<string, NetworkLink>(prev.links instanceof Map ? prev.links : Object.entries(prev.links));

      // Remove node and any connected links
      if (newNodes.has(id)) {
        newNodes.delete(id);
        newLinks.forEach((link, linkId) => {
          if (link.startNodeId === id || link.endNodeId === id) {
            newLinks.delete(linkId);
          }
        });
      } else if (newLinks.has(id)) {
        newLinks.delete(id);
      }

      return {
        ...prev,
        nodes: newNodes,
        links: newLinks
      };
    });
    setSelectedIds(prev => prev.filter(x => x !== id));
  }, [updateModel]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => deleteElement(id));
    setSelectedIds([]);
  }, [selectedIds, deleteElement]);

  // Profile path node selection toggle
  const toggleProfileNode = useCallback((nodeId: string) => {
    setProfileNodeIds(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(x => x !== nodeId);
      }
      return [...prev, nodeId];
    });
  }, []);

  // Run simulation on initial load so sample network displays ready pressures and flow results immediately
  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <WaterFlowContext.Provider
      value={{
        model,
        setModel,
        updateModel,
        selectedIds,
        setSelectedIds,
        selectElement,
        clearSelection,
        selectedElements,
        activeTool,
        setActiveTool,
        viewMode,
        setViewMode,
        resultTheme,
        setResultTheme,
        drawingStartNodeId,
        setDrawingStartNodeId,
        gridSnap,
        setGridSnap,
        nodeSnap,
        setNodeSnap,
        orthoMode,
        setOrthoMode,
        settings,
        setSettings,
        diagnostics,
        runSimulation,
        isSimulating,
        validationIssues,
        runValidation,
        activeDialog,
        setActiveDialog,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        undo,
        redo,
        addElement,
        updateElement,
        deleteSelected,
        deleteElement,
        profileNodeIds,
        setProfileNodeIds,
        toggleProfileNode,
        commandLogs,
        executeCommand
      }}
    >
      {children}
    </WaterFlowContext.Provider>
  );
};

export const useWaterFlow = () => {
  const context = useContext(WaterFlowContext);
  if (!context) {
    throw new Error('useWaterFlow must be used within a WaterFlowProvider');
  }
  return context;
};
