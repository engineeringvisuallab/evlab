import React, { useState, useEffect } from 'react';
import { Project } from '../data/projects';
import { PORTFOLIO_CONFIG } from '../data/config';
import { Model3DViewer } from './Model3DViewer';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { X, Box, Video, FileText, Layers, Wrench, CheckCircle2, ShieldAlert, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | '3d-view' | 'drawings' | 'images' | 'video' | 'details'>('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setActiveTab('overview');
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#070d1c] border border-cyan-950 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#091122] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase text-cyan-300">
              ENGINEERING PROJECT SUBMITTAL
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-400">
              {project.category} · {project.year}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#080e1e] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>

          {project.model3D && (
            <button
              type="button"
              onClick={() => setActiveTab('3d-view')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === '3d-view' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Model View</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('drawings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'drawings' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAD Drawings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'images' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Image Gallery</span>
          </button>

          {project.videos && project.videos.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'video' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Walkthrough Video</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'details' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deliverables & Role</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Title Header */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {project.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
                {project.category}
              </span>
              {project.software.map((sw, idx) => (
                <span key={idx} className="text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  {sw}
                </span>
              ))}
            </div>
          </div>

          {/* Tab 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hero Image / Blueprint Preview */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
                <img
                  src={project.heroImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Before/After Comparison if available */}
              {project.beforeAfter && (
                <div className="pt-2">
                  <BeforeAfterSlider
                    beforeImage={project.beforeAfter.beforeUrl}
                    beforeLabel={project.beforeAfter.beforeTitle}
                    afterImage={project.beforeAfter.afterUrl}
                    afterLabel={project.beforeAfter.afterTitle}
                    title="2D CAD Drawing vs 3D Visualization Comparison"
                    description={project.beforeAfter.description}
                  />
                </div>
              )}

              {/* Narrative & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Project Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {project.overview}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    My Role & Key Contribution
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {project.myRole}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 3D MODEL VIEW */}
          {activeTab === '3d-view' && project.model3D && (
            <div className="space-y-4">
              <Model3DViewer
                modelType={project.model3D.type}
                title={project.model3D.title}
              />
              <p className="text-xs font-mono text-slate-400 text-center">
                Interactive component viewer with 360° orbit rotation, wireframe inspection, and zoom.
              </p>
            </div>
          )}

          {/* Tab 3: CAD DRAWINGS */}
          {activeTab === 'drawings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.drawings.map((dwg, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 font-bold">SHEET 0{idx + 1}</span>
                      <span className="text-slate-400">.DWG / PDF</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{dwg}</h4>
                    <div className="h-28 rounded-xl bg-[#050914] border border-slate-800 flex items-center justify-center p-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cad-grid opacity-50" />
                      <div className="relative text-[10px] font-mono text-cyan-400/80">
                        [Technical Drawing Sheet Viewport]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: IMAGES */}
          {activeTab === 'images' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={img} alt={`Visual ${idx + 1}`} className="w-full h-56 object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: VIDEO */}
          {activeTab === 'video' && project.videos && (
            <div className="space-y-4">
              {project.videos.map((vid, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">{vid.title}</span>
                    <span className="text-slate-400">Duration: {vid.duration}</span>
                  </div>
                  <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
                    <img src={project.heroImage} alt={vid.title} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl">
                        <Video className="w-6 h-6 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">{vid.summary}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 6: DETAILS & DELIVERABLES */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Technical Project Scope
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {project.scope.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Contract Deliverables Handed Over
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {project.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Mandatory Confidentiality Notice */}
          <div className="p-4 rounded-xl bg-[#091122] border border-amber-900/40 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-slate-400 leading-relaxed">
              {PORTFOLIO_CONFIG.confidentialityNotice}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#091122] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>MD. Ayatullah Imani · Verified Engineering Submittal</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Press ESC or click close
          </button>
        </div>

      </div>
    </div>
  );
}
