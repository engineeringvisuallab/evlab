// Real rendered preview image imports for EVLab Railing and RailTrack tools (Completely Unpopulated / No People)
import railingGlassImg from '../assets/images/railing_glass_preview_1789977434856.jpg';
import railingCableImg from '../assets/images/railing_cable_preview_1789977454065.jpg';
import railingIronImg from '../assets/images/railing_iron_preview_1789977470394.jpg';
import railingSlatsImg from '../assets/images/railing_slats_preview_1789977487764.jpg';
import railingPipeImg from '../assets/images/railing_pipe_preview_1789977565114.jpg';
import railingTimberImg from '../assets/images/railing_timber_preview_1789977501664.jpg';
import railingMeshImg from '../assets/images/railing_mesh_preview_1789977581663.jpg';
import railingGlassWoodImg from '../assets/images/railing_glass_wood_preview_1789977517473.jpg';
import railingXbraceImg from '../assets/images/railing_xbrace_preview_1789977596958.jpg';
import railingSafetyImg from '../assets/images/railing_safety_preview_1789977531484.jpg';

import railTrackBroadImg from '../assets/images/railway_track_preview_1789977550428.jpg';
import railTrackDualImg from '../assets/images/dual_gauge_track_preview_1789977610878.jpg';
import railTrackMetroImg from '../assets/images/metro_gauge_track_preview_1789977625255.jpg';
import railTrackMeterImg from '../assets/images/meter_gauge_track_preview_1789977644182.jpg';

export const RAILING_PREVIEW_IMAGES: Record<string, string> = {
  'style-1': railingGlassImg,
  'style-2': railingCableImg,
  'style-3': railingIronImg,
  'style-4': railingSlatsImg,
  'style-5': railingPipeImg,
  'style-6': railingTimberImg,
  'style-7': railingMeshImg,
  'style-8': railingGlassWoodImg,
  'style-9': railingXbraceImg,
  'style-10': railingSafetyImg,
};

export const RAIL_TRACK_PREVIEW_IMAGES: Record<string, string> = {
  'broad-gauge': railTrackBroadImg,
  'dual-gauge': railTrackDualImg,
  'standard-gauge': railTrackMetroImg,
  'meter-gauge': railTrackMeterImg,
};
