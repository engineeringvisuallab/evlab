import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UELEObject, UELEObjectComponent, UELEHotspot } from '../../types/uele';
import {
  Globe,
  Compass,
  MapPin,
  Building2,
  Droplet,
  Zap,
  Truck,
  Factory,
  Trees,
  Sprout,
  Home,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ChevronRight,
  Info,
  Maximize2,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  X,
  Workflow,
  ArrowLeft,
  Eye,
  Crosshair,
  Sun,
  Moon,
  Radio,
} from 'lucide-react';

export interface MasterEngineeringMap2DProps {
  objects: UELEObject[];
  selectedObject: UELEObject | null;
  selectedComponentId?: string | null;
  selectedHotspot?: UELEHotspot | null;
  onSelectObject: (obj: UELEObject) => void;
  onSelectComponent?: (obj: UELEObject, comp: UELEObjectComponent) => void;
  onSelectHotspot?: (obj: UELEObject, hs: UELEHotspot) => void;
  onNavigateToRoadmap?: (roadmapId?: string) => void;
  currentEnv: string;
  onSelectEnv: (env: string) => void;
}

// Parent facility node interface for GIS scale
interface ParentFacilityNode {
  id: string;
  name: string;
  code: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  locationDetails: string;
  specs: { label: string; value: string }[];
}

// GIS Facilities in Sherpur, Bogura
const countryFacilities: ParentFacilityNode[] = [
  {
    id: 'raw-water-intake',
    name: 'WTP Site & River Intake (Karatoa River)',
    code: 'WTP-SITE',
    category: 'Water Infrastructure',
    lat: 24.6780,
    lng: 89.4180,
    description: 'Centralized 50,000 m³/day surface water treatment complex supplying clean drinking water to Sherpur, Bogura.',
    locationDetails: 'East Karatoa Bank, Ward 04, Sherpur Pourashava, Bogura',
    specs: [
      { label: 'Design Capacity', value: '50,000 m³/day' },
      { label: 'Population Served', value: '250,000 citizens' },
      { label: 'Source River', value: 'Karatoa River Basin' },
      { label: 'Water Quality', value: 'WHO / BDS Standard' },
    ],
  },
  {
    id: 'vocational-training-center',
    name: 'Engineering Village & Bazar (Mirzapur)',
    code: 'EV-SITE',
    category: 'Community & Commerce',
    lat: 24.6620,
    lng: 89.4050,
    description: 'Vocational training hub, local equipment bazar, deep tube-well grid, and solar microgrid community in Mirzapur, Sherpur.',
    locationDetails: 'Mirzapur Union, Sherpur Upazila, Bogura',
    specs: [
      { label: 'Trainee Capacity', value: '1,200 apprentices/yr' },
      { label: 'Deep Tube-wells', value: '12 Grid Units' },
      { label: 'Solar Rooftops', value: '450 kW Peak' },
      { label: 'Irrigation Canals', value: '8.5 km Served' },
    ],
  },
  {
    id: 'smart-city-substation',
    name: 'Sherpur Town Center & Smart Core',
    code: 'CITY-CORE',
    category: 'Civic & Urban',
    lat: 24.6750,
    lng: 89.4167,
    description: 'High-density urban civic district with automated traffic control, municipal water distribution, and smart grid sub-stations.',
    locationDetails: 'Sherpur Pourashava Center, Dhaka-Bogura Highway Axis',
    specs: [
      { label: 'Civic Connections', value: '18,500 Meters' },
      { label: 'Smart Lighting', value: '2,400 LED Nodes' },
      { label: 'SCADA Telemetry', value: '24/7 Real-Time' },
      { label: 'Uptime Reliability', value: '99.95%' },
    ],
  },
  {
    id: 'automated-irrigation-sluice',
    name: 'Garidaha Agricultural & Irrigation Hub',
    code: 'AGRI-HUB',
    category: 'Agriculture & Food Security',
    lat: 24.6500,
    lng: 89.3900,
    description: 'Automated canal sluice gates, solar-powered lifting pumps, soil moisture telemetry, and agritech greenhouse center in Garidaha.',
    locationDetails: 'Garidaha Union, South Sherpur, Bogura',
    specs: [
      { label: 'Arable Land Served', value: '4,500 Hectares' },
      { label: 'Solar Pumps', value: '34 Lift Stations' },
      { label: 'Water Savings', value: '38% Efficiency' },
      { label: 'Crop Yield Gain', value: '+28% Annual' },
    ],
  },
  {
    id: 'solar-power-plant',
    name: 'Khanpur Renewable Energy Park',
    code: 'PWR-PARK',
    category: 'Energy & Power',
    lat: 24.6900,
    lng: 89.4400,
    description: 'Utility-scale 25 MW Solar PV field & 132kV automated substation transmitting clean power into the Bangladesh National Grid.',
    locationDetails: 'Khanpur Union, East Sherpur, Bogura',
    specs: [
      { label: 'Solar PV Output', value: '25 MW Peak' },
      { label: 'Substation Voltage', value: '132/33 kV' },
      { label: 'Grid Export', value: '42,000 MWh/yr' },
      { label: 'CO2 Offset', value: '31,500 Tons/yr' },
    ],
  },
  {
    id: 'river-dam-spillway',
    name: 'Karatoa River Control Works & Reservoir',
    code: 'DAM-RES',
    category: 'Hydraulic Infrastructure',
    lat: 24.7100,
    lng: 89.4250,
    description: 'Upstream barrage, spillway radial gates, and sediment settling basin protecting Sherpur from seasonal flooding.',
    locationDetails: 'North Karatoa River Alignment, Upper Sherpur, Bogura',
    specs: [
      { label: 'Reservoir Storage', value: '4.2 Million m³' },
      { label: 'Spillway Capacity', value: '1,800 m³/s' },
      { label: 'Flood Protection', value: '1-in-[100 Year] Event' },
      { label: 'Gate Automation', value: 'Motorized SCADA' },
    ],
  },
  {
    id: 'cable-stayed-bridge',
    name: 'Karatoa Cable-Stayed Highway Bridge',
    code: 'BRG-EXPR',
    category: 'Transportation',
    lat: 24.6850,
    lng: 89.4210,
    description: '4-lane 480m cable-stayed bridge spanning Karatoa River along the N3 Dhaka-Bogura National Highway Corridor.',
    locationDetails: 'N3 National Highway Crossing, Sherpur Bypass, Bogura',
    specs: [
      { label: 'Bridge Length', value: '480 meters' },
      { label: 'Lanes', value: '4 Traffic + Utility Duct' },
      { label: 'Daily Vehicle Flow', value: '38,000 Vehicles' },
      { label: 'Structural Sensors', value: '48 Load Cells' },
    ],
  },
];

// Interactive Leaflet Component for Live Satellite GIS Map (Sherpur, Bogura)
const LiveGisSatelliteMap: React.FC<{
  facilities: ParentFacilityNode[];
  selectedFacilityId: string;
  onSelectFacility: (id: string) => void;
  theme: 'light' | 'dark';
}> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  theme,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Sherpur, Bogura, Bangladesh (24.6750° N, 89.4167° E)
    const map = L.map(mapContainerRef.current, {
      center: [24.6750, 89.4167],
      zoom: 13,
      zoomControl: true,
    });

    // High-Resolution Esri World Imagery Satellite Tiles
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Satellite &copy; Esri, Maxar | Sherpur, Bogura GIS',
        maxZoom: 18,
      }
    );

    // Reference Labels & Roads Overlay
    const labelsOverlay = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        opacity: 0.85,
      }
    );

    satelliteTiles.addTo(map);
    labelsOverlay.addTo(map);

    // Karatoa River Line Overlay
    const riverCoords: [number, number][] = [
      [24.7200, 89.4300],
      [24.7050, 89.4240],
      [24.6880, 89.4210],
      [24.6780, 89.4180],
      [24.6650, 89.4120],
      [24.6450, 89.4000],
    ];
    L.polyline(riverCoords, {
      color: '#0284c7',
      weight: 6,
      opacity: 0.8,
      dashArray: '8, 4',
    })
      .addTo(map)
      .bindTooltip('Karatoa River Flow Channel (Sherpur)', { permanent: false });

    // Highway N3 Line Overlay
    const highwayCoords: [number, number][] = [
      [24.7150, 89.4100],
      [24.6850, 89.4210],
      [24.6750, 89.4167],
      [24.6550, 89.4080],
      [24.6350, 89.3980],
    ];
    L.polyline(highwayCoords, {
      color: '#f59e0b',
      weight: 5,
      opacity: 0.9,
    })
      .addTo(map)
      .bindTooltip('N3 Highway Corridor (Dhaka-Bogura)', { permanent: false });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Facility Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    facilities.forEach((fac) => {
      const isSel = fac.id === selectedFacilityId;

      const customHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer">
          <div class="absolute -inset-2 rounded-full ${
            isSel ? 'bg-emerald-500/50 animate-ping' : 'bg-cyan-500/30'
          }"></div>
          <div class="relative px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-white shadow-2xl flex items-center gap-1.5 border ${
            isSel
              ? 'bg-emerald-600 border-white ring-2 ring-emerald-400'
              : 'bg-slate-900/90 border-cyan-400 hover:bg-slate-800'
          }">
            <span class="w-2 h-2 rounded-full ${isSel ? 'bg-white animate-pulse' : 'bg-cyan-400'}"></span>
            <span>${fac.code}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-gis-marker',
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 font-mono text-slate-900 space-y-2 min-w-[240px]';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">${fac.category}</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">${fac.code}</span>
        </div>
        <h4 class="text-xs font-bold text-slate-900 leading-snug">${fac.name}</h4>
        <p class="text-[11px] text-slate-600 leading-tight">${fac.description}</p>
        <div class="text-[10px] text-slate-500 font-bold bg-slate-100 p-1.5 rounded">
          📍 ${fac.locationDetails}
        </div>
      `;

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectFacility(fac.id);
      });

      markersRef.current[fac.id] = marker;
    });
  }, [facilities, selectedFacilityId, onSelectFacility]);

  // Center on selected facility
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const fac = facilities.find((f) => f.id === selectedFacilityId);
    if (fac) {
      map.flyTo([fac.lat, fac.lng], 14, { duration: 1.2 });
      const m = markersRef.current[fac.id];
      if (m) m.openPopup();
    }
  }, [selectedFacilityId, facilities]);

  return (
    <div className="relative w-full h-[580px] sm:h-[660px] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating GIS Info Ribbon */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/50 text-white font-mono text-xs shadow-xl flex items-center gap-2">
        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        <div>
          <div className="font-bold text-emerald-300 flex items-center gap-1.5">
            <span>LIVE GIS SATELLITE MAP — SHERPUR, BOGURA</span>
          </div>
          <div className="text-[10px] text-slate-300">
            24.6750° N, 89.4167° E | Karatoa River & N3 Highway
          </div>
        </div>
      </div>
    </div>
  );
};

export const MasterEngineeringMap2D: React.FC<MasterEngineeringMap2DProps> = ({
  objects,
  selectedObject,
  selectedComponentId = null,
  selectedHotspot = null,
  onSelectObject,
  onSelectComponent,
  onSelectHotspot,
  onNavigateToRoadmap,
  currentEnv,
  onSelectEnv,
}) => {
  const [activeFacilityId, setActiveFacilityId] = useState<string>('raw-water-intake');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isLight = theme === 'light';

  const currentSelectedFacility = useMemo(() => {
    return countryFacilities.find((f) => f.id === activeFacilityId) || countryFacilities[0];
  }, [activeFacilityId]);

  return (
    <div className={`space-y-4 font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
      {/* MAIN TOOLBAR */}
      <div className={`p-3.5 rounded-2xl border shadow-xl transition-colors duration-200 ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-600 font-mono text-xs font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>🛰️ GIS SATELLITE MAP (SHERPUR, BOGURA)</span>
            </div>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isLight ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-amber-300" />}
            <span>{isLight ? '☀️ DAYLIGHT' : '🌙 NIGHT'}</span>
          </button>
        </div>
      </div>

      {/* PRIMARY DISPLAY VIEWPORT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* MAP CANVAS CONTAINER (3 COLUMNS) */}
        <div className="lg:col-span-3 relative">
          <LiveGisSatelliteMap
            facilities={countryFacilities}
            selectedFacilityId={activeFacilityId}
            onSelectFacility={(id) => {
              setActiveFacilityId(id);
              const obj = objects.find((o) => o.id === id);
              if (obj) onSelectObject(obj);
            }}
            theme={theme}
          />
        </div>

        {/* SIDEBAR FACILITY INSPECTOR (1 COLUMN) */}
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border shadow-xl space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                {currentSelectedFacility.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                {currentSelectedFacility.code}
              </span>
            </div>

            <h3 className="text-sm font-bold font-mono leading-snug">
              {currentSelectedFacility.name}
            </h3>

            <p className="text-xs leading-relaxed text-slate-600">
              {currentSelectedFacility.description}
            </p>

            <div className="text-[11px] font-mono text-slate-500 bg-slate-100 p-2 rounded-xl">
              📍 {currentSelectedFacility.locationDetails}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              {currentSelectedFacility.specs.map((spec, i) => (
                <div key={i} className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 block">{spec.label}</span>
                  <span className="text-emerald-600 font-bold text-xs">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav Directory */}
          <div className={`p-3 rounded-2xl border space-y-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
              SHERPUR SITES DIRECTORY ({countryFacilities.length})
            </span>
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {countryFacilities.map((fac) => (
                <button
                  key={fac.id}
                  onClick={() => {
                    setActiveFacilityId(fac.id);
                    const matchedObj = objects.find((o) => o.id === fac.id);
                    if (matchedObj) onSelectObject(matchedObj);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between border cursor-pointer ${
                    fac.id === activeFacilityId
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-transparent hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{fac.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">{fac.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
