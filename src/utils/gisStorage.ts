import { UELELayer } from '../types/adminUele';
import { GISFeature } from '../data/sherpur-gis-data';

const DB_NAME = 'EVLab_GIS_Storage';
const DB_VERSION = 1;
const LAYERS_STORE = 'custom_gis_layers';
const FEATURES_STORE = 'custom_gis_features';

// Initialize IndexedDB Database
function openGISDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(LAYERS_STORE)) {
        db.createObjectStore(LAYERS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(FEATURES_STORE)) {
        const featStore = db.createObjectStore(FEATURES_STORE, { keyPath: 'id' });
        featStore.createIndex('layerId', 'properties.layerId', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open GIS IndexedDB.'));
    };
  });
}

/**
 * Save custom imported layer and its vector features permanently into Cloud Server & Local Storage
 */
export async function saveCustomGISLayer(
  layer: UELELayer,
  features: GISFeature[]
): Promise<boolean> {
  let serverSaved = false;

  // 1. Save to Global Backend Server API for all visitors
  try {
    const res = await fetch('/api/gis/layers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ layer, features }),
    });

    if (res.ok) {
      serverSaved = true;
      console.log(`[GIS Storage] Layer "${layer.name}" saved globally to server for all users.`);
    }
  } catch (err) {
    console.warn('[GIS Storage] Server API post failed, using local storage cache:', err);
  }

  // 2. Save locally to IndexedDB as browser cache
  try {
    const db = await openGISDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(LAYERS_STORE, 'readwrite');
      const store = tx.objectStore(LAYERS_STORE);
      const req = store.put(layer);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FEATURES_STORE, 'readwrite');
      const store = tx.objectStore(FEATURES_STORE);
      features.forEach((f) => store.put(f));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save layer to IndexedDB, using LocalStorage fallback:', err);
    saveToLocalStorageFallback(layer, features);
  }

  return true;
}

/**
 * Retrieve all custom stored GIS layers and features from Server API (Global for all users)
 * and merge with local IndexedDB cache if offline.
 */
export async function loadCustomGISData(): Promise<{
  layers: UELELayer[];
  features: GISFeature[];
}> {
  // 1. Try loading from Global Server API
  try {
    const res = await fetch('/api/gis/layers');
    if (res.ok) {
      const serverData = await res.json();
      if (
        serverData &&
        Array.isArray(serverData.layers) &&
        Array.isArray(serverData.features)
      ) {
        console.log(`[GIS Storage] Loaded ${serverData.layers.length} global server layers.`);
        return {
          layers: serverData.layers,
          features: serverData.features,
        };
      }
    }
  } catch (err) {
    console.warn('[GIS Storage] Could not fetch server GIS data, trying local IndexedDB:', err);
  }

  // 2. Fallback to local IndexedDB
  try {
    const db = await openGISDatabase();

    const layers: UELELayer[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(LAYERS_STORE, 'readonly');
      const store = tx.objectStore(LAYERS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const features: GISFeature[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(FEATURES_STORE, 'readonly');
      const store = tx.objectStore(FEATURES_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    return { layers, features };
  } catch (err) {
    console.warn('Failed to load GIS from IndexedDB, trying LocalStorage fallback:', err);
    return loadFromLocalStorageFallback();
  }
}

/**
 * Delete a custom GIS layer permanently from Server and Local Storage
 */
export async function deleteCustomGISLayer(layerId: string): Promise<boolean> {
  // 1. Delete from Server
  try {
    await fetch(`/api/gis/layers/${layerId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[GIS Storage] Failed to delete layer from server:', err);
  }

  // 2. Delete from IndexedDB
  try {
    const db = await openGISDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(LAYERS_STORE, 'readwrite');
      const store = tx.objectStore(LAYERS_STORE);
      const req = store.delete(layerId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FEATURES_STORE, 'readwrite');
      const store = tx.objectStore(FEATURES_STORE);
      const index = store.index('layerId');
      const requestKey = index.getAllKeys(layerId);

      requestKey.onsuccess = () => {
        const keys = requestKey.result;
        if (keys.length === 0) {
          resolve();
          return;
        }

        const deleteTx = db.transaction(FEATURES_STORE, 'readwrite');
        const deleteStore = deleteTx.objectStore(FEATURES_STORE);
        keys.forEach((key) => deleteStore.delete(key));
        deleteTx.oncomplete = () => resolve();
        deleteTx.onerror = () => reject(deleteTx.error);
      };

      requestKey.onerror = () => reject(requestKey.error);
    });

    removeFromLocalStorageFallback(layerId);
    return true;
  } catch (err) {
    console.warn('Failed to delete layer from IndexedDB:', err);
    removeFromLocalStorageFallback(layerId);
    return false;
  }
}

/**
 * Clear all custom imported GIS layers from Server and Local Database
 */
export async function clearAllCustomGISLayers(): Promise<boolean> {
  // 1. Clear Server DB
  try {
    await fetch('/api/gis/layers', { method: 'DELETE' });
  } catch (err) {
    console.warn('[GIS Storage] Failed to wipe server GIS data:', err);
  }

  // 2. Clear IndexedDB
  try {
    const db = await openGISDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([LAYERS_STORE, FEATURES_STORE], 'readwrite');
      tx.objectStore(LAYERS_STORE).clear();
      tx.objectStore(FEATURES_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    localStorage.removeItem('evlab_gis_layers');
    localStorage.removeItem('evlab_gis_features');
    return true;
  } catch (err) {
    localStorage.removeItem('evlab_gis_layers');
    localStorage.removeItem('evlab_gis_features');
    return false;
  }
}

// LocalStorage Fallback functions for simple environments
function saveToLocalStorageFallback(layer: UELELayer, features: GISFeature[]): boolean {
  try {
    const existingLayersRaw = localStorage.getItem('evlab_gis_layers');
    const existingFeatsRaw = localStorage.getItem('evlab_gis_features');

    const existingLayers: UELELayer[] = existingLayersRaw ? JSON.parse(existingLayersRaw) : [];
    const existingFeats: GISFeature[] = existingFeatsRaw ? JSON.parse(existingFeatsRaw) : [];

    const updatedLayers = [layer, ...existingLayers.filter((l) => l.id !== layer.id)];
    const updatedFeats = [...features, ...existingFeats.filter((f) => f.properties.layerId !== layer.id)];

    localStorage.setItem('evlab_gis_layers', JSON.stringify(updatedLayers));
    localStorage.setItem('evlab_gis_features', JSON.stringify(updatedFeats));
    return true;
  } catch (err) {
    console.error('LocalStorage save failed:', err);
    return false;
  }
}

function loadFromLocalStorageFallback(): { layers: UELELayer[]; features: GISFeature[] } {
  try {
    const layersRaw = localStorage.getItem('evlab_gis_layers');
    const featsRaw = localStorage.getItem('evlab_gis_features');

    const layers: UELELayer[] = layersRaw ? JSON.parse(layersRaw) : [];
    const features: GISFeature[] = featsRaw ? JSON.parse(featsRaw) : [];

    return { layers, features };
  } catch (err) {
    return { layers: [], features: [] };
  }
}

function removeFromLocalStorageFallback(layerId: string) {
  try {
    const layersRaw = localStorage.getItem('evlab_gis_layers');
    const featsRaw = localStorage.getItem('evlab_gis_features');

    if (layersRaw) {
      const layers: UELELayer[] = JSON.parse(layersRaw);
      localStorage.setItem(
        'evlab_gis_layers',
        JSON.stringify(layers.filter((l) => l.id !== layerId))
      );
    }

    if (featsRaw) {
      const feats: GISFeature[] = JSON.parse(featsRaw);
      localStorage.setItem(
        'evlab_gis_features',
        JSON.stringify(feats.filter((f) => f.properties.layerId !== layerId))
      );
    }
  } catch (e) {
    // ignore
  }
}
