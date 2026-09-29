import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GISProject,
  GISLayer,
  GISFeature,
  ActiveTool,
  SnappingSettings,
  SymbologyConfig,
  LabelConfig,
  FieldDefinition,
  EditSession,
  CommandLogEntry,
} from '../types/gis';
import { createWaterNetworkSampleProject } from '../services/sampleProjects';
import {
  getAllProjectsFromDB,
  saveProjectToDB,
  getProjectFromDB,
  deleteProjectFromDB,
} from '../services/storage';
import { calculateLayerExtent, calculateFeaturesExtent } from '../services/turfAnalysis';
import {
  moveGeometry,
  rotateGeometry,
  scaleGeometry,
  splitLineGeometry,
  mergeGeometries,
  offsetLineGeometry,
  insertVertexInGeometry,
  moveVertexInGeometry,
  deleteVertexFromGeometry,
  repairGeometry,
} from '../services/cadEngine';

interface HistoryState {
  description: string;
  project: GISProject;
  timestamp: string;
}

export type SelectionMode = 'new' | 'add' | 'remove' | 'toggle';

interface GISContextType {
  project: GISProject;
  setProject: React.Dispatch<React.SetStateAction<GISProject>>;
  allProjects: GISProject[];
  refreshProjectList: () => Promise<void>;

  // Navigation & View
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  flyToExtent: [number, number, number, number] | null;
  setFlyToExtent: (extent: [number, number, number, number] | null) => void;
  zoomToLayer: (layerId: string) => void;
  zoomToFeatures: (featureIds: string[]) => void;

  // Selection
  selectedFeatureIds: string[];
  setSelectedFeatureIds: (ids: string[]) => void;
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  selectFeatures: (ids: string[], mode?: SelectionMode) => void;
  selectAllInLayer: (layerId?: string) => void;
  clearSelection: () => void;
  invertSelection: (layerId?: string) => void;

  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;

  // Edit Sessions
  editSession: EditSession | null;
  startEditingLayer: (layerId: string) => void;
  saveLayerEdits: () => void;
  cancelLayerEdits: () => void;
  toggleLayerLock: (layerId: string) => void;

  // Modals & Panels
  isAttributeTableOpen: boolean;
  setIsAttributeTableOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isLayoutEditorOpen: boolean;
  setIsLayoutEditorOpen: (open: boolean) => void;
  isSymbologyModalOpen: boolean;
  setIsSymbologyModalOpen: (open: boolean) => void;
  isAddDataModalOpen: boolean;
  setIsAddDataModalOpen: (open: boolean) => void;
  isAnalysisModalOpen: boolean;
  setIsAnalysisModalOpen: (open: boolean) => void;
  isQueryBuilderOpen: boolean;
  setIsQueryBuilderOpen: (open: boolean) => void;
  isElevationProfileOpen: boolean;
  setIsElevationProfileOpen: (open: boolean) => void;
  isHistoryPanelOpen: boolean;
  setIsHistoryPanelOpen: (open: boolean) => void;
  isFieldManagerOpen: boolean;
  setIsFieldManagerOpen: (open: boolean) => void;
  isGeometryValidationOpen: boolean;
  setIsGeometryValidationOpen: (open: boolean) => void;

  // Snapping & Measurement
  snappingSettings: SnappingSettings;
  setSnappingSettings: React.Dispatch<React.SetStateAction<SnappingSettings>>;
  elevationProfileLine: [number, number][] | null;
  setElevationProfileLine: (line: [number, number][] | null) => void;

  // History Undo/Redo
  historyStack: HistoryState[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  pushHistory: (description: string, updatedProject: GISProject) => void;

  // Command Console Log
  commandLog: CommandLogEntry[];
  logCommand: (text: string, category?: CommandLogEntry['category']) => void;

  // Layer & Feature operations
  addLayer: (layer: GISLayer) => void;
  removeLayer: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  reorderLayers: (layers: GISLayer[]) => void;
  addFeatureToLayer: (layerId: string, feature: GISFeature) => void;
  updateFeatureProperties: (layerId: string, featureId: string, properties: Record<string, any>) => void;
  updateFeatureGeometry: (layerId: string, featureId: string, geometry: any) => void;
  deleteSelectedFeatures: () => void;
  updateLayerSymbology: (layerId: string, symbology: SymbologyConfig) => void;
  updateLayerLabels: (layerId: string, labelConfig: LabelConfig) => void;

  // Field Management & Templates
  addFieldToLayer: (layerId: string, field: FieldDefinition) => void;
  updateFieldInLayer: (layerId: string, fieldName: string, updates: Partial<FieldDefinition>) => void;
  deleteFieldFromLayer: (layerId: string, fieldName: string) => void;
  applyEngineeringTemplate: (
    layerId: string,
    templateKey: 'water_pipe' | 'valve' | 'hydrant' | 'road' | 'drain' | 'parcel'
  ) => void;

  // Geometry Transformations
  moveSelectedFeatures: (deltaLng: number, deltaLat: number) => void;
  rotateSelectedFeatures: (angleDegrees: number) => void;
  scaleSelectedFeatures: (scaleFactor: number) => void;
  duplicateSelectedFeatures: () => void;
  splitSelectedLine: (splitPoint: [number, number]) => void;
  mergeSelectedFeatures: () => void;
  offsetSelectedLine: (distanceMeters: number) => void;
  repairSelectedGeometries: () => void;

  // Vertex Editing
  vertexInsert: (layerId: string, featureId: string, segmentIndex: number, coord: [number, number]) => void;
  vertexMove: (layerId: string, featureId: string, vertexIndex: number, coord: [number, number]) => void;
  vertexDelete: (layerId: string, featureId: string, vertexIndex: number) => void;

  // Project Management
  loadProjectById: (id: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  exportProjectJSON: () => void;
  createNewProject: (name: string, description: string) => Promise<void>;
  loadSampleProject: () => void;
  deleteProjectById: (id: string) => Promise<void>;
  setBasemap: (basemapId: string) => void;
}

const defaultSnapping: SnappingSettings = {
  enabled: true,
  tolerancePixels: 15,
  vertex: true,
  edge: true,
  endpoint: true,
  midpoint: true,
  intersection: true,
  nearest: false,
  perpendicular: false,
  targetLayers: 'visible',
};

const initialSample = createWaterNetworkSampleProject();

const GISContext = createContext<GISContextType | undefined>(undefined);

export const GISProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<GISProject>(initialSample);
  const [allProjects, setAllProjects] = useState<GISProject[]>([initialSample]);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('new');
  const [activeLayerId, setActiveLayerId] = useState<string | null>(initialSample.layers[0]?.id || null);
  const [flyToExtent, setFlyToExtent] = useState<[number, number, number, number] | null>(null);

  // Edit Session State
  const [editSession, setEditSession] = useState<EditSession | null>(null);

  // Command Console Log
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([
    {
      id: 'cmd-1',
      timestamp: new Date().toLocaleTimeString(),
      text: 'EVLab GIS Engine initialized successfully.',
      category: 'system',
    },
  ]);

  const logCommand = useCallback((text: string, category: CommandLogEntry['category'] = 'system') => {
    setCommandLog((prev) => [
      ...prev.slice(-99),
      { id: `cmd-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), text, category },
    ]);
  }, []);

  // UI Panels
  const [isAttributeTableOpen, setIsAttributeTableOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLayoutEditorOpen, setIsLayoutEditorOpen] = useState(false);
  const [isSymbologyModalOpen, setIsSymbologyModalOpen] = useState(false);
  const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
  const [isElevationProfileOpen, setIsElevationProfileOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isFieldManagerOpen, setIsFieldManagerOpen] = useState(false);
  const [isGeometryValidationOpen, setIsGeometryValidationOpen] = useState(false);

  const [snappingSettings, setSnappingSettings] = useState<SnappingSettings>(defaultSnapping);
  const [elevationProfileLine, setElevationProfileLine] = useState<[number, number][] | null>(null);

  // History Stack
  const [historyStack, setHistoryStack] = useState<HistoryState[]>([
    { description: 'Initial Project Loaded', project: initialSample, timestamp: new Date().toLocaleTimeString() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((description: string, updatedProject: GISProject) => {
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const newStack = [
        ...sliced.slice(-99),
        { description, project: updatedProject, timestamp: new Date().toLocaleTimeString() },
      ];
      return newStack;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 99));
    logCommand(description, 'edit');
  }, [historyIndex, logCommand]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetState = historyStack[prevIndex];
      setProject(targetState.project);
      setHistoryIndex(prevIndex);
      logCommand(`Undo: ${targetState.description}`, 'system');
    }
  };

  const redo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetState = historyStack[nextIndex];
      setProject(targetState.project);
      setHistoryIndex(nextIndex);
      logCommand(`Redo: ${targetState.description}`, 'system');
    }
  };

  // Zooming
  const zoomToLayer = useCallback((layerId: string) => {
    const targetLayer = project.layers.find((l) => l.id === layerId);
    if (!targetLayer) return;
    const extent = calculateLayerExtent(targetLayer);
    if (extent) {
      setFlyToExtent(extent);
      logCommand(`Zoomed to extent of layer "${targetLayer.name}"`, 'select');
    }
  }, [project.layers, logCommand]);

  const zoomToFeatures = useCallback((featureIds: string[]) => {
    if (!featureIds || featureIds.length === 0) return;
    const allFeatures = project.layers.flatMap((l) => l.features).filter((f) => featureIds.includes(f.id));
    const extent = calculateFeaturesExtent(allFeatures);
    if (extent) {
      setFlyToExtent(extent);
      logCommand(`Zoomed to ${featureIds.length} selected feature(s)`, 'select');
    }
  }, [project.layers, logCommand]);

  // Advanced Selection Engine
  const selectFeatures = (ids: string[], mode: SelectionMode = selectionMode) => {
    setSelectedFeatureIds((prev) => {
      let updated: string[] = [];
      if (mode === 'new') {
        updated = ids;
      } else if (mode === 'add') {
        updated = Array.from(new Set([...prev, ...ids]));
      } else if (mode === 'remove') {
        updated = prev.filter((id) => !ids.includes(id));
      } else if (mode === 'toggle') {
        const set = new Set<string>(prev);
        ids.forEach((id) => {
          if (set.has(id)) set.delete(id);
          else set.add(id);
        });
        updated = Array.from(set);
      }
      logCommand(`Selection updated (${updated.length} feature(s) selected)`, 'select');
      return updated;
    });
  };

  const selectAllInLayer = (targetLayerId?: string) => {
    const layerToSelect = project.layers.find((l) => l.id === (targetLayerId || activeLayerId));
    if (!layerToSelect) return;
    const allIds = layerToSelect.features.map((f) => f.id);
    setSelectedFeatureIds(allIds);
    logCommand(`Selected all ${allIds.length} feature(s) in layer "${layerToSelect.name}"`, 'select');
  };

  const clearSelection = () => {
    setSelectedFeatureIds([]);
    logCommand('Selection cleared', 'select');
  };

  const invertSelection = (targetLayerId?: string) => {
    const layerToSelect = project.layers.find((l) => l.id === (targetLayerId || activeLayerId));
    if (!layerToSelect) return;
    const currentSet = new Set(selectedFeatureIds);
    const inverted = layerToSelect.features.map((f) => f.id).filter((id) => !currentSet.has(id));
    setSelectedFeatureIds(inverted);
    logCommand(`Inverted selection in "${layerToSelect.name}" (${inverted.length} selected)`, 'select');
  };

  // Edit Sessions
  const startEditingLayer = (layerId: string) => {
    const targetLayer = project.layers.find((l) => l.id === layerId);
    if (!targetLayer || targetLayer.locked) {
      logCommand(`Cannot edit layer "${targetLayer?.name || layerId}" - layer is locked or unavailable.`, 'system');
      return;
    }
    const snapshot: GISLayer = JSON.parse(JSON.stringify(targetLayer));
    setEditSession({
      layerId,
      startedAt: new Date().toISOString(),
      initialSnapshot: snapshot,
      modifiedFeatureIds: [],
    });
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, isEditing: true } : l)),
    }));
    setActiveLayerId(layerId);
    logCommand(`Started editing session on layer "${targetLayer.name}"`, 'edit');
  };

  const saveLayerEdits = () => {
    if (!editSession) return;
    const targetLayer = project.layers.find((l) => l.id === editSession.layerId);
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === editSession.layerId ? { ...l, isEditing: false } : l)),
    }));
    if (targetLayer) {
      pushHistory(`Saved edits on layer "${targetLayer.name}"`, project);
      logCommand(`Saved edits on layer "${targetLayer.name}"`, 'edit');
    }
    setEditSession(null);
  };

  const cancelLayerEdits = () => {
    if (!editSession) return;
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === editSession.layerId ? { ...editSession.initialSnapshot, isEditing: false } : l
      ),
    }));
    logCommand(`Discarded edits on layer session`, 'edit');
    setEditSession(null);
  };

  const toggleLayerLock = (layerId: string) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) =>
        l.id === layerId ? { ...l, locked: !l.locked } : l
      );
      const updated = { ...prev, layers: updatedLayers };
      const target = updatedLayers.find((l) => l.id === layerId);
      pushHistory(`${target?.locked ? 'Locked' : 'Unlocked'} layer "${target?.name}"`, updated);
      return updated;
    });
  };

  // Layer Operations
  const addLayer = (layer: GISLayer) => {
    setProject((prev) => {
      const updatedLayers = [layer, ...prev.layers];
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Added Layer "${layer.name}"`, updated);
      return updated;
    });
    setActiveLayerId(layer.id);
  };

  const removeLayer = (layerId: string) => {
    setProject((prev) => {
      const target = prev.layers.find((l) => l.id === layerId);
      const updatedLayers = prev.layers.filter((l) => l.id !== layerId);
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Removed Layer "${target?.name || layerId}"`, updated);
      return updated;
    });
    if (activeLayerId === layerId) {
      setActiveLayerId(project.layers.find((l) => l.id !== layerId)?.id || null);
    }
  };

  const renameLayer = (layerId: string, name: string) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => (l.id === layerId ? { ...l, name } : l));
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Renamed Layer to "${name}"`, updated);
      return updated;
    });
  };

  const toggleLayerVisibility = (layerId: string) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    }));
  };

  const setLayerOpacity = (layerId: string, opacity: number) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, opacity } : l)),
    }));
  };

  const reorderLayers = (layers: GISLayer[]) => {
    setProject((prev) => ({ ...prev, layers }));
  };

  // Feature Operations
  const addFeatureToLayer = (layerId: string, feature: GISFeature) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          if (l.locked) return l;
          return { ...l, features: [...l.features, feature] };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Added feature to layer`, updated);
      return updated;
    });
  };

  const updateFeatureProperties = (layerId: string, featureId: string, properties: Record<string, any>) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          if (l.locked) return l;
          return {
            ...l,
            features: l.features.map((f) => (f.id === featureId ? { ...f, properties } : f)),
          };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Updated feature properties`, updated);
      return updated;
    });
  };

  const updateFeatureGeometry = (layerId: string, featureId: string, geometry: any) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          if (l.locked) return l;
          return {
            ...l,
            features: l.features.map((f) => (f.id === featureId ? { ...f, geometry } : f)),
          };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Modified feature geometry`, updated);
      return updated;
    });
  };

  const deleteSelectedFeatures = () => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        return {
          ...l,
          features: l.features.filter((f) => !selectedFeatureIds.includes(f.id)),
        };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Deleted ${selectedFeatureIds.length} selected feature(s)`, updated);
      return updated;
    });
    setSelectedFeatureIds([]);
  };

  // Field Management & Templates
  const addFieldToLayer = (layerId: string, field: FieldDefinition) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          if (l.fields.some((f) => f.name === field.name)) return l;
          // Set default value on existing features
          const updatedFeatures = l.features.map((f) => ({
            ...f,
            properties: {
              ...f.properties,
              [field.name]: f.properties[field.name] ?? field.defaultValue ?? null,
            },
          }));
          return { ...l, fields: [...l.fields, field], features: updatedFeatures };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Added Field "${field.name}" to Layer`, updated);
      return updated;
    });
  };

  const updateFieldInLayer = (layerId: string, fieldName: string, updates: Partial<FieldDefinition>) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          const updatedFields = l.fields.map((f) => (f.name === fieldName ? { ...f, ...updates } : f));
          return { ...l, fields: updatedFields };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Updated Field "${fieldName}" in Layer`, updated);
      return updated;
    });
  };

  const deleteFieldFromLayer = (layerId: string, fieldName: string) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          const updatedFields = l.fields.filter((f) => f.name !== fieldName);
          const updatedFeatures = l.features.map((f) => {
            const props = { ...f.properties };
            delete props[fieldName];
            return { ...f, properties: props };
          });
          return { ...l, fields: updatedFields, features: updatedFeatures };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Deleted Field "${fieldName}" from Layer`, updated);
      return updated;
    });
  };

  const applyEngineeringTemplate = (
    layerId: string,
    templateKey: 'water_pipe' | 'valve' | 'hydrant' | 'road' | 'drain' | 'parcel'
  ) => {
    let templateFields: FieldDefinition[] = [];

    if (templateKey === 'water_pipe') {
      templateFields = [
        { name: 'Pipe_ID', type: 'string', alias: 'Pipe ID', required: true },
        { name: 'Diameter_mm', type: 'integer', alias: 'Diameter (mm)', defaultValue: 200 },
        { name: 'Material', type: 'string', alias: 'Material', domain: ['DI', 'HDPE', 'PVC', 'GI', 'Steel'] },
        { name: 'Length_m', type: 'double', alias: 'Length (m)' },
        { name: 'Status', type: 'string', alias: 'Pipe Status', domain: ['Existing', 'Proposed', 'Abandoned'] },
        { name: 'Roughness_C', type: 'integer', alias: 'Hazen-Williams C', defaultValue: 130 },
        { name: 'Install_Year', type: 'integer', alias: 'Installation Year', defaultValue: 2024 },
      ];
    } else if (templateKey === 'valve') {
      templateFields = [
        { name: 'Valve_ID', type: 'string', alias: 'Valve ID', required: true },
        { name: 'Type', type: 'string', alias: 'Valve Type', domain: ['Gate', 'Butterfly', 'PRV', 'Check', 'Air Release'] },
        { name: 'Diameter_mm', type: 'integer', alias: 'Diameter (mm)', defaultValue: 150 },
        { name: 'Status', type: 'string', alias: 'Valve Status', domain: ['Open', 'Closed', 'Throttled'] },
      ];
    } else if (templateKey === 'hydrant') {
      templateFields = [
        { name: 'Hydrant_ID', type: 'string', alias: 'Hydrant ID', required: true },
        { name: 'Type', type: 'string', alias: 'Hydrant Type', domain: ['Dry Barrel', 'Wet Barrel'] },
        { name: 'Flow_GPM', type: 'integer', alias: 'Rated Flow (GPM)', defaultValue: 1000 },
        { name: 'Status', type: 'string', alias: 'Status', domain: ['Operational', 'Out of Service'] },
      ];
    } else if (templateKey === 'road') {
      templateFields = [
        { name: 'Road_ID', type: 'string', alias: 'Road ID', required: true },
        { name: 'Name', type: 'string', alias: 'Road Name' },
        { name: 'Width_m', type: 'double', alias: 'Width (m)', defaultValue: 7.0 },
        { name: 'Surface', type: 'string', alias: 'Pavement Surface', domain: ['Asphalt', 'Concrete', 'Gravel', 'Unpaved'] },
        { name: 'Class', type: 'string', alias: 'Road Classification', domain: ['Arterial', 'Collector', 'Local', 'Highway'] },
      ];
    } else if (templateKey === 'drain') {
      templateFields = [
        { name: 'Drain_ID', type: 'string', alias: 'Drain ID', required: true },
        { name: 'Width_m', type: 'double', alias: 'Width (m)', defaultValue: 1.2 },
        { name: 'Depth_m', type: 'double', alias: 'Depth (m)', defaultValue: 1.0 },
        { name: 'Material', type: 'string', alias: 'Construction Material', domain: ['Concrete', 'Masonry', 'Earth'] },
      ];
    } else if (templateKey === 'parcel') {
      templateFields = [
        { name: 'Parcel_ID', type: 'string', alias: 'Parcel ID', required: true },
        { name: 'Owner', type: 'string', alias: 'Property Owner' },
        { name: 'LandUse', type: 'string', alias: 'Land Use Category', domain: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Public'] },
        { name: 'Area_sqm', type: 'double', alias: 'Calculated Area (sqm)' },
      ];
    }

    templateFields.forEach((field) => addFieldToLayer(layerId, field));
    logCommand(`Applied engineering template "${templateKey}" to layer`, 'edit');
  };

  // Geometry Transformations
  const moveSelectedFeatures = (deltaLng: number, deltaLat: number) => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        const updatedFeatures = l.features.map((f) => {
          if (selectedFeatureIds.includes(f.id)) {
            return { ...f, geometry: moveGeometry(f.geometry, deltaLng, deltaLat) };
          }
          return f;
        });
        return { ...l, features: updatedFeatures };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Moved ${selectedFeatureIds.length} feature(s)`, updated);
      return updated;
    });
  };

  const rotateSelectedFeatures = (angleDegrees: number) => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        const updatedFeatures = l.features.map((f) => {
          if (selectedFeatureIds.includes(f.id)) {
            return { ...f, geometry: rotateGeometry(f.geometry, angleDegrees) };
          }
          return f;
        });
        return { ...l, features: updatedFeatures };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Rotated ${selectedFeatureIds.length} feature(s) by ${angleDegrees}°`, updated);
      return updated;
    });
  };

  const scaleSelectedFeatures = (scaleFactor: number) => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        const updatedFeatures = l.features.map((f) => {
          if (selectedFeatureIds.includes(f.id)) {
            return { ...f, geometry: scaleGeometry(f.geometry, scaleFactor) };
          }
          return f;
        });
        return { ...l, features: updatedFeatures };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Scaled ${selectedFeatureIds.length} feature(s) by ${scaleFactor}x`, updated);
      return updated;
    });
  };

  const duplicateSelectedFeatures = () => {
    if (selectedFeatureIds.length === 0) return;
    const newSelectedIds: string[] = [];

    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        const newFeats: GISFeature[] = [];
        l.features.forEach((f) => {
          if (selectedFeatureIds.includes(f.id)) {
            const newId = `feat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            newSelectedIds.push(newId);
            const shiftedGeom = moveGeometry(f.geometry, 0.0002, 0.0002);
            newFeats.push({
              ...JSON.parse(JSON.stringify(f)),
              id: newId,
              geometry: shiftedGeom,
              properties: { ...f.properties, name: `${f.properties.name || 'Feature'} (Copy)` },
            });
          }
        });
        return { ...l, features: [...l.features, ...newFeats] };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Duplicated ${selectedFeatureIds.length} feature(s)`, updated);
      return updated;
    });

    if (newSelectedIds.length > 0) {
      setSelectedFeatureIds(newSelectedIds);
    }
  };

  const splitSelectedLine = (splitPoint: [number, number]) => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        const updatedFeatures: GISFeature[] = [];
        l.features.forEach((f) => {
          if (selectedFeatureIds.includes(f.id) && f.geometry.type === 'LineString') {
            const geoms = splitLineGeometry(f.geometry, splitPoint);
            geoms.forEach((g, idx) => {
              updatedFeatures.push({
                ...f,
                id: idx === 0 ? f.id : `feat_${Date.now()}_${idx}`,
                geometry: g,
              });
            });
          } else {
            updatedFeatures.push(f);
          }
        });
        return { ...l, features: updatedFeatures };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Split line feature`, updated);
      return updated;
    });
  };

  const mergeSelectedFeatures = () => {
    if (selectedFeatureIds.length < 2) return;
    const activeLayer = project.layers.find((l) => l.id === activeLayerId);
    if (!activeLayer || activeLayer.locked) return;

    const featsToMerge = activeLayer.features.filter((f) => selectedFeatureIds.includes(f.id));
    const mergedGeom = mergeGeometries(featsToMerge);

    if (mergedGeom) {
      setProject((prev) => {
        const updatedLayers = prev.layers.map((l) => {
          if (l.id === activeLayer.id) {
            const remaining = l.features.filter((f) => !selectedFeatureIds.includes(f.id));
            const mergedFeature: GISFeature = {
              id: `feat_${Date.now()}`,
              layerId: l.id,
              geometry: mergedGeom,
              properties: { ...featsToMerge[0].properties, name: `${featsToMerge[0].properties.name || 'Merged'} (Merged)` },
            };
            return { ...l, features: [...remaining, mergedFeature] };
          }
          return l;
        });
        const updated = { ...prev, layers: updatedLayers };
        pushHistory(`Merged ${featsToMerge.length} features`, updated);
        return updated;
      });
      clearSelection();
    }
  };

  const offsetSelectedLine = (distanceMeters: number) => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.locked) return l;
        const updatedFeatures = l.features.map((f) => {
          if (selectedFeatureIds.includes(f.id) && f.geometry.type === 'LineString') {
            return { ...f, geometry: offsetLineGeometry(f.geometry, distanceMeters) };
          }
          return f;
        });
        return { ...l, features: updatedFeatures };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Offset line feature by ${distanceMeters}m`, updated);
      return updated;
    });
  };

  const repairSelectedGeometries = () => {
    if (selectedFeatureIds.length === 0) return;
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        const updatedFeatures = l.features.map((f) => {
          if (selectedFeatureIds.includes(f.id)) {
            return { ...f, geometry: repairGeometry(f.geometry) };
          }
          return f;
        });
        return { ...l, features: updatedFeatures };
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Repaired geometry for ${selectedFeatureIds.length} feature(s)`, updated);
      return updated;
    });
  };

  // Vertex Editing
  const vertexInsert = (layerId: string, featureId: string, segmentIndex: number, coord: [number, number]) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          const updatedFeatures = l.features.map((f) => {
            if (f.id === featureId) {
              return { ...f, geometry: insertVertexInGeometry(f.geometry, segmentIndex, coord) };
            }
            return f;
          });
          return { ...l, features: updatedFeatures };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Inserted vertex`, updated);
      return updated;
    });
  };

  const vertexMove = (layerId: string, featureId: string, vertexIndex: number, coord: [number, number]) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          const updatedFeatures = l.features.map((f) => {
            if (f.id === featureId) {
              return { ...f, geometry: moveVertexInGeometry(f.geometry, vertexIndex, coord) };
            }
            return f;
          });
          return { ...l, features: updatedFeatures };
        }
        return l;
      });
      return { ...prev, layers: updatedLayers };
    });
  };

  const vertexDelete = (layerId: string, featureId: string, vertexIndex: number) => {
    setProject((prev) => {
      const updatedLayers = prev.layers.map((l) => {
        if (l.id === layerId) {
          const updatedFeatures = l.features.map((f) => {
            if (f.id === featureId) {
              return { ...f, geometry: deleteVertexFromGeometry(f.geometry, vertexIndex) };
            }
            return f;
          });
          return { ...l, features: updatedFeatures };
        }
        return l;
      });
      const updated = { ...prev, layers: updatedLayers };
      pushHistory(`Deleted vertex`, updated);
      return updated;
    });
  };

  // Symbology & Labels
  const updateLayerSymbology = (layerId: string, symbology: SymbologyConfig) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, symbology } : l)),
    }));
  };

  const updateLayerLabels = (layerId: string, labelConfig: LabelConfig) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === layerId ? { ...l, labelConfig } : l)),
    }));
  };

  // Storage & Projects
  const refreshProjectList = async () => {
    const list = await getAllProjectsFromDB();
    if (list.length > 0) setAllProjects(list);
  };

  const loadProjectById = async (id: string) => {
    const proj = await getProjectFromDB(id);
    if (proj) {
      setProject(proj);
      setActiveLayerId(proj.layers[0]?.id || null);
      setSelectedFeatureIds([]);
      setHistoryStack([
        { description: `Loaded Project "${proj.name}"`, project: proj, timestamp: new Date().toLocaleTimeString() },
      ]);
      setHistoryIndex(0);
      logCommand(`Loaded Project "${proj.name}"`, 'system');
    }
  };

  const saveCurrentProject = async () => {
    await saveProjectToDB(project);
    await refreshProjectList();
    logCommand(`Saved Project "${project.name}" to IndexedDB`, 'system');
  };

  const exportProjectJSON = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9-_]+/gi, '_') || 'gis-project'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logCommand(`Exported Project "${project.name}" as JSON`, 'system');
  };

  const createNewProject = async (name: string, description: string) => {
    const newProj: GISProject = {
      id: `project-${Date.now()}`,
      name: name || 'Untitled GIS Project',
      description: description || 'New EVLab GIS Project Workspace',
      version: '1.0.0',
      crs: { code: 'EPSG:4326', name: 'WGS 84 (Geographic)', unit: 'degrees' },
      center: [90.4125, 23.8103],
      zoom: 13,
      pitch: 0,
      bearing: 0,
      activeBasemapId: 'osm-standard',
      customBasemaps: [],
      groups: [{ id: 'group-default', name: 'Layers', visible: true, collapsed: false }],
      layers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveProjectToDB(newProj);
    setProject(newProj);
    setActiveLayerId(null);
    setSelectedFeatureIds([]);
    await refreshProjectList();
    logCommand(`Created new project "${newProj.name}"`, 'system');
  };

  const loadSampleProject = () => {
    const sample = createWaterNetworkSampleProject();
    setProject(sample);
    setActiveLayerId(sample.layers[0]?.id || null);
    setSelectedFeatureIds([]);
    saveProjectToDB(sample);
    logCommand('Loaded Water Network sample engineering project', 'system');
  };

  const deleteProjectById = async (id: string) => {
    await deleteProjectFromDB(id);
    await refreshProjectList();
    logCommand(`Deleted project ID ${id}`, 'system');
  };

  const setBasemap = (basemapId: string) => {
    setProject((prev) => ({ ...prev, activeBasemapId: basemapId }));
  };

  return (
    <GISContext.Provider
      value={{
        project,
        setProject,
        allProjects,
        refreshProjectList,
        viewMode,
        setViewMode,
        activeTool,
        setActiveTool,
        flyToExtent,
        setFlyToExtent,
        zoomToLayer,
        zoomToFeatures,
        selectedFeatureIds,
        setSelectedFeatureIds,
        selectionMode,
        setSelectionMode,
        selectFeatures,
        selectAllInLayer,
        clearSelection,
        invertSelection,
        activeLayerId,
        setActiveLayerId,
        editSession,
        startEditingLayer,
        saveLayerEdits,
        cancelLayerEdits,
        toggleLayerLock,
        isAttributeTableOpen,
        setIsAttributeTableOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isLayoutEditorOpen,
        setIsLayoutEditorOpen,
        isSymbologyModalOpen,
        setIsSymbologyModalOpen,
        isAddDataModalOpen,
        setIsAddDataModalOpen,
        isAnalysisModalOpen,
        setIsAnalysisModalOpen,
        isQueryBuilderOpen,
        setIsQueryBuilderOpen,
        isElevationProfileOpen,
        setIsElevationProfileOpen,
        isHistoryPanelOpen,
        setIsHistoryPanelOpen,
        isFieldManagerOpen,
        setIsFieldManagerOpen,
        isGeometryValidationOpen,
        setIsGeometryValidationOpen,
        snappingSettings,
        setSnappingSettings,
        elevationProfileLine,
        setElevationProfileLine,
        historyStack,
        historyIndex,
        undo,
        redo,
        pushHistory,
        commandLog,
        logCommand,
        addLayer,
        removeLayer,
        renameLayer,
        toggleLayerVisibility,
        setLayerOpacity,
        reorderLayers,
        addFeatureToLayer,
        updateFeatureProperties,
        updateFeatureGeometry,
        deleteSelectedFeatures,
        updateLayerSymbology,
        updateLayerLabels,
        addFieldToLayer,
        updateFieldInLayer,
        deleteFieldFromLayer,
        applyEngineeringTemplate,
        moveSelectedFeatures,
        rotateSelectedFeatures,
        scaleSelectedFeatures,
        duplicateSelectedFeatures,
        splitSelectedLine,
        mergeSelectedFeatures,
        offsetSelectedLine,
        repairSelectedGeometries,
        vertexInsert,
        vertexMove,
        vertexDelete,
        loadProjectById,
        saveCurrentProject,
        exportProjectJSON,
        createNewProject,
        loadSampleProject,
        deleteProjectById,
        setBasemap,
      }}
    >
      {children}
    </GISContext.Provider>
  );
};

export const useGIS = () => {
  const context = useContext(GISContext);
  if (!context) {
    throw new Error('useGIS must be used within a GISProvider');
  }
  return context;
};
