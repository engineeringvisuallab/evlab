import React, { useMemo } from 'react';
import { useGIS } from '../../context/GISContext';
import { X, TrendingUp, Download, Ruler } from 'lucide-react';
import * as turf from '@turf/turf';
import { formatDistance } from '../../services/cadEngine';

export const ElevationProfileModal: React.FC = () => {
  const { elevationProfileLine, isElevationProfileOpen, setIsElevationProfileOpen } = useGIS();

  const profileData = useMemo(() => {
    if (!elevationProfileLine || elevationProfileLine.length < 2) return null;

    try {
      const line = turf.lineString(elevationProfileLine);
      const totalDist = turf.length(line, { units: 'meters' });
      const samplesCount = 50;
      const step = totalDist / samplesCount;

      const samples: { distance: number; elevation: number; lng: number; lat: number }[] = [];
      let minEl = 9999;
      let maxEl = -9999;

      for (let i = 0; i <= samplesCount; i++) {
        const d = Math.min(i * step, totalDist);
        const pt = turf.along(line, d, { units: 'meters' });
        const [lng, lat] = pt.geometry.coordinates;

        // Realistic elevation simulation along line path
        const elev = Math.round(
          35 + Math.sin(lng * 150) * 8 + Math.cos(lat * 120) * 12 + Math.sin(d * 0.005) * 5
        );

        if (elev < minEl) minEl = elev;
        if (elev > maxEl) maxEl = elev;

        samples.push({ distance: Math.round(d), elevation: elev, lng, lat });
      }

      return { totalDist, samples, minEl, maxEl };
    } catch (e) {
      return null;
    }
  }, [elevationProfileLine]);

  if (!isElevationProfileOpen || !profileData) return null;

  const { totalDist, samples, minEl, maxEl } = profileData;
  const elRange = Math.max(10, maxEl - minEl);

  // Generate SVG Path
  const width = 600;
  const height = 180;
  const padding = 35;

  const pointsSVG = samples
    .map((s, idx) => {
      const x = padding + (s.distance / totalDist) * (width - 2 * padding);
      const y = height - padding - ((s.elevation - minEl) / elRange) * (height - 2 * padding);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaSVG = `${pointsSVG} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <TrendingUp size={18} />
            <span>Terrain Elevation Profile Cross-Section</span>
          </div>
          <button
            onClick={() => setIsElevationProfileOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-400">Total Distance</div>
              <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                {formatDistance(totalDist)}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-400">Min Elevation</div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {minEl} m
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-400">Max Elevation</div>
              <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                {maxEl} m
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-400">Elevation Δ</div>
              <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">
                {(maxEl - minEl).toFixed(1)} m
              </div>
            </div>
          </div>

          {/* SVG Profile Chart */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

              {/* Filled Area */}
              <path d={areaSVG} fill="url(#gradient-elevation)" opacity="0.4" />

              {/* Profile Line */}
              <path d={pointsSVG} fill="none" stroke="#06b6d4" strokeWidth="2.5" />

              {/* Area Gradient */}
              <defs>
                <linearGradient id="gradient-elevation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2 px-8">
              <span>0 m</span>
              <span>{Math.round(totalDist / 2)} m</span>
              <span>{Math.round(totalDist)} m</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setIsElevationProfileOpen(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
