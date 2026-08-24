import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid as ThreeGrid } from '@react-three/drei';
import * as THREE from 'three';
import { GISFeature } from '../../data/sherpur-gis-data';
import { UELELayer } from '../../types/uele';
import { Box, Compass, RotateCcw, ZoomIn, ZoomOut, Grid3x3, Layers } from 'lucide-react';

// Convert WGS84 (Lat, Lng, Elevation) to 3D World Coordinates (X, Y, Z in meters)
export function latLngTo3D(
  lat: number,
  lng: number,
  elevation: number = 0,
  centerLat: number = 24.6800,
  centerLng: number = 89.4100
): [number, number, number] {
  const latRad = (centerLat * Math.PI) / 180;
  const metersPerDegLat = 111000;
  const metersPerDegLng = 111000 * Math.cos(latRad);

  const x = (lng - centerLng) * metersPerDegLng;
  const z = -(lat - centerLat) * metersPerDegLat;
  const y = elevation;

  return [x, y, z];
}

// 3D Point Feature Marker Mesh
const PointFeatureMesh: React.FC<{
  feature: GISFeature;
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ feature, color, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const [x, y, z] = latLngTo3D(
    feature.properties.lat,
    feature.properties.lng,
    feature.properties.elevation || 0
  );

  useFrame((_, delta) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[x, y + 2, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(feature.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Beacon Pole */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 10, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : color}
          emissive={isSelected ? '#0284c7' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Top Floating Diamond Pin */}
      <mesh position={[0, 11, 0]}>
        <octahedronGeometry args={[isSelected ? 2.5 : 1.8]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : color}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Vertical Selection Beam */}
      {isSelected && (
        <mesh position={[0, 25, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 50, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
      )}

      {/* HTML Floating Label */}
      {(isSelected || hovered) && (
        <Html position={[0, 15, 0]} center distanceFactor={250}>
          <div className="bg-slate-900/90 border border-cyan-400 p-2 rounded-xl text-xs font-mono text-white whitespace-nowrap shadow-2xl pointer-events-none">
            <div className="font-bold text-cyan-300">{feature.properties.name}</div>
            <div className="text-[10px] text-slate-400">
              {feature.properties.layerName} • ELEV: {feature.properties.elevation || 0}m
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D LineString Feature Mesh
const LineFeatureMesh: React.FC<{
  feature: GISFeature;
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ feature, color, isSelected, onSelect }) => {
  const points = useMemo(() => {
    const coords = feature.geometry.coordinates;
    if (!coords || !Array.isArray(coords)) return [];
    return coords.map((c: number[]) => {
      const [x, y, z] = latLngTo3D(c[1], c[0], feature.properties.elevation || 1);
      return new THREE.Vector3(x, y + 1, z);
    });
  }, [feature]);

  const curve = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  if (!curve) return null;

  return (
    <group onClick={() => onSelect(feature.id)}>
      <mesh>
        <tubeGeometry args={[curve, 64, isSelected ? 2.5 : 1.5, 8, false]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : color}
          emissive={isSelected ? '#0284c7' : color}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
        />
      </mesh>
    </group>
  );
};

// 3D Polygon Feature Mesh
const PolygonFeatureMesh: React.FC<{
  feature: GISFeature;
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ feature, color, isSelected, onSelect }) => {
  const shape = useMemo(() => {
    const coords = feature.geometry.coordinates?.[0];
    if (!coords || !Array.isArray(coords)) return null;

    const s = new THREE.Shape();
    coords.forEach((c: number[], i: number) => {
      const [x, _, z] = latLngTo3D(c[1], c[0], 0);
      if (i === 0) s.moveTo(x, -z);
      else s.lineTo(x, -z);
    });
    return s;
  }, [feature]);

  if (!shape) return null;

  const extrudeSettings = {
    steps: 1,
    depth: isSelected ? 8 : 4,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.5,
  };

  return (
    <group
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(feature.id);
      }}
    >
      <mesh>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : color}
          transparent
          opacity={isSelected ? 0.85 : 0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

export interface UELE3DViewProps {
  features: GISFeature[];
  layers: UELELayer[];
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
  onResetView: () => void;
}

export const UELE3DView: React.FC<UELE3DViewProps> = ({
  features,
  layers,
  selectedFeatureId,
  onSelectFeature,
  onResetView,
}) => {
  const orbitControlsRef = useRef<any>(null);
  const [gridMode, setGridMode] = useState<'cyber' | 'dense' | 'minimal' | 'off'>('cyber');
  const visibleLayerIds = new Set(layers.filter((l) => l.visible).map((l) => l.id));
  const visibleFeatures = features.filter((f) => visibleLayerIds.has(f.properties.layerId));

  const cycleGridMode = () => {
    setGridMode((prev) => {
      if (prev === 'cyber') return 'dense';
      if (prev === 'dense') return 'minimal';
      if (prev === 'minimal') return 'off';
      return 'cyber';
    });
  };

  // Focus on selected feature when changed
  useEffect(() => {
    if (!selectedFeatureId || !orbitControlsRef.current) return;
    const feat = features.find((f) => f.id === selectedFeatureId);
    if (feat) {
      let targetPos: [number, number, number] = [0, 0, 0];
      if (feat.properties.lat && feat.properties.lng) {
        targetPos = latLngTo3D(feat.properties.lat, feat.properties.lng, feat.properties.elevation || 0);
      } else if (feat.geometry.coordinates && Array.isArray(feat.geometry.coordinates)) {
        const c = feat.geometry.coordinates[0];
        if (Array.isArray(c) && typeof c[0] === 'number') {
          targetPos = latLngTo3D(c[1], c[0], 0);
        }
      }
      orbitControlsRef.current.target.set(targetPos[0], targetPos[1], targetPos[2]);
      orbitControlsRef.current.update();
    }
  }, [selectedFeatureId, features]);

  const handleTopView = () => {
    if (orbitControlsRef.current) {
      // z set to 0.1 to prevent exact Y-axis gimbal lock on top-down view
      orbitControlsRef.current.object.position.set(0, 4000, 0.1);
      orbitControlsRef.current.target.set(0, 0, 0);
      orbitControlsRef.current.update();
    }
  };

  const handleIsometricView = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object.position.set(1200, 1000, 1200);
      orbitControlsRef.current.target.set(0, 0, 0);
      orbitControlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const cam = controls.object;
      const target = controls.target;
      const vec = new THREE.Vector3().subVectors(cam.position, target);
      vec.multiplyScalar(0.7); // 30% closer
      cam.position.copy(target).add(vec);
      controls.update();
    }
  };

  const handleZoomOut = () => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const cam = controls.object;
      const target = controls.target;
      const vec = new THREE.Vector3().subVectors(cam.position, target);
      vec.multiplyScalar(1.4); // 40% further away
      cam.position.copy(target).add(vec);
      controls.update();
    }
  };

  const handleResetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object.position.set(1200, 1000, 1200);
      orbitControlsRef.current.target.set(0, 0, 0);
      orbitControlsRef.current.update();
    }
    onResetView();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden font-mono select-none">
      {/* 1. Canvas 3D Viewport with extended camera frustum to prevent distance clipping */}
      <Canvas
        camera={{ position: [1200, 1000, 1200], fov: 50, near: 0.1, far: 100000 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 25000, 90000]} />

        <ambientLight intensity={0.8} />
        <directionalLight position={[1000, 2000, 1000]} intensity={1.3} />
        <pointLight position={[-1000, 1000, -1000]} intensity={0.6} />

        {/* Orbit Controls with extended distance bounds */}
        <OrbitControls
          ref={orbitControlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.01}
          minPolarAngle={0.01}
          minDistance={1}
          maxDistance={50000}
        />

        {/* Ground Terrain Grid based on selected gridMode */}
        {gridMode === 'cyber' && (
          <ThreeGrid
            args={[50000, 50000]}
            cellSize={50}
            cellThickness={1}
            cellColor="#1e293b"
            sectionSize={500}
            sectionThickness={2}
            sectionColor="#06b6d4"
            fadeDistance={45000}
            fadeStrength={1}
          />
        )}

        {gridMode === 'dense' && (
          <ThreeGrid
            args={[50000, 50000]}
            cellSize={20}
            cellThickness={1}
            cellColor="#064e3b"
            sectionSize={100}
            sectionThickness={2}
            sectionColor="#10b981"
            fadeDistance={45000}
            fadeStrength={1}
          />
        )}

        {gridMode === 'minimal' && (
          <ThreeGrid
            args={[50000, 50000]}
            cellSize={100}
            cellThickness={1}
            cellColor="#0f172a"
            sectionSize={1000}
            sectionThickness={1.5}
            sectionColor="#334155"
            fadeDistance={45000}
            fadeStrength={1}
          />
        )}

        {/* Render Features */}
        {visibleFeatures.map((feature) => {
          const isSelected = feature.id === selectedFeatureId;
          const color =
            layers.find((l) => l.id === feature.properties.layerId)?.color || '#06b6d4';

          const geomType = feature.geometry.type as string;

          if (geomType === 'Point') {
            return (
              <PointFeatureMesh
                key={feature.id}
                feature={feature}
                color={color}
                isSelected={isSelected}
                onSelect={onSelectFeature}
              />
            );
          } else if (
            geomType === 'LineString' ||
            geomType === 'MultiLineString'
          ) {
            return (
              <LineFeatureMesh
                key={feature.id}
                feature={feature}
                color={color}
                isSelected={isSelected}
                onSelect={onSelectFeature}
              />
            );
          } else if (
            geomType === 'Polygon' ||
            geomType === 'MultiPolygon'
          ) {
            return (
              <PolygonFeatureMesh
                key={feature.id}
                feature={feature}
                color={color}
                isSelected={isSelected}
                onSelect={onSelectFeature}
              />
            );
          }
          return null;
        })}
      </Canvas>

      {/* 2. Floating View Camera HUD Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-cyan-500 border border-slate-700 text-slate-200 hover:text-slate-950 font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-cyan-500 border border-slate-700 text-slate-200 hover:text-slate-950 font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="h-px bg-slate-800 my-1" />

        <button
          onClick={cycleGridMode}
          title="Cycle 3D Grid Mode (Cyber / Dense / Minimal / Off)"
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer ${
            gridMode === 'off'
              ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-500'
              : gridMode === 'cyber'
              ? 'bg-slate-900/90 hover:bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : gridMode === 'dense'
              ? 'bg-slate-900/90 hover:bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-slate-900/90 hover:bg-slate-700 border-slate-600 text-slate-300'
          }`}
        >
          <Grid3x3 className="w-3.5 h-3.5" />
          <span>
            Grid: {gridMode === 'cyber' ? 'Cyber' : gridMode === 'dense' ? 'Dense' : gridMode === 'minimal' ? 'Minimal' : 'Off'}
          </span>
        </button>

        <button
          onClick={handleTopView}
          title="High-Altitude Top-Down View"
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-500 border border-slate-700 text-xs text-slate-200 hover:text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Top View</span>
        </button>

        <button
          onClick={handleIsometricView}
          title="3D Orbit View"
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-500 border border-slate-700 text-xs text-slate-200 hover:text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Isometric</span>
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-amber-500 border border-slate-700 text-xs text-slate-200 hover:text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 3. Bottom HUD Details */}
      <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-3 shadow-lg">
        <span className="text-emerald-400 font-bold">3D SPATIAL ORBIT CANVAS</span>
        <span>•</span>
        <span className="text-cyan-400 font-semibold">GRID: {gridMode.toUpperCase()}</span>
        <span>•</span>
        <span>FAR PLANE: 100,000 M</span>
      </div>
    </div>
  );
};

