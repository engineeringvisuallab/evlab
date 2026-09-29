import heroWaterImg from '../assets/images/hero_water_infrastructure_3d_1790644410645.jpg';
import civil3dCorridorImg from '../assets/images/civil3d_highway_pipeline_corridor_1790644436511.jpg';
import buildingRevitImg from '../assets/images/building_residential_revit_render_1790644425118.jpg';
import cadChamberImg from '../assets/images/cad_blueprint_mechanical_chamber_1790644451376.jpg';
import React, { useState } from 'react';
import { Model3DViewer } from './Model3DViewer';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Eye, Play, Sparkles, Video, Box, Layers, Maximize2 } from 'lucide-react';

export function VisualizationLab() {
  const [activeTab, setActiveTab] = useState<'3d-model' | 'before-after' | 'video'>('3d-model');
  const [modelType, setModelType] = useState<'building' | 'chamber'>('building');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <section id="visualization" className="py-20 sm:py-28 relative bg-[#060c18] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>SPECIALIZED LAB</span>
              <span className="text-slate-600">·</span>
              <span>INTERACTIVE VISUAL EXPERIENCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-display">
              3D Visualization & Engineering Media Lab
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Inspect interactive 3D models, compare 2D CAD drawings against photorealistic renders, and preview architectural walkthroughs.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('3d-model')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === '3d-model'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Interactive 3D Model</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('before-after')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'before-after'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2D vs 3D Slider</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Walkthrough</span>
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        {activeTab === '3d-model' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono text-slate-400">Choose Model Geometry:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModelType('building')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    modelType === 'building'
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Multi-Story Building Model
                </button>
                <button
                  type="button"
                  onClick={() => setModelType('chamber')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    modelType === 'chamber'
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  PRV Valve Chamber Assembly
                </button>
              </div>
            </div>

            <Model3DViewer
              modelType={modelType}
              title={modelType === 'building' ? 'Multi-Story Residential Complex BIM View' : 'PRV Valve Chamber Manifold Assembly'}
            />
          </div>
        )}

        {activeTab === 'before-after' && (
          <div>
            <BeforeAfterSlider
              beforeImage={cadChamberImg}
              beforeLabel="2D AutoCAD Engineering Drawing"
              afterImage={buildingRevitImg}
              afterLabel="3D Architectural Visualization"
              title="2D CAD Blueprint Plan vs. 3D Architectural Photorealism"
              description="Demonstrating the exact workflow: converting dimensioned floor plans and engineering schematics into presentation-grade 3D renders."
            />
          </div>
        )}

        {activeTab === 'video' && (
          <div className="rounded-2xl bg-[#070d1c] border border-cyan-950/80 p-5 sm:p-7 shadow-2xl">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
              <img
                src={heroWaterImg}
                alt="3D Flythrough Video Preview"
                className={`w-full h-full object-cover transition-opacity duration-300 ${isPlayingVideo ? 'opacity-80' : 'opacity-60'}`}
              />

              {/* Video Overlay or Play Action */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-6">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="bg-black/70 px-2.5 py-1 rounded text-cyan-300 border border-cyan-500/30">
                    4K Ultra HD Walkthrough Simulation
                  </span>
                  <span className="bg-black/70 px-2 py-1 rounded text-slate-300">
                    Duration: 02:45
                  </span>
                </div>

                <div className="text-center my-auto">
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    className="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer mx-auto"
                    aria-label="Play 3D Flythrough Video"
                  >
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  </button>
                  <p className="text-sm font-semibold text-white mt-3 font-display">
                    {isPlayingVideo ? 'Playing Aerial Infrastructure Flythrough' : 'Click to Preview 3D Infrastructure Flythrough'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>WTP Hydraulic Units & Pipeline Corridor Walkthrough</span>
                  <span className="text-emerald-400">Client Presentation Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
