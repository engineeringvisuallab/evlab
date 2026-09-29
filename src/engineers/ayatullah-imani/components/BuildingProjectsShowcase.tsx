import React, { useState } from 'react';
import { PROJECTS_DATA, Project } from '../data/projects';
import { ProjectModal } from './ProjectModal';
import { ArrowUpRight, Box, Video, Layers, Eye, CheckCircle2 } from 'lucide-react';

export function BuildingProjectsShowcase() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter building projects
  const buildingProjects = PROJECTS_DATA.filter((p) => p.filterCategories.includes('building'));
  const mainBuilding = buildingProjects[0] || PROJECTS_DATA[0];

  return (
    <section id="building-projects" className="py-20 sm:py-28 relative bg-[#060b17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>MAJOR SPECIALIZATION</span>
              <span className="text-slate-600">·</span>
              <span>RESIDENTIAL & COMMERCIAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Building Projects & BIM Documentation
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm sm:text-right">
            Coordinated Revit BIM models, architectural floor plans, sections, elevations, and 3D exterior renders.
          </p>
        </div>

        {/* Featured Large Building Spotlight Card */}
        <div className="rounded-3xl bg-[#091122] border border-cyan-950 p-6 sm:p-8 shadow-2xl mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Image / Render Showcase (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group"
                onClick={() => setSelectedProject(mainBuilding)}
              >
                <img
                  src={mainBuilding.heroImage}
                  alt={mainBuilding.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                  <div className="flex items-center justify-between w-full text-xs font-mono text-cyan-300">
                    <span className="bg-black/80 px-3 py-1 rounded-lg border border-cyan-500/30">
                      3D Photorealistic Exterior Facade
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Drawings & Model</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Angle Building Sub-Deliverables Row */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="block text-cyan-400 font-bold">L01–L08</span>
                  <span>Floor Plans</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="block text-cyan-400 font-bold">1:100</span>
                  <span>Cross Sections</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="block text-cyan-400 font-bold">4-Sides</span>
                  <span>Elevations</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="block text-cyan-400 font-bold">4K UHD</span>
                  <span>3D Walkthrough</span>
                </div>
              </div>
            </div>

            {/* Narrative & Scope Checklist (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
                  Revit BIM & AutoCAD Package
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-2.5">
                  {mainBuilding.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {mainBuilding.overview}
                </p>
              </div>

              {/* What I Deliver For Building Projects */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Delivered In This Project:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {mainBuilding.scope.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Software */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {mainBuilding.software.map((sw, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-mono text-slate-200 bg-slate-900 rounded-lg border border-slate-800">
                    {sw}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(mainBuilding)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Open Full Building Case Study</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
