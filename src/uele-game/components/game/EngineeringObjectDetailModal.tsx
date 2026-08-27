import React from 'react';
import { LandmarkZone } from '../../utils/miniCountryTerrain';
import { X, ExternalLink, Compass, ShieldCheck, MapPin, Eye } from 'lucide-react';

interface EngineeringObjectDetailModalProps {
  landmark: LandmarkZone | null;
  onClose: () => void;
  onTeleportTo: (lm: LandmarkZone) => void;
  onStartHelicopterTour?: (target: [number, number], name: string) => void;
}

export const EngineeringObjectDetailModal: React.FC<EngineeringObjectDetailModalProps> = ({
  landmark,
  onClose,
  onTeleportTo,
  onStartHelicopterTour,
}) => {
  if (!landmark) return null;

  // Technical engineering specifications generated per category/object
  const getEngineeringSpecs = (lm: LandmarkZone) => {
    switch (lm.id) {
      case 'ayt_mart_mall':
        return [
          { label: 'Facility Type', value: 'Multi-Level Commercial Complex & Hypermarket' },
          { label: 'Footprint Area', value: '85m × 70m (4 Stories + Skylight Atrium)' },
          { label: 'Parking & Green Mobility', value: 'High-Capacity EV Fast-Charging Plaza' },
          { label: 'Structural System', value: 'Post-Tensioned Flat Slabs with Steel Truss Roof' },
        ];
      case 'ayt_books_library':
        return [
          { label: 'Architectural Style', value: 'Modern Louvered Facade & Panoramic Reading Atrium' },
          { label: 'Collection Capacity', value: '500,000+ Physical Volumes & Digital Archive' },
          { label: 'Environmental Design', value: 'Solar Shading Fins with High-Comfort Natural Daylighting' },
          { label: 'Outdoor Amenities', value: 'Timber Pergola Reading Courtyard & Study Garden' },
        ];
      case 'international_airport_zone':
        return [
          { label: 'Airfield Classification', value: 'ICAO Code 4F International Airport' },
          { label: 'Primary Runway 09L/27R', value: '3,400m × 75m Heavy-Load Asphalt Pavement' },
          { label: 'Terminal Architecture', value: 'Curved Wing Aerodynamic Terminal with 4 Jet Bridges' },
          { label: 'Air Traffic Control', value: '85m ATC Tower with 360° Panoramic Control Cab & Radar' },
          { label: 'Security & Perimeter', value: 'Heavy Reinforced Concrete Boundary Wall & 24/7 Watchtowers' },
        ];
      case 'smart_city_core':
        return [
          { label: 'Structural Type', value: 'High-Density Reinforced Concrete & Steel Frame' },
          { label: 'Grid Topology', value: 'Smart Urban Radial Grid with Underground Utility Corridor' },
          { label: 'Power Consumption', value: '48.5 MW Peak Load' },
          { label: 'Transit Integration', value: 'Elevated Dual-Track Metro Viaduct' },
        ];
      case 'urban_hospital_complex':
        return [
          { label: 'Facility Type', value: 'Multi-Specialty Medical Trauma Center (Level 1)' },
          { label: 'Bed Capacity', value: '750 Inpatient Beds + 40 ICU Suites' },
          { label: 'Emergency Logistics', value: 'Dedicated Ambulance Bays & Rooftop Helipad' },
          { label: 'HVAC Air Filtration', value: 'HEPA Positive Pressure Clean Air Units' },
        ];
      case 'foundation_construction_site':
        return [
          { label: 'Foundation Archetype', value: 'Deep Bored Pile & Cast-in-situ Diaphragm Wall' },
          { label: 'Lifting Equipment', value: '42m Lattice Mast Tower Crane (12-Ton Capacity)' },
          { label: 'Excavation Depth', value: '14.5m 3-Level Subterranean Basements' },
          { label: 'Structural Framing', value: 'High-Yield Deformed Steel Rebar Cages (Grade 60)' },
        ];
      case 'urban_public_park':
        return [
          { label: 'Civic Function', value: 'Urban Heat-Island Mitigation & Community Recreation' },
          { label: 'Landscape Architecture', value: 'Permeable Stone Paving & Bio-swale Drainage' },
          { label: 'Facilities', value: 'Children Playground, Sun Gazebo, Shaded Trees' },
          { label: 'Permeability', value: '85% Rainwater Ground Recharge' },
        ];
      case 'grand_mosque_monument':
        return [
          { label: 'Architectural Style', value: 'Neo-Islamic Civic Monument & Terracotta Heritage' },
          { label: 'Structural Dome', value: 'Lightweight Ferro-Cement Central Dome (13m Span)' },
          { label: 'Minaret Height', value: '4 × 26m Reinforced Concrete Slender Minarets' },
          { label: 'Heritage Pavilion', value: 'Handmade Terracotta Relief Brick Finishes' },
        ];
      case 'curved_highway_flyover':
        return [
          { label: 'Highway Structure', value: 'Grade-Separated Elevated Post-Tensioned Concrete Viaduct' },
          { label: 'Curve Radius', value: 'R=65m Superelevated Smooth Transition Spiral' },
          { label: 'Pier Substructure', value: 'Cylindrical Monolithic Concrete Columns on Deep Piles' },
          { label: 'Safety Barricade', value: 'Continuous TL-4 Concrete Jersey Crash Parapet' },
        ];
      case 'thermal_power_substation':
        return [
          { label: 'Generation Type', value: 'Combined Cycle Thermal Generation Plant (360 MW)' },
          { label: 'Cooling Chimneys', value: '46m Flue Gas Stacks with Electrostatic Precipitator' },
          { label: 'Substation Voltage', value: '230kV / 33kV Step-up Power Transformers' },
          { label: 'Transmission System', value: 'Quad-Bundle Overhead Conductors on Lattice Pylons' },
        ];
      case 'padma_river_bridge':
        return [
          { label: 'Bridge Type', value: 'Cable-Stayed Double-Deck Composite Girder' },
          { label: 'Main Span Length', value: '150m Per Span (Total 6 spans)' },
          { label: 'Pier Foundation', value: 'Deep Drilled Shaft Concrete Caissons (30m depth)' },
          { label: 'Traffic Capacity', value: '4-Lane Express Highway + Heavy Rail Deck' },
        ];
      case 'agricultural_delta_harvesters':
        return [
          { label: 'Agricultural Domain', value: 'Precision Irrigated Alluvial Paddy Cultivation' },
          { label: 'Mechanization', value: 'Diesel Track Combine Harvesters & Multi-Plow Tractors' },
          { label: 'Water Management', value: 'Engineered Gravity Feed Canal System & Water Pumps' },
          { label: 'Greenhouse Systems', value: 'Polyethylene Tunnel Climate Controlled Agriculture' },
        ];
      case 'aerospace_launch_complex':
        return [
          { label: 'Aerospace Systems', value: 'Dual Runway 09/27 + Orbital Space Rocket Launch Pad' },
          { label: 'Flight Trajectory', value: 'Active Commercial Airliner Circuit + Space Ascent Loop' },
          { label: 'Avionics & Radar', value: 'CAT-II Instrument Landing System & Primary Surveillance' },
          { label: 'Launch Vehicle', value: 'Two-Stage Heavy Orbital Space Satellite Booster' },
        ];
      case 'mountain_highway_tunnel':
        return [
          { label: 'Excavation Method', value: 'NATM / Hard Rock Tunnel Boring Machine (TBM)' },
          { label: 'Tunnel Bore Diameter', value: '11.8m Dual-Tube Cross Section' },
          { label: 'Ventilation System', value: 'Transverse Jet Fan Airflow Induction' },
          { label: 'Safety Systems', value: 'Illuminated LED Runways, SOS Fire Portals' },
        ];
      case 'mountain_wind_farm':
        return [
          { label: 'Turbine Model', value: '3-Blade Horizontal Axis Wind Turbine (HAWT)' },
          { label: 'Hub Height / Rotor Diameter', value: '38m Hub Height / 40m Rotor Sweep' },
          { label: 'Rated Capacity', value: '6 × 2.5 MW (15.0 MW Total Green Capacity)' },
          { label: 'Grid Connection', value: '33kV Substation Mountain Step-Up' },
        ];
      case 'hydro_dam_reservoir':
        return [
          { label: 'Dam Archetype', value: 'Roller-Compacted Concrete (RCC) Gravity Dam' },
          { label: 'Crest Height', value: '28.5m Mountain Valley Containment' },
          { label: 'Spillway Capacity', value: '4,200 m³/s Radial Gate Discharge' },
          { label: 'Turbine Units', value: 'Francis Reaction Turbines (4 × 40 MW)' },
        ];
      case 'deep_sea_port_terminal':
        return [
          { label: 'Quay Wall Length', value: '320m Deepwater Concrete Caisson Wharf' },
          { label: 'Berth Draft Depth', value: '14.5m Panamax & Post-Panamax Clearance' },
          { label: 'STS Gantry Cranes', value: '2 × 65-Ton Heavy-Duty Super Post-Panamax Cranes' },
          { label: 'Annual Throughput', value: '1.2 Million TEU Intermodal Capacity' },
        ];
      case 'sundarbans_mangrove_forest':
        return [
          { label: 'Ecosystem Type', value: 'Tidal Halophytic Mangrove Wetland' },
          { label: 'Canopy Density', value: 'Multi-tiered Sundari & Gewa Biosphere' },
          { label: 'Hydrology', value: 'Intertidal Deltaic Creeks & Brackish Channels' },
          { label: 'Ecological Function', value: 'Natural Cyclone Wave Dissipation & Carbon Sink' },
        ];
      case 'international_airport':
        return [
          { label: 'Runway Classification', value: 'CAT-II Precision Instrument Runway 09/27' },
          { label: 'Runway Length / Pavement', value: '240m Asphaltic Concrete Heavy Pavement' },
          { label: 'Avionics & Radar', value: 'Primary Surveillance Radar + ILS Localizer' },
          { label: 'Aircraft Servicing', value: 'Widebody Boeing 787 / Airbus A350 Compatible' },
        ];
      default:
        return [
          { label: 'Engineering Domain', value: 'Civil Infrastructure & Environmental Systems' },
          { label: 'Coordinates', value: `X: ${lm.center[0]}m, Z: ${lm.center[1]}m` },
          { label: 'Visual Inspection Radius', value: `${lm.radius}m Survey Perimeter` },
        ];
    }
  };

  const specs = getEngineeringSpecs(landmark);

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-xl w-full shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              {landmark.icon}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                3D Engineering Visual Inspection
              </span>
              <h2 className="text-xl font-black text-white">{landmark.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
          <p className="text-sm text-slate-300 leading-relaxed">
            {landmark.description}
          </p>
        </div>

        {/* Technical Engineering Specifications Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Structural & Engineering Specifications</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {specs.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-semibold block">{item.label}</span>
                <span className="text-xs font-bold text-cyan-200 mt-0.5 block">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions (Teleport / Fly to Landmark) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>X: {landmark.center[0]}m, Z: {landmark.center[1]}m</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            {onStartHelicopterTour && (
              <button
                onClick={() => {
                  onStartHelicopterTour(landmark.center, landmark.name);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>🚁 Fly via Helicopter</span>
              </button>
            )}
            <button
              onClick={() => {
                onTeleportTo(landmark);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Jump Instant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
