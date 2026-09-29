import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Terminal,
  Sparkles,
  Sliders,
  Compass,
  FileCode,
} from 'lucide-react';
import { Language } from '../types';
import { AUTOCAD_PLUGINS } from '../data/pluginsAutoCAD';
import { triggerPluginDownload } from '../utils/fileDownloader';

interface AutoLayerVisualizerProps {
  lang?: Language;
}

type DisciplineKey = 'all' | 'arch' | 'str' | 'mep' | 'elec' | 'plumb' | 'hvac' | 'civil';

interface LayerDef {
  name: string;
  discipline: 'arch' | 'str' | 'elec' | 'plumb' | 'hvac' | 'civil' | 'gen';
  aciColor: number;
  hexColor: string;
  colorName: string;
  linetype: string;
  lineweightMm: number;
  descBn: string;
  descEn: string;
}

const CAD_LAYER_DATABASE: LayerDef[] = [
  // Architecture
  {
    name: 'A-WALL-FULL',
    discipline: 'arch',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'মেইন এক্সটেরিয়র ও ১০ ইঞ্চি লোড-বেয়ারিং ওয়াল',
    descEn: 'Main exterior 10" structural/brick walls',
  },
  {
    name: 'A-WALL-PART',
    discipline: 'arch',
    aciColor: 2,
    hexColor: '#EAB308',
    colorName: 'Yellow (2)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'অভ্যন্তরীণ ৫ ইঞ্চি পার্টিশন দেয়াল',
    descEn: 'Internal 5" partition walls',
  },
  {
    name: 'A-COLS',
    discipline: 'arch',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'আর্কিটেকচারাল ফিনিশড কলাম ও পিলার',
    descEn: 'Architectural finished columns and piers',
  },
  {
    name: 'A-DOOR',
    discipline: 'arch',
    aciColor: 3,
    hexColor: '#22C55E',
    colorName: 'Green (3)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'দরজা, ডোর ফ্রেম ও সুইং ক্লিয়ারেন্স আর্ক',
    descEn: 'Doors, frames & swing clearance arcs',
  },
  {
    name: 'A-WIND',
    discipline: 'arch',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'জানালা, থাই গ্লাস ও উইন্ডো সিল',
    descEn: 'Windows, glazing glass, frames & sills',
  },
  {
    name: 'A-STRS',
    discipline: 'arch',
    aciColor: 30,
    hexColor: '#F97316',
    colorName: 'Orange (30)',
    linetype: 'Continuous',
    lineweightMm: 0.3,
    descBn: 'সিঁড়ি, রাইজার, ট্রেড ও হ্যান্ডরেইলিং',
    descEn: 'Stairs, flights, steps & handrails',
  },
  {
    name: 'A-FURN',
    discipline: 'arch',
    aciColor: 8,
    hexColor: '#64748B',
    colorName: 'Gray (8)',
    linetype: 'Continuous',
    lineweightMm: 0.15,
    descBn: 'আসবাবপত্র, স্যানিটারি ও কেবিনেট লেআউট',
    descEn: 'Furniture, sanitary fixtures & joinery',
  },
  {
    name: 'A-FLOR-FINS',
    discipline: 'arch',
    aciColor: 9,
    hexColor: '#94A3B8',
    colorName: 'Light Gray (9)',
    linetype: 'Continuous',
    lineweightMm: 0.15,
    descBn: 'ফ্লোর ফিনিশ, টাইলস প্যাটার্ন ও ড্রপ লেভেল',
    descEn: 'Floor finish tiles pattern & levels',
  },
  {
    name: 'A-ROOF-PARP',
    discipline: 'arch',
    aciColor: 5,
    hexColor: '#3B82F6',
    colorName: 'Blue (5)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: 'ছাদের বাউন্ডারি, প্যারাফেট ও কোপিং',
    descEn: 'Roof boundary, parapet walls & coping',
  },
  {
    name: 'A-HATCH',
    discipline: 'arch',
    aciColor: 253,
    hexColor: '#475569',
    colorName: 'Dark Gray (253)',
    linetype: 'Continuous',
    lineweightMm: 0.09,
    descBn: 'হ্যাচ প্যাটার্ন (ইট, সলিড কংক্রিট, মাটি)',
    descEn: 'Hatch patterns (brick, concrete, earth)',
  },
  {
    name: 'A-DIMS',
    discipline: 'arch',
    aciColor: 2,
    hexColor: '#EAB308',
    colorName: 'Yellow (2)',
    linetype: 'Continuous',
    lineweightMm: 0.18,
    descBn: 'আর্কিটেকচারাল রুম ও ওয়াল ডাইমেনশন',
    descEn: 'Architectural dimensions & room spans',
  },
  {
    name: 'A-TEXT',
    discipline: 'arch',
    aciColor: 7,
    hexColor: '#F8FAFC',
    colorName: 'White (7)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'রুমের নাম, এরিয়া ট্যাগ ও ড্রাফটিং নোটস',
    descEn: 'Room names, area tags & general notes',
  },
  {
    name: 'A-GRID',
    discipline: 'arch',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'CENTER',
    lineweightMm: 0.18,
    descBn: 'আর্কিটেকচারাল বিল্ডিং কলাম গ্রিড লাইন',
    descEn: 'Architectural building grid lines',
  },
  {
    name: 'A-SECT-CUT',
    discipline: 'arch',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'PHANTOM',
    lineweightMm: 0.5,
    descBn: 'সেকশন কাটিং লাইন ও ভিউ অ্যারো',
    descEn: 'Section cutting plane & view arrows',
  },

  // Structure
  {
    name: 'S-COLS',
    discipline: 'str',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'Continuous',
    lineweightMm: 0.6,
    descBn: 'আরসি স্ট্রাকচারাল কলাম ও ড্রপ প্যানেল',
    descEn: 'Reinforced concrete columns & drop panels',
  },
  {
    name: 'S-BEAM-PRIM',
    discipline: 'str',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'মূল ফ্রেমের প্রাইমারি বিম ও গার্ডার',
    descEn: 'Primary structural framing beams',
  },
  {
    name: 'S-BEAM-SECD',
    discipline: 'str',
    aciColor: 2,
    hexColor: '#EAB308',
    colorName: 'Yellow (2)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: 'সেকেন্ডারি বিম ও লিন্টেল টাই বিম',
    descEn: 'Secondary beams & lintel tie beams',
  },
  {
    name: 'S-BEAM-HDDN',
    discipline: 'str',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'HIDDEN',
    lineweightMm: 0.3,
    descBn: 'স্লাবের নিচে লুকায়িত / ইনভার্টেড বিম',
    descEn: 'Concealed / under-slab inverted beams',
  },
  {
    name: 'S-SLAB-OUTL',
    discipline: 'str',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: 'স্লাব বাউন্ডারি, সানকেন ড্রপ ও শ্যাফট কাটআউট',
    descEn: 'RC slab boundaries & sunken drops',
  },
  {
    name: 'S-FNDN-FOOT',
    discipline: 'str',
    aciColor: 5,
    hexColor: '#3B82F6',
    colorName: 'Blue (5)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'আইসোলেটেড / কম্বাইন্ড ফুটিং ও ম্যাট ফাউন্ডেশন',
    descEn: 'Footing foundations & mat raft',
  },
  {
    name: 'S-PILE-CAP',
    discipline: 'str',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'কাস্ট-ইন-সিটু পাইল ও পাইল ক্যাপ',
    descEn: 'Cast-in-situ bored piles & pile caps',
  },
  {
    name: 'S-REBAR-MAIN',
    discipline: 'str',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.6,
    descBn: 'মেইন টেনশন ও কম্প্রেশন লংগিটিউডিনাল রড',
    descEn: 'Main longitudinal rebar steel',
  },
  {
    name: 'S-REBAR-TIES',
    discipline: 'str',
    aciColor: 3,
    hexColor: '#22C55E',
    colorName: 'Green (3)',
    linetype: 'Continuous',
    lineweightMm: 0.3,
    descBn: 'রিং / টাই রড, স্পাইরাল ও কলাম টাই',
    descEn: 'Stirrups, column ties & links',
  },
  {
    name: 'S-REBAR-CRANK',
    discipline: 'str',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'DASHED',
    lineweightMm: 0.35,
    descBn: 'ক্র্যাংক রড ও এক্সট্রা টপ ক্যান্টিলিভার রড',
    descEn: 'Cranked bars & extra top cantilever steel',
  },
  {
    name: 'S-REBAR-TEXT',
    discipline: 'str',
    aciColor: 7,
    hexColor: '#F8FAFC',
    colorName: 'White (7)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'রডের সাইজ, স্পেসিং (#16@6" c/c) ও বিওকিউ ট্যাগ',
    descEn: 'Rebar marks (#16@6" c/c) & BBS notes',
  },
  {
    name: 'S-GRID',
    discipline: 'str',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'CENTER',
    lineweightMm: 0.18,
    descBn: 'স্ট্রাকচারাল সেন্টারলাইন ও কলাম গ্রিড',
    descEn: 'Structural grid lines & column centers',
  },

  // Electrical
  {
    name: 'E-POWR-SOCK',
    discipline: 'elec',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: '১৩এ / ১৫এ পাওয়ার সুইচ সকেট ও পাওয়ার পয়েন্ট',
    descEn: 'Power switch socket outlets (13A/15A)',
  },
  {
    name: 'E-LITE-FIXT',
    discipline: 'elec',
    aciColor: 2,
    hexColor: '#EAB308',
    colorName: 'Yellow (2)',
    linetype: 'Continuous',
    lineweightMm: 0.3,
    descBn: 'লাইট ফিক্সচার (এলইডি প্যানেল, টিউব, ডাউনলাইট)',
    descEn: 'Lighting fixtures (LED panels & downlights)',
  },
  {
    name: 'E-LITE-SWCH',
    discipline: 'elec',
    aciColor: 3,
    hexColor: '#22C55E',
    colorName: 'Green (3)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'সুইচবোর্ড, গ্যাং সুইচ ও ২-ওয়ে সুইচ',
    descEn: 'Light switchboards & 2-way switches',
  },
  {
    name: 'E-CBL-TRAY',
    discipline: 'elec',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'Continuous',
    lineweightMm: 0.4,
    descBn: 'ওভারহেড ক্যাবল ট্রে ও ট্রাঙ্কিং',
    descEn: 'Overhead cable trays & raceways',
  },
  {
    name: 'E-CIRC-CONDUIT',
    discipline: 'elec',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'DASHED',
    lineweightMm: 0.25,
    descBn: 'কনডুইট পাইপ ওয়্যারিং ও সার্কিট লুপ',
    descEn: 'Conduit wiring paths & circuit loops',
  },
  {
    name: 'E-PANL-DB',
    discipline: 'elec',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'মেইন ও সাব ডিস্ট্রিবিউশন বোর্ড (MDB, SDB)',
    descEn: 'Distribution boards (MDB, SDB, DB)',
  },
  {
    name: 'E-LOWV-DATA',
    discipline: 'elec',
    aciColor: 5,
    hexColor: '#3B82F6',
    colorName: 'Blue (5)',
    linetype: 'Continuous',
    lineweightMm: 0.3,
    descBn: 'ডাটা ল্যান ক্যাবল, ওয়াই-ফাই রাউটার ও টেলিফোন',
    descEn: 'Data LAN Cat6, Wi-Fi AP & telecom',
  },
  {
    name: 'E-FIRE-ALRM',
    discipline: 'elec',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: 'ফায়ার অ্যালার্ম স্মোক ডিটেক্টর ও সাইরেন',
    descEn: 'Fire alarm smoke detectors & sirens',
  },

  // Plumbing
  {
    name: 'P-WATR-COLD',
    discipline: 'plumb',
    aciColor: 5,
    hexColor: '#3B82F6',
    colorName: 'Blue (5)',
    linetype: 'Continuous',
    lineweightMm: 0.4,
    descBn: 'খাবার পানির ঠান্ডা পাইপলাইন (PPR/CPVC)',
    descEn: 'Potable cold water supply piping',
  },
  {
    name: 'P-WATR-HOT',
    discipline: 'plumb',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'DASHED',
    lineweightMm: 0.4,
    descBn: 'গিজার ও সোলার গরম পানির ডিস্ট্রিবিউশন',
    descEn: 'Hot water pipe lines (Geyser supply)',
  },
  {
    name: 'P-SANR-SOIL',
    discipline: 'plumb',
    aciColor: 30,
    hexColor: '#F97316',
    colorName: 'Brown (30)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'কমোড ও টয়লেটের ৪ ইঞ্চি সয়েল ওয়েস্ট স্ট্যাক',
    descEn: 'Soil waste 4" blackwater pipe',
  },
  {
    name: 'P-SANR-WAST',
    discipline: 'plumb',
    aciColor: 3,
    hexColor: '#22C55E',
    colorName: 'Green (3)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: 'বেসিন ও কিচেনের ২/৩ ইঞ্চি ওয়েস্ট ওয়াটার',
    descEn: 'Waste greywater pipe 2"/3"',
  },
  {
    name: 'P-VENT-PIPE',
    discipline: 'plumb',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'HIDDEN',
    lineweightMm: 0.25,
    descBn: 'ভেন্ট পাইপ স্ট্যাক ও কাউল',
    descEn: 'Vent stack pipes & cowl outlets',
  },
  {
    name: 'P-RAIN-WATR',
    discipline: 'plumb',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'Continuous',
    lineweightMm: 0.4,
    descBn: 'ছাদ ও ব্যালকনির বৃষ্টির পানির ড্রেন (RWDP)',
    descEn: 'Rainwater down-pipes (RWDP)',
  },
  {
    name: 'P-FIXT-SNRY',
    discipline: 'plumb',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'Continuous',
    lineweightMm: 0.25,
    descBn: 'স্যানিটারি ফিক্সচার (কমোড, বেসিন, সিঙ্ক)',
    descEn: 'Sanitary fixtures (commode, basin, sink)',
  },

  // HVAC
  {
    name: 'M-DUCT-SPLY',
    discipline: 'hvac',
    aciColor: 5,
    hexColor: '#3B82F6',
    colorName: 'Blue (5)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'সাপ্লাই এয়ার ডাক্ট ও লাইনিং',
    descEn: 'Supply air ductwork & acoustic insulation',
  },
  {
    name: 'M-DUCT-RETN',
    discipline: 'hvac',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'DASHED',
    lineweightMm: 0.5,
    descBn: 'রিটার্ন এয়ার ডাক্টওয়ার্ক',
    descEn: 'Return air ductwork',
  },
  {
    name: 'M-DUCT-EXHST',
    discipline: 'hvac',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'Continuous',
    lineweightMm: 0.4,
    descBn: 'টয়লেট ও কিচেন এক্সহস্ট ভেন্টিলেশন ডাক্ট',
    descEn: 'Kitchen & toilet exhaust ventilation duct',
  },
  {
    name: 'M-DIFF-GRIL',
    discipline: 'hvac',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'Continuous',
    lineweightMm: 0.3,
    descBn: 'এয়ার সাপ্লাই ডিফিউজার ও রিটার্ন গ্রিল',
    descEn: 'Air diffusers, grilles & linear slots',
  },
  {
    name: 'M-EQUP-AC',
    discipline: 'hvac',
    aciColor: 2,
    hexColor: '#EAB308',
    colorName: 'Yellow (2)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'এইচভিএসি এসি ইকুইপমেন্ট (VRF, FCU, AHU)',
    descEn: 'HVAC AC equipment (VRF, FCU, AHU)',
  },

  // Civil
  {
    name: 'C-ROAD-EDGE',
    discipline: 'civil',
    aciColor: 7,
    hexColor: '#F8FAFC',
    colorName: 'White (7)',
    linetype: 'Continuous',
    lineweightMm: 0.5,
    descBn: 'রাস্তার প্রান্ত, ফুটপাত ও কার্ব লাইন',
    descEn: 'Road carriageway edges & footpaths',
  },
  {
    name: 'C-ROAD-CL',
    discipline: 'civil',
    aciColor: 1,
    hexColor: '#EF4444',
    colorName: 'Red (1)',
    linetype: 'CENTER',
    lineweightMm: 0.25,
    descBn: 'রাস্তার সেন্টারলাইন ও চেইনেজ',
    descEn: 'Road alignment centerline',
  },
  {
    name: 'C-PROP-BNDY',
    discipline: 'civil',
    aciColor: 6,
    hexColor: '#D946EF',
    colorName: 'Magenta (6)',
    linetype: 'PHANTOM',
    lineweightMm: 0.6,
    descBn: 'মৌজা প্লট বাউন্ডারি ও সীমানা প্রাচীর লাইন',
    descEn: 'Cadastral property boundary line',
  },
  {
    name: 'C-DRAIN-STORM',
    discipline: 'civil',
    aciColor: 4,
    hexColor: '#06B6D4',
    colorName: 'Cyan (4)',
    linetype: 'Continuous',
    lineweightMm: 0.4,
    descBn: 'সারফেস স্টর্ম ড্রেন ও কালভার্ট লাইন',
    descEn: 'Stormwater surface drainage & culverts',
  },
  {
    name: 'C-TOPO-MAJR',
    discipline: 'civil',
    aciColor: 30,
    hexColor: '#F97316',
    colorName: 'Brown (30)',
    linetype: 'Continuous',
    lineweightMm: 0.35,
    descBn: 'মেজর টপোগ্রাফিক্যাল কন্ট্যুর লাইন (৫মি)',
    descEn: 'Major ground contour lines (5m intervals)',
  },
];

export const AutoLayerVisualizer: React.FC<AutoLayerVisualizerProps> = ({ lang = 'en' }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineKey>('all');
  const [activeLayer, setActiveLayer] = useState<string>('A-WALL-FULL');
  const [hiddenLayers, setHiddenLayers] = useState<string[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'EVLab EVL-AutoLayer ready. Type LAY-ARCH, LAY-STR, LAY-MEP or LAY-ALL to generate layers.',
  ]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const autoLayerPlugin =
    AUTOCAD_PLUGINS.find((p) => p.id === 'autocad-evl-autolayer') || AUTOCAD_PLUGINS[0];

  const handleDownload = async () => {
    setIsDownloading(true);
    const success = await triggerPluginDownload(autoLayerPlugin);
    setIsDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const toggleLayerVisibility = (layerName: string) => {
    setHiddenLayers((prev) =>
      prev.includes(layerName) ? prev.filter((l) => l !== layerName) : [...prev, layerName],
    );
  };

  const executeCommand = (cmd: string) => {
    let logMsg = '';
    if (cmd === 'LAY-ARCH') {
      setSelectedDiscipline('arch');
      setActiveLayer('A-WALL-FULL');
      logMsg = 'Command: LAY-ARCH -> 14 Architectural Layers Created! Active Layer set to A-WALL-FULL';
    } else if (cmd === 'LAY-STR') {
      setSelectedDiscipline('str');
      setActiveLayer('S-COLS');
      logMsg = 'Command: LAY-STR -> 14 Structural Layers Created! Active Layer set to S-COLS (Magenta)';
    } else if (cmd === 'LAY-MEP') {
      setSelectedDiscipline('mep');
      setActiveLayer('E-POWR-SOCK');
      logMsg = 'Command: LAY-MEP -> 24 Combined Electrical, Plumbing & HVAC Layers Created!';
    } else if (cmd === 'LAY-CIVIL') {
      setSelectedDiscipline('civil');
      setActiveLayer('C-ROAD-EDGE');
      logMsg = 'Command: LAY-CIVIL -> 9 Civil, Road, Topo & Boundary Layers Created!';
    } else if (cmd === 'LAY-ALL') {
      setSelectedDiscipline('all');
      setActiveLayer('A-WALL-FULL');
      logMsg = 'Command: LAY-ALL -> Master Suite: ALL 65+ Standard Layers Generated Across All Disciplines!';
    } else if (cmd === 'LAY-SET') {
      logMsg = 'Command: LAY-SET -> Quick switcher ready. Select any layer to make it Active!';
    }
    setConsoleLogs((prev) => [logMsg, ...prev.slice(0, 4)]);
  };

  // Filter layers for table & canvas
  const displayedLayers = CAD_LAYER_DATABASE.filter((lay) => {
    if (selectedDiscipline === 'all') return true;
    if (selectedDiscipline === 'arch') return lay.discipline === 'arch';
    if (selectedDiscipline === 'str') return lay.discipline === 'str';
    if (selectedDiscipline === 'mep') {
      return (
        lay.discipline === 'elec' ||
        lay.discipline === 'plumb' ||
        lay.discipline === 'hvac'
      );
    }
    if (selectedDiscipline === 'elec') return lay.discipline === 'elec';
    if (selectedDiscipline === 'plumb') return lay.discipline === 'plumb';
    if (selectedDiscipline === 'hvac') return lay.discipline === 'hvac';
    if (selectedDiscipline === 'civil') return lay.discipline === 'civil';
    return true;
  });

  const isLayerVisible = (name: string) => !hiddenLayers.includes(name);

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Download Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📑</span>
            <h4 className="font-bold text-white text-sm sm:text-base">
              {lang === 'bn'
                ? 'EVL-AutoLayer: ক্যাড অটো লেয়ার জেনারেটর (LSP)'
                : 'EVL-AutoLayer: Multi-Discipline CAD Layer Generator'}
            </h4>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-900/60 text-red-300 border border-red-700/60">
              AutoLISP .lsp
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'আর্কিটেকচার, স্ট্রাকচার, এমইপি ও সিভিল ড্রয়িংয়ের জন্য স্ট্যান্ডার্ড কালার, লাইনটাইপ ও লাইনওয়েট সহ ৬৫+ লেয়ার'
              : 'Creates 65+ standard AIA/BS layers with standard colors, linetypes & lineweights per discipline'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600'
                : 'bg-red-600 hover:bg-red-500 active:scale-95'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ডাউনলোড সম্পন্ন!' : 'Downloaded!'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{lang === 'bn' ? 'EVL-AutoLayer.lsp ডাউনলোড' : 'Download EVL-AutoLayer.lsp'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Discipline Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium px-2 py-1">
          {lang === 'bn' ? 'ড্রয়িং নির্বাচন:' : 'Discipline:'}
        </span>

        <button
          type="button"
          onClick={() => executeCommand('LAY-ALL')}
          className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
            selectedDiscipline === 'all'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🌟 {lang === 'bn' ? 'সকল ৬৫+ লেয়ার (LAY-ALL)' : 'ALL 65+ Layers (LAY-ALL)'}
        </button>

        <button
          type="button"
          onClick={() => executeCommand('LAY-ARCH')}
          className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
            selectedDiscipline === 'arch'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🏛️ {lang === 'bn' ? 'আর্কিটেকচার (LAY-ARCH)' : 'Architecture (LAY-ARCH)'}
        </button>

        <button
          type="button"
          onClick={() => executeCommand('LAY-STR')}
          className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
            selectedDiscipline === 'str'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🏗️ {lang === 'bn' ? 'স্ট্রাকচার (LAY-STR)' : 'Structure (LAY-STR)'}
        </button>

        <button
          type="button"
          onClick={() => executeCommand('LAY-MEP')}
          className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
            selectedDiscipline === 'mep'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          ⚡ {lang === 'bn' ? 'এমইপি কম্বাইন্ড (LAY-MEP)' : 'MEP Combined (LAY-MEP)'}
        </button>

        <button
          type="button"
          onClick={() => executeCommand('LAY-CIVIL')}
          className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
            selectedDiscipline === 'civil'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🛣️ {lang === 'bn' ? 'সিভিল ও সাইট (LAY-CIVIL)' : 'Civil & Site (LAY-CIVIL)'}
        </button>
      </div>

      {/* CAD Canvas Simulator */}
      <div className="relative bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* CAD Window Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="font-mono text-slate-300">AutoCAD 2026 - Drawing1.dwg [Model Viewport]</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">Active Layer:</span>
              <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                {activeLayer}
              </span>
            </span>
            <span className="text-slate-500 font-mono">OSNAP: ON | LWT: ON | GRID: ON</span>
          </div>
        </div>

        {/* CAD Grid Canvas (SVG) */}
        <div className="p-2 sm:p-4 flex items-center justify-center bg-[#07090e]">
          <svg
            viewBox="0 0 760 360"
            className="w-full h-auto max-h-[360px] select-none"
            style={{ backgroundColor: '#05070a' }}
          >
            <defs>
              {/* CAD drafting background grid */}
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#141c28" strokeWidth="0.8" />
              </pattern>
              <pattern id="cadMajorGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#cadGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#1f2c3f" strokeWidth="1.2" />
              </pattern>

              {/* Hatch pattern for walls */}
              <pattern id="hatchBrick" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="0.8" />
              </pattern>
            </defs>

            <rect width="760" height="360" fill="url(#cadMajorGrid)" />

            {/* 1. GRID LINES (A-GRID / S-GRID) - Red CENTER linetype */}
            {(isLayerVisible('A-GRID') || isLayerVisible('S-GRID')) && (
              <g id="grid-layer" opacity="0.65">
                {/* Vertical Grids */}
                <line x1="120" y1="30" x2="120" y2="330" stroke="#EF4444" strokeWidth="1" strokeDasharray="14,4,4,4" />
                <line x1="380" y1="30" x2="380" y2="330" stroke="#EF4444" strokeWidth="1" strokeDasharray="14,4,4,4" />
                <line x1="640" y1="30" x2="640" y2="330" stroke="#EF4444" strokeWidth="1" strokeDasharray="14,4,4,4" />

                {/* Horizontal Grids */}
                <line x1="80" y1="80" x2="680" y2="80" stroke="#EF4444" strokeWidth="1" strokeDasharray="14,4,4,4" />
                <line x1="80" y1="280" x2="680" y2="280" stroke="#EF4444" strokeWidth="1" strokeDasharray="14,4,4,4" />

                {/* Grid Bubbles */}
                <circle cx="120" cy="22" r="11" fill="#1e1e24" stroke="#EF4444" strokeWidth="1.2" />
                <text x="120" y="26" fill="#F8FAFC" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">1</text>

                <circle cx="380" cy="22" r="11" fill="#1e1e24" stroke="#EF4444" strokeWidth="1.2" />
                <text x="380" y="26" fill="#F8FAFC" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">2</text>

                <circle cx="640" cy="22" r="11" fill="#1e1e24" stroke="#EF4444" strokeWidth="1.2" />
                <text x="640" y="26" fill="#F8FAFC" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">3</text>

                <circle cx="70" cy="80" r="11" fill="#1e1e24" stroke="#EF4444" strokeWidth="1.2" />
                <text x="70" y="84" fill="#F8FAFC" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">A</text>

                <circle cx="70" cy="280" r="11" fill="#1e1e24" stroke="#EF4444" strokeWidth="1.2" />
                <text x="70" y="284" fill="#F8FAFC" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">B</text>
              </g>
            )}

            {/* 2. CIVIL & PROPERTY BOUNDARY (C-PROP-BNDY / C-ROAD) */}
            {(isLayerVisible('C-PROP-BNDY') || isLayerVisible('C-ROAD-EDGE')) && (
              <g id="civil-layer">
                {/* Cadastral Property Boundary (PHANTOM Line / Magenta 0.60mm) */}
                {isLayerVisible('C-PROP-BNDY') && (
                  <>
                    <rect x="50" y="45" width="660" height="280" fill="none" stroke="#D946EF" strokeWidth="2.5" strokeDasharray="20,5,5,5,5,5" />
                    <text x="60" y="62" fill="#D946EF" fontSize="9" fontFamily="monospace">C-PROP-BNDY (Plot Boundary)</text>
                  </>
                )}

                {/* Road (C-ROAD-EDGE & C-ROAD-CL) */}
                {isLayerVisible('C-ROAD-EDGE') && (
                  <>
                    <line x1="50" y1="335" x2="710" y2="335" stroke="#FFFFFF" strokeWidth="2" />
                    <line x1="50" y1="347" x2="710" y2="347" stroke="#EF4444" strokeWidth="1" strokeDasharray="12,6" />
                    <text x="60" y="345" fill="#94A3B8" fontSize="8" fontFamily="monospace">C-ROAD-CL / EDGE</text>
                  </>
                )}
              </g>
            )}

            {/* 3. STRUCTURAL ELEMENTS (S-COLS, S-BEAMS, S-REBAR) */}
            {(isLayerVisible('S-COLS') || isLayerVisible('S-BEAM-PRIM') || isLayerVisible('S-BEAM-HDDN') || isLayerVisible('S-REBAR-MAIN')) && (
              <g id="structural-layer">
                {/* Primary Beams (Red / Continuous / 0.50mm) */}
                {isLayerVisible('S-BEAM-PRIM') && (
                  <>
                    {/* Top Beam */}
                    <rect x="120" y="75" width="520" height="10" fill="none" stroke="#EF4444" strokeWidth="2" />
                    {/* Bottom Beam */}
                    <rect x="120" y="275" width="520" height="10" fill="none" stroke="#EF4444" strokeWidth="2" />
                    {/* Mid Cross Beams */}
                    <rect x="120" y="75" width="10" height="210" fill="none" stroke="#EF4444" strokeWidth="2" />
                    <rect x="375" y="75" width="10" height="210" fill="none" stroke="#EF4444" strokeWidth="2" />
                    <rect x="630" y="75" width="10" height="210" fill="none" stroke="#EF4444" strokeWidth="2" />
                  </>
                )}

                {/* Concealed / Hidden Beams (S-BEAM-HDDN / Red / HIDDEN) */}
                {isLayerVisible('S-BEAM-HDDN') && (
                  <line x1="130" y1="180" x2="375" y2="180" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="6,4" />
                )}

                {/* Structural RC Columns (Magenta / 0.60mm heavy outline) */}
                {isLayerVisible('S-COLS') && (
                  <>
                    <rect x="110" y="70" width="20" height="20" fill="#2d1b33" stroke="#D946EF" strokeWidth="2.5" />
                    <rect x="370" y="70" width="20" height="20" fill="#2d1b33" stroke="#D946EF" strokeWidth="2.5" />
                    <rect x="630" y="70" width="20" height="20" fill="#2d1b33" stroke="#D946EF" strokeWidth="2.5" />
                    <rect x="110" y="270" width="20" height="20" fill="#2d1b33" stroke="#D946EF" strokeWidth="2.5" />
                    <rect x="370" y="270" width="20" height="20" fill="#2d1b33" stroke="#D946EF" strokeWidth="2.5" />
                    <rect x="630" y="270" width="20" height="20" fill="#2d1b33" stroke="#D946EF" strokeWidth="2.5" />
                  </>
                )}

                {/* Rebar in Columns/Beams (S-REBAR-MAIN - Red dots/lines) */}
                {isLayerVisible('S-REBAR-MAIN') && (
                  <g>
                    <circle cx="114" cy="74" r="1.5" fill="#EF4444" />
                    <circle cx="126" cy="74" r="1.5" fill="#EF4444" />
                    <circle cx="114" cy="86" r="1.5" fill="#EF4444" />
                    <circle cx="126" cy="86" r="1.5" fill="#EF4444" />
                    {/* Rebar longitudinal line in Beam */}
                    <line x1="140" y1="78" x2="360" y2="78" stroke="#EF4444" strokeWidth="1.5" />
                    <line x1="140" y1="82" x2="360" y2="82" stroke="#EF4444" strokeWidth="1.5" />
                    <text x="180" y="72" fill="#F8FAFC" fontSize="8" fontFamily="monospace">4-16mm Rebar (S-REBAR-MAIN)</text>
                  </g>
                )}
              </g>
            )}

            {/* 4. ARCHITECTURAL WALLS, DOORS & WINDOWS */}
            {(isLayerVisible('A-WALL-FULL') || isLayerVisible('A-WALL-PART') || isLayerVisible('A-DOOR') || isLayerVisible('A-WIND')) && (
              <g id="architectural-layer">
                {/* 10" Exterior Walls (A-WALL-FULL - Red / 0.50mm) */}
                {isLayerVisible('A-WALL-FULL') && (
                  <>
                    {/* Top Exterior Wall with Window Cutout */}
                    <rect x="130" y="74" width="70" height="12" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />
                    <rect x="290" y="74" width="80" height="12" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />
                    <rect x="390" y="74" width="70" height="12" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />
                    <rect x="550" y="74" width="80" height="12" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />

                    {/* Left Exterior Wall with Door opening */}
                    <rect x="114" y="90" width="12" height="70" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />
                    <rect x="114" y="210" width="12" height="60" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />

                    {/* Right Exterior Wall */}
                    <rect x="634" y="90" width="12" height="180" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />

                    {/* Bottom Exterior Wall */}
                    <rect x="130" y="274" width="240" height="12" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />
                    <rect x="390" y="274" width="240" height="12" fill="url(#hatchBrick)" stroke="#EF4444" strokeWidth="2" />
                  </>
                )}

                {/* 5" Interior Partition Wall (A-WALL-PART - Yellow / 0.25mm) */}
                {isLayerVisible('A-WALL-PART') && (
                  <>
                    <rect x="376" y="90" width="8" height="85" fill="#1f2415" stroke="#EAB308" strokeWidth="1.5" />
                    <rect x="376" y="215" width="8" height="55" fill="#1f2415" stroke="#EAB308" strokeWidth="1.5" />
                    <rect x="250" y="176" width="126" height="8" fill="#1f2415" stroke="#EAB308" strokeWidth="1.5" />
                  </>
                )}

                {/* Windows (A-WIND - Cyan / 0.25mm) */}
                {isLayerVisible('A-WIND') && (
                  <>
                    {/* Window 1 */}
                    <g>
                      <rect x="200" y="75" width="90" height="10" fill="#0c252d" stroke="#06B6D4" strokeWidth="1.5" />
                      <line x1="200" y1="80" x2="290" y2="80" stroke="#06B6D4" strokeWidth="1" />
                      <text x="235" y="70" fill="#06B6D4" fontSize="8" fontFamily="monospace">W1 (A-WIND)</text>
                    </g>
                    {/* Window 2 */}
                    <g>
                      <rect x="460" y="75" width="90" height="10" fill="#0c252d" stroke="#06B6D4" strokeWidth="1.5" />
                      <line x1="460" y1="80" x2="550" y2="80" stroke="#06B6D4" strokeWidth="1" />
                      <text x="495" y="70" fill="#06B6D4" fontSize="8" fontFamily="monospace">W2</text>
                    </g>
                  </>
                )}

                {/* Doors (A-DOOR - Green / 0.25mm with swing arc) */}
                {isLayerVisible('A-DOOR') && (
                  <>
                    {/* Main Entry Door D1 */}
                    <g>
                      <line x1="126" y1="160" x2="160" y2="160" stroke="#22C55E" strokeWidth="1.8" />
                      <line x1="126" y1="160" x2="126" y2="200" stroke="#22C55E" strokeWidth="1.8" />
                      <path d="M 160 160 A 34 34 0 0 1 126 194" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="3,2" />
                      <text x="140" y="150" fill="#22C55E" fontSize="8" fontFamily="monospace">D1 (A-DOOR)</text>
                    </g>
                    {/* Internal Room Door D2 */}
                    <g>
                      <line x1="384" y1="175" x2="384" y2="215" stroke="#22C55E" strokeWidth="1.8" />
                      <path d="M 384 215 A 35 35 0 0 0 349 180" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="3,2" />
                      <text x="390" y="195" fill="#22C55E" fontSize="8" fontFamily="monospace">D2</text>
                    </g>
                  </>
                )}

                {/* Furniture (A-FURN - Gray / 0.15mm) */}
                {isLayerVisible('A-FURN') && (
                  <g opacity="0.8">
                    {/* Bed */}
                    <rect x="520" y="160" width="100" height="90" fill="#131c26" stroke="#64748B" strokeWidth="1" rx="4" />
                    <rect x="530" y="165" width="35" height="20" fill="#1e293b" stroke="#64748B" strokeWidth="0.8" rx="2" />
                    <rect x="575" y="165" width="35" height="20" fill="#1e293b" stroke="#64748B" strokeWidth="0.8" rx="2" />
                    <text x="545" y="215" fill="#64748B" fontSize="9" fontFamily="monospace">MASTER BED</text>
                  </g>
                )}

                {/* Stairs (A-STRS - Orange 0.30mm) */}
                {isLayerVisible('A-STRS') && (
                  <g>
                    <rect x="140" y="95" width="80" height="60" fill="#1f1811" stroke="#F97316" strokeWidth="1.5" />
                    <line x1="150" y1="95" x2="150" y2="155" stroke="#F97316" strokeWidth="1" />
                    <line x1="160" y1="95" x2="160" y2="155" stroke="#F97316" strokeWidth="1" />
                    <line x1="170" y1="95" x2="170" y2="155" stroke="#F97316" strokeWidth="1" />
                    <line x1="180" y1="95" x2="180" y2="155" stroke="#F97316" strokeWidth="1" />
                    <line x1="190" y1="95" x2="190" y2="155" stroke="#F97316" strokeWidth="1" />
                    <line x1="200" y1="95" x2="200" y2="155" stroke="#F97316" strokeWidth="1" />
                    <text x="145" y="128" fill="#F97316" fontSize="8" fontFamily="monospace">UP ➔ (A-STRS)</text>
                  </g>
                )}
              </g>
            )}

            {/* 5. MEP ELEMENTS (ELECTRICAL, PLUMBING, HVAC) */}
            {(isLayerVisible('E-POWR-SOCK') || isLayerVisible('P-WATR-COLD') || isLayerVisible('M-DUCT-SPLY')) && (
              <g id="mep-layer">
                {/* Electrical: DB Panel, Outlets & Conduit Loops */}
                {isLayerVisible('E-POWR-SOCK') && (
                  <g>
                    {/* DB Panel */}
                    <rect x="135" y="165" width="16" height="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
                    <text x="135" y="185" fill="#EF4444" fontSize="7" fontFamily="monospace">MDB (E-PANL-DB)</text>

                    {/* Sockets */}
                    <circle cx="210" cy="270" r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
                    <circle cx="340" cy="270" r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
                    <circle cx="610" cy="270" r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />

                    {/* Conduit Loop (E-CIRC-CONDUIT - DASHED Cyan) */}
                    <path d="M 151 169 Q 180 220 210 270" fill="none" stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="4,3" />
                    <path d="M 210 270 Q 275 255 340 270" fill="none" stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="4,3" />
                    <text x="220" y="248" fill="#06B6D4" fontSize="7" fontFamily="monospace">CONDUIT LOOP (E-CIRC)</text>
                  </g>
                )}

                {/* Plumbing: Cold & Hot Water Lines */}
                {isLayerVisible('P-WATR-COLD') && (
                  <g>
                    {/* Cold Water Supply (P-WATR-COLD - Blue / 0.40mm) */}
                    <line x1="260" y1="184" x2="260" y2="250" stroke="#3B82F6" strokeWidth="2" />
                    <line x1="260" y1="250" x2="330" y2="250" stroke="#3B82F6" strokeWidth="2" />
                    <text x="265" y="220" fill="#3B82F6" fontSize="8" fontFamily="monospace">P-WATR-COLD (3/4")</text>

                    {/* Hot Water (P-WATR-HOT - Red DASHED) */}
                    <line x1="265" y1="184" x2="265" y2="245" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="6,3" />
                    <line x1="265" y1="245" x2="330" y2="245" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="6,3" />
                    <text x="268" y="235" fill="#EF4444" fontSize="7" fontFamily="monospace">HOT WATER</text>
                  </g>
                )}

                {/* HVAC: Supply Air Duct & Diffusers (M-DUCT-SPLY) */}
                {isLayerVisible('M-DUCT-SPLY') && (
                  <g>
                    {/* Supply Duct Trunk (Blue / 0.50mm) */}
                    <rect x="420" y="110" width="160" height="24" fill="#0c1e33" stroke="#3B82F6" strokeWidth="2" />
                    <line x1="420" y1="110" x2="580" y2="134" stroke="#3B82F6" strokeWidth="0.8" />
                    <line x1="420" y1="134" x2="580" y2="110" stroke="#3B82F6" strokeWidth="0.8" />
                    <text x="440" y="126" fill="#F8FAFC" fontSize="8" fontFamily="monospace">M-DUCT-SPLY (14"x10")</text>

                    {/* Diffusers (M-DIFF-GRIL) */}
                    <rect x="440" y="145" width="18" height="18" fill="#082b35" stroke="#06B6D4" strokeWidth="1.2" />
                    <line x1="440" y1="145" x2="458" y2="163" stroke="#06B6D4" strokeWidth="0.8" />
                    <line x1="440" y1="163" x2="458" y2="145" stroke="#06B6D4" strokeWidth="0.8" />

                    <rect x="540" y="145" width="18" height="18" fill="#082b35" stroke="#06B6D4" strokeWidth="1.2" />
                    <line x1="540" y1="145" x2="558" y2="163" stroke="#06B6D4" strokeWidth="0.8" />
                    <line x1="540" y1="163" x2="558" y2="145" stroke="#06B6D4" strokeWidth="0.8" />
                  </g>
                )}
              </g>
            )}

            {/* 6. ANNOTATION: TEXT & DIMENSIONS (A-TEXT / A-DIMS) */}
            {(isLayerVisible('A-TEXT') || isLayerVisible('A-DIMS')) && (
              <g id="annotation-layer">
                {/* Room Text Labels (A-TEXT - White 0.25mm) */}
                {isLayerVisible('A-TEXT') && (
                  <>
                    <text x="240" y="140" fill="#F8FAFC" fontSize="11" fontFamily="sans-serif" fontWeight="bold">LIVING & DINING</text>
                    <text x="240" y="153" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">AREA: 285 SFT</text>

                    <text x="470" y="240" fill="#F8FAFC" fontSize="11" fontFamily="sans-serif" fontWeight="bold">BEDROOM 01</text>
                    <text x="470" y="253" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">AREA: 180 SFT</text>
                  </>
                )}

                {/* Dimensions (A-DIMS - Yellow 0.18mm) */}
                {isLayerVisible('A-DIMS') && (
                  <>
                    {/* Dimension top */}
                    <line x1="120" y1="52" x2="380" y2="52" stroke="#EAB308" strokeWidth="1" />
                    <line x1="120" y1="46" x2="120" y2="58" stroke="#EAB308" strokeWidth="1" />
                    <line x1="380" y1="46" x2="380" y2="58" stroke="#EAB308" strokeWidth="1" />
                    <text x="235" y="48" fill="#EAB308" fontSize="9" fontFamily="monospace" textAnchor="middle">16'-0" [4875mm]</text>

                    <line x1="380" y1="52" x2="640" y2="52" stroke="#EAB308" strokeWidth="1" />
                    <line x1="640" y1="46" x2="640" y2="58" stroke="#EAB308" strokeWidth="1" />
                    <text x="495" y="48" fill="#EAB308" fontSize="9" fontFamily="monospace" textAnchor="middle">16'-0" [4875mm]</text>
                  </>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* CAD Command Line Console */}
        <div className="bg-slate-950 px-3 py-2 border-t border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">AutoCAD Command Line:</span>
          </div>
          <div className="mt-1 space-y-0.5 max-h-16 overflow-y-auto text-[11px]">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={idx === 0 ? 'text-amber-300 font-semibold' : 'text-slate-400'}
              >
                {idx === 0 ? 'Command: ' : ' '}
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Command Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">
            {lang === 'bn' ? 'কুইক কমান্ড রান করুন:' : 'Run CAD Commands:'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => executeCommand('LAY-ARCH')}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono border border-slate-700 cursor-pointer active:scale-95"
          >
            LAY-ARCH
          </button>
          <button
            type="button"
            onClick={() => executeCommand('LAY-STR')}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono border border-slate-700 cursor-pointer active:scale-95"
          >
            LAY-STR
          </button>
          <button
            type="button"
            onClick={() => executeCommand('LAY-MEP')}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono border border-slate-700 cursor-pointer active:scale-95"
          >
            LAY-MEP
          </button>
          <button
            type="button"
            onClick={() => executeCommand('LAY-CIVIL')}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono border border-slate-700 cursor-pointer active:scale-95"
          >
            LAY-CIVIL
          </button>
          <button
            type="button"
            onClick={() => executeCommand('LAY-ALL')}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono font-bold shadow-md cursor-pointer active:scale-95"
          >
            LAY-ALL (মাস্টার ৬০+)
          </button>
        </div>
      </div>

      {/* Layer Properties Manager Table Inspector */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-white text-xs sm:text-sm">
              {lang === 'bn'
                ? `লেয়ার প্রপার্টিজ টেবিল (${displayedLayers.length} টি লেয়ার ফিল্টার করা)`
                : `Layer Properties Manager (${displayedLayers.length} Layers Displayed)`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {lang === 'bn'
              ? 'আইকন ক্লিকে লেয়ার অন/অফ ও কারেন্ট লেয়ার সিলেক্ট করুন'
              : 'Click Eye icon to toggle visibility or click row to set Active'}
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <tr>
                <th className="py-2 px-3 w-10 text-center">Status</th>
                <th className="py-2 px-3">Layer Name</th>
                <th className="py-2 px-3">Color (ACI)</th>
                <th className="py-2 px-3">Linetype</th>
                <th className="py-2 px-3">Lineweight</th>
                <th className="py-2 px-3">Discipline Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {displayedLayers.map((layer) => {
                const visible = isLayerVisible(layer.name);
                const isActive = activeLayer === layer.name;

                return (
                  <tr
                    key={layer.name}
                    onClick={() => setActiveLayer(layer.name)}
                    className={`transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/40 hover:bg-amber-950/60'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Status & Visibility Button */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.name);
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                        title={visible ? 'Turn Layer OFF' : 'Turn Layer ON'}
                      >
                        {visible ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </button>
                    </td>

                    {/* Layer Name */}
                    <td className="py-2 px-3 font-semibold flex items-center gap-2">
                      <span className={isActive ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                        {layer.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          CURRENT
                        </span>
                      )}
                    </td>

                    {/* Color */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded shadow-sm border border-slate-700 inline-block"
                          style={{ backgroundColor: layer.hexColor }}
                        />
                        <span className="text-slate-300">{layer.colorName}</span>
                      </div>
                    </td>

                    {/* Linetype */}
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          layer.linetype === 'Continuous'
                            ? 'text-slate-400 bg-slate-800'
                            : 'text-amber-300 bg-amber-950/80 border border-amber-800/80'
                        }`}
                      >
                        {layer.linetype}
                      </span>
                    </td>

                    {/* Lineweight */}
                    <td className="py-2 px-3 text-slate-300">
                      {layer.lineweightMm.toFixed(2)} mm
                    </td>

                    {/* Description */}
                    <td className="py-2 px-3 text-slate-400 font-sans text-xs">
                      {lang === 'bn' ? layer.descBn : layer.descEn}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
