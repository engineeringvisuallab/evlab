import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import {
  Box,
  Layers as LayersIcon,
  RotateCcw,
  Eye,
  EyeOff,
  ArrowLeft,
  Droplets,
  PenTool,
  Info,
} from 'lucide-react';
import { Container } from '../../components/shared/Container';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { StatCard } from '../../components/shared/StatCard';
import {
  BimObject,
  BimModelState,
  BimSourceTool,
  getBimModel,
  subscribeToBimModel,
} from './bimModel';

const TOOL_META: Record<BimSourceTool, { label: string; icon: React.ComponentType<{ className?: string }>; accent: 'cyan' | 'amber' }> = {
  wtp: { label: 'EVLab WTP Design', icon: Droplets, accent: 'cyan' },
  minicad: { label: 'EVLab Mini CAD', icon: PenTool, accent: 'amber' },
};

interface BimMeshProps {
  obj: BimObject;
}

const BimMesh: React.FC<BimMeshProps> = ({ obj }) => {
  const [hovered, setHovered] = useState(false);
  const { lengthM, widthM, heightM, radiusM } = obj.dimensions;

  const geometry = (() => {
    switch (obj.geometryType) {
      case 'CYLINDER':
      case 'PIPE':
        return <cylinderGeometry args={[radiusM || lengthM / 2, radiusM || lengthM / 2, heightM, 24]} />;
      case 'SPHERE':
        return <sphereGeometry args={[radiusM || lengthM / 2, 24, 24]} />;
      case 'CONE':
        return <coneGeometry args={[radiusM || lengthM / 2, heightM, 24]} />;
      case 'BOX':
      default:
        return <boxGeometry args={[lengthM, heightM, widthM]} />;
    }
  })();

  return (
    <group
      position={[obj.position.x, obj.position.z, obj.position.y]}
      rotation={[obj.rotation.x, obj.rotation.z, obj.rotation.y]}
    >
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {geometry}
        <meshStandardMaterial
          color={obj.colorHex}
          wireframe={obj.wireframe}
          transparent={obj.opacity < 1}
          opacity={obj.opacity}
          emissive={hovered ? obj.colorHex : '#000000'}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={12} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900/95 border border-slate-700 text-slate-100 text-[11px] font-mono px-2 py-1 rounded whitespace-nowrap">
            {obj.label}
          </div>
        </Html>
      )}
    </group>
  );
};

export interface BimViewerPageProps {
  onNavigateHome?: () => void;
  onOpenTool?: (route: string) => void;
}

export const BimViewerPage: React.FC<BimViewerPageProps> = ({ onNavigateHome, onOpenTool }) => {
  const [model, setModel] = useState<BimModelState>(() => getBimModel());
  const [wireframeOverride, setWireframeOverride] = useState(false);
  const [visibleTools, setVisibleTools] = useState<Record<BimSourceTool, boolean>>({
    wtp: true,
    minicad: true,
  });

  useEffect(() => subscribeToBimModel(() => setModel(getBimModel())), []);

  const publishedTools = Object.entries(model).filter(([, v]) => !!v) as [BimSourceTool, NonNullable<BimModelState[string]>][];

  const objects = useMemo(() => {
    return publishedTools
      .filter(([tool]) => visibleTools[tool])
      .flatMap(([, payload]) => payload.objects)
      .map((o) => (wireframeOverride ? { ...o, wireframe: true } : o));
  }, [publishedTools, visibleTools, wireframeOverride]);

  const hasAnyModel = publishedTools.length > 0;

  return (
    <Container size="xl" className="py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onNavigateHome}
        >
          Back to Software Directory
        </Button>
        <Badge variant="blue" icon={<Box className="w-3.5 h-3.5" />}>
          EVLab BIM
        </Badge>
      </div>

      <SectionHeader
        badge="Unified Model"
        badgeVariant="blue"
        title="EVLab BIM Viewer"
        description="Every EVLab software tool can publish its current model here — this view renders all published tools together in one connected 3D workspace."
      />

      {!hasAnyModel ? (
        <Card padding="lg" className="text-center space-y-3">
          <Info className="w-6 h-6 mx-auto text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No models published yet. Open a tool, build your design, and use its{' '}
            <span className="font-semibold text-[var(--text-primary)]">Publish to BIM</span> action
            — it will appear here automatically.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={() => onOpenTool?.('wtp')}>
              Open WTP Design
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpenTool?.('minicad')}>
              Open Mini CAD
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Published Tools"
              value={publishedTools.length}
              icon={<LayersIcon className="w-4 h-4" />}
              accent="blue"
            />
            <StatCard
              label="Total Objects"
              value={publishedTools.reduce((sum, [, p]) => sum + p.objects.length, 0)}
              icon={<Box className="w-4 h-4" />}
              accent="purple"
            />
            {publishedTools.map(([tool, payload]) => {
              const meta = TOOL_META[tool];
              return (
                <StatCard
                  key={tool}
                  label={meta.label}
                  value={`${payload.objects.length} objects`}
                  description={`Published ${new Date(payload.publishedAt).toLocaleString()}`}
                  icon={<meta.icon className="w-4 h-4" />}
                  accent={meta.accent === 'amber' ? 'amber' : 'cyan'}
                />
              );
            })}
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {publishedTools.map(([tool]) => {
                  const meta = TOOL_META[tool];
                  const on = visibleTools[tool];
                  return (
                    <button
                      key={tool}
                      onClick={() => setVisibleTools((prev) => ({ ...prev, [tool]: !prev[tool] }))}
                      className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-colors ${
                        on
                          ? 'bg-[var(--accent-blue-bg)] border-[var(--accent-blue)]/40 text-[var(--accent-blue)]'
                          : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)]'
                      }`}
                    >
                      {on ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => setWireframeOverride((w) => !w)}
              >
                {wireframeOverride ? 'Solid View' : 'Wireframe View'}
              </Button>
            </div>

            <div className="h-[560px] bg-[#0B0F19]">
              <Canvas shadows camera={{ position: [30, 25, 30], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[20, 30, 10]} intensity={1} castShadow />
                <Grid
                  args={[200, 200]}
                  cellColor="#1F2937"
                  sectionColor="#374151"
                  fadeDistance={120}
                  infiniteGrid
                />
                {objects.map((obj) => (
                  <BimMesh key={obj.id} obj={obj} />
                ))}
                <OrbitControls makeDefault />
              </Canvas>
            </div>
          </Card>
        </>
      )}
    </Container>
  );
};
