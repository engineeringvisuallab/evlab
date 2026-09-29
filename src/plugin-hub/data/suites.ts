import { PluginSuite } from '../types';

export const PLUGIN_SUITES: PluginSuite[] = [
  // 1. Architecture Suite
  {
    id: 'suite-architect',
    codeName: 'EVL-Architech',
    nameEn: 'EVL-Architect: 3D Architectural Building Envelope Suite',
    nameBn: 'EVL-Architect: পূর্ণাঙ্গ আর্কিটেকচারাল বিল্ডিং স্যুট',
    taglineEn: 'Grills, Windows, Doors, Gates, Railings & Boundary Walls in one comprehensive bundle',
    taglineBn: 'গ্রিল, জানালা, দরজা, গেট, রেলিং ও বাউন্ডারি ওয়াল — সম্পূর্ণ আর্কিটেকচার প্যাকেজ',
    icon: '🏛️',
    badgeEn: 'Core Architecture Bundle',
    badgeBn: 'আর্কিটেকচারাল বান্ডেল',
    accentColor: 'from-amber-600 to-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    bgGradient: 'from-slate-900 via-amber-950/40 to-slate-900',
    descriptionEn:
      'The essential architectural bundle containing 6 specialized generators: Window & Verandah Grills, Parametric Casement & Sliding Windows, Flush & Panel Doors, Main Driveway & Wicket Gates, Stair & Balcony Railings, and Perimeter Boundary Walls. Available for SketchUp, AutoCAD, Blender, and 3ds Max.',
    descriptionBn:
      'বিল্ডিং আর্কিটেকচারাল মডেলিংয়ের ৬টি অত্যাবশ্যকীয় প্লাগইন একসাথে: ১০টি স্টাইলের গ্রিল, উইন্ডো, ডোর, ড্রাইভওয়ে ও পথচারী গেট, স্টারকেস ও ব্যালকনি রেলিং এবং বাউন্ডারি ওয়াল। স্কেচআপ, অটোক্যাড, ব্লেন্ডার ও থ্রিডিএস ম্যাক্সের প্রস্তুত স্ক্রিপ্ট সহ এক ক্লিকে ডাউনলোডযোগ্য।',
    includedPluginIds: [
      'sketchup-evl-grill',
      'sketchup-evl-window',
      'sketchup-evl-door',
      'sketchup-evl-gate',
      'sketchup-evl-railing',
      'sketchup-evl-boundarywall',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Bundle', badge: 'SketchUp 2019-2026' },
      { name: 'Autodesk AutoCAD', format: '.lsp Scripts', badge: 'AutoCAD / Civil 3D' },
      { name: 'Blender 3D', format: '.py Addons', badge: 'Blender 3.x - 4.x' },
      { name: 'Autodesk 3ds Max', format: '.ms MaxScript', badge: '3ds Max' },
      { name: 'Universal CAD / BIM', format: '.dxf / .obj', badge: 'All CAD' },
    ],
    highlightsEn: [
      '60+ Architectural 3D parametric styles (10 per component category)',
      'Single-click Master Installer with combined unified toolbar menu',
      'Automatic realistic metal, timber, glass, concrete & paint materials',
      'Multi-software exports: SketchUp .rbz, AutoCAD .lsp, Blender .py, 3ds Max .ms',
    ],
    highlightsBn: [
      '৬০+ আর্কিটেকচারাল ৩ডি স্টাইল (প্রতি ক্যাটাগরিতে ১০টি করে প্রিমিয়াম ডিজাইন)',
      'এক ক্লিকে মাস্টার ইনস্টলার ও কম্বাইন্ড টুলবার লোডার',
      'অটো-মেটেরিয়াল ও রেন্ডারিং টেক্সচার ইঞ্জিন',
      'সব সফটওয়্যারের সাপোর্ট: SketchUp .rbz, AutoCAD .lsp, Blender .py, 3ds Max .ms',
    ],
    estimatedTotalSize: '84.6 KB (Compressed ZIP)',
    pluginCount: 6,
  },

  // 2. Transportation & Civil Infrastructure Suite
  {
    id: 'suite-transportation',
    codeName: 'EVL-Transportation',
    nameEn: 'EVL-Transportation: Rail & Civil Infrastructure Engineering Suite',
    nameBn: 'EVL-Transportation: রেল ও সিভিল ইনফ্রাস্ট্রাকচার ইঞ্জিনিয়ারিং স্যুট',
    taglineEn: 'Railway tracks, ballast beds, safety guardrails, earthwork cut-fill & rebar totalizers',
    taglineBn: 'রেলওয়ে ট্র্যাক, ব্যালাস্ট বেড, সেফটি গার্ডরেইল, আর্থওয়ার্ক কাট-ফিল ও রিবার টোটালাইজার',
    icon: '🚆',
    badgeEn: 'Civil & Transport Bundle',
    badgeBn: 'ট্রান্সপোর্টেশন ও সিভিল বান্ডেল',
    accentColor: 'from-sky-600 to-indigo-700',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    bgGradient: 'from-slate-900 via-sky-950/40 to-slate-900',
    descriptionEn:
      'Civil, Railway, and Highway engineering toolkit. Includes EVL-Rail (Broad, Dual, Standard Metro, and Meter gauge tracks with steel rails, sleepers, and ballast beds), EVL-TLEN (instant cumulative distance totalizer for roads and rebars), Industrial Safety Barriers, and Highway Security Fencing.',
    descriptionBn:
      'রেলওয়ে ও হাইওয়ে সিভিল ইঞ্জিনিয়ারদের সম্পূর্ণ টুলকিট। এতে রয়েছে EVL-Rail (ব্রড গেজ, ডুয়েল গেজ, মেট্রো ও মিটার গেজ রেললাইন জেনারেটর), EVL-TLEN (রাস্তা ও রিবারের দৈর্ঘ্য পরিমাপক), ইন্ডাস্ট্রিয়াল সেফটি গার্ডরেইল এবং হাইওয়ে পেরিমিটার ফেন্সিং।',
    includedPluginIds: [
      'sketchup-evl-rail',
      'autocad-evl-tlen',
      'sketchup-evl-railing',
      'sketchup-evl-boundarywall',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Bundle', badge: 'SketchUp 2019-2026' },
      { name: 'AutoCAD & Civil 3D', format: '.lsp Scripts', badge: 'Civil 3D & AutoCAD' },
      { name: 'Blender 3D', format: '.py Addons', badge: 'Blender 3.x - 4.x' },
      { name: 'Autodesk Revit', format: '.dyn Dynamo', badge: 'Revit BIM' },
      { name: 'Universal CAD', format: '.dxf / .obj', badge: 'Civil Infrastructure' },
    ],
    highlightsEn: [
      '4 Railway gauges: Broad (1676mm), Dual (3 rails), Metro (1435mm), Meter (1000mm)',
      'Ballast bed slope angle (1:1.5) and pre-stressed concrete sleepers with fastening clips',
      'Instant road centerline and rebar length totalizer for BOQ estimations',
      'High safety barrier guardrails and Right-of-Way perimeter fencing',
    ],
    highlightsBn: [
      '৪টি রেলওয়ে গেজ: ব্রড গেজ (১৬৭৬মিমি), ডুয়েল গেজ (৩-রেইল), মেট্রো ও মিটার গেজ',
      'স্লিপার, ব্যালাস্ট স্লোপ এবং প্যান্ড্রোল ক্লিপ সহ বাস্তবসম্মত ৩ডি জিওমেট্রি',
      'এক ক্লিকে রোড সেন্টারলাইন ও রিবার দৈর্ঘ্য নির্ণয় ও স্টিমেশন',
      'ইন্ডাস্ট্রিয়াল সেফটি গার্ডরেইল ও রাইট-অফ-ওয়ে সিকিউরিটি বাউন্ডারি ফেন্সিং',
    ],
    estimatedTotalSize: '62.4 KB (Compressed ZIP)',
    pluginCount: 4,
  },

  // 3. Organic Geometry & Vertex Editing Suite
  {
    id: 'suite-vertex',
    codeName: 'EVL-Vertex',
    nameEn: 'EVL-Vertex: 3D Mesh Vertex Manipulation & Organic Surface Suite',
    nameBn: 'EVL-Vertex: ৩ডি ম্যাশ ভার্টেক্স ও অর্গানিক সারফেস স্যুট',
    taglineEn: 'Interactive 3D vertex manipulator with coordinate gizmo, soft selection & organic curves',
    taglineBn: '৩ডি কোঅর্ডিনেট গিজমো, সফট সিলেকশন ফলঅফ এবং কার্ভড ক্যানোপি ও টেরেন এডিটর',
    icon: '🌐',
    badgeEn: 'Geometry & Organic Modeling',
    badgeBn: 'ভার্টেক্স ও অর্গানিক মডেলিং',
    accentColor: 'from-emerald-600 to-teal-700',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgGradient: 'from-slate-900 via-emerald-950/40 to-slate-900',
    descriptionEn:
      'Modeled after Vertex Tools 2: Powerful vertex-level manipulation for all 3D software (SketchUp, Blender, AutoCAD, 3ds Max, Rhino). Manipulate vertices with X/Y/Z transformation gizmo, soft selection falloff radius, heatmap visualization, organic tensile canopies, wavy roofs, and landscape terrain.',
    descriptionBn:
      'ভার্টেক্স টুলস ২-এর আদলে তৈরি: সব ৩ডি সফটওয়্যারে (SketchUp, Blender, AutoCAD, 3ds Max, Rhino) ম্যাশের পয়েন্ট ধরে অর্গানিক মডেলিংয়ের শক্তিশালী টুল। X/Y/Z ৩ডি ট্রান্সফর্মেশন গিজমো, সফট সিলেকশন ফলঅফ ব্যাসার্ধ, হিটম্যাপ কালার, কার্ভড ক্যানোপি ও পাহাড়ি ভূখণ্ড তৈরির সুবিধা।',
    includedPluginIds: [
      'sketchup-evl-vertex',
      'sketchup-evl-facemaker',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Extension', badge: 'SketchUp 2019-2026' },
      { name: 'Blender 3D', format: '.py BMesh Addon', badge: 'Blender 3.x - 4.x' },
      { name: 'Autodesk AutoCAD', format: '.lsp 3DMesh', badge: 'AutoCAD / Civil 3D' },
      { name: 'Autodesk 3ds Max', format: '.ms MaxScript', badge: '3ds Max Editable Poly' },
      { name: 'Rhino / Grasshopper', format: '.py RhinoCommon', badge: 'Rhino 7 / 8' },
      { name: 'Universal 3D Mesh', format: '.obj / .dxf', badge: 'Wavefront OBJ' },
    ],
    highlightsEn: [
      'Interactive 3D transformation gizmo (X, Y, Z axes + rotation arc handles)',
      'Smooth Gaussian, Cosine & Linear soft selection falloff radius with color heatmap',
      'Parametric presets: Tensile Wave Canopy, Sine Roof, Terrain Peak, Saddle & Shell',
      'Native scripts for SketchUp (.rbz), Blender (.py), AutoCAD (.lsp), 3ds Max (.ms), Rhino (.py)',
    ],
    highlightsBn: [
      'ইন্টারঅ্যাক্টিভ ৩ডি গিজমো ম্যানিপুলেটর (X, Y, Z অক্ষ এবং রোটেট হ্যান্ডেল)',
      'সফট সিলেকশন ফলঅফ রেডিয়াস ও লাইভ কালার হিটম্যাপ (লাল থেকে নীল)',
      'প্যারামেট্রিক প্রিসেটস: ওয়েভ ক্যানোপি, কার্ভড রুফ, ল্যান্ডস্কেপ টেরেন ও স্যাডেল শেল',
      'সব সফটওয়্যারের নেটিভ স্ক্রিপ্ট: SketchUp (.rbz), Blender (.py), AutoCAD (.lsp), 3ds Max (.ms), Rhino (.py)',
    ],
    estimatedTotalSize: '48.8 KB (Compressed ZIP)',
    pluginCount: 2,
  },

  // 4. Master All-in-One Suite
  {
    id: 'suite-master-all',
    codeName: 'EVL-Master-All',
    nameEn: 'EVL-Master: The Complete Multi-Software Engineering & Architecture Mega Suite',
    nameBn: 'EVL-Master: সম্পূর্ণ অল-ইন-ওয়ান মেগা স্যুট (সব প্লাগইন ও সফটওয়্যার)',
    taglineEn: 'All 15+ EVLab tools across Architecture, Civil, Transportation & Organic 3D Modeling',
    taglineBn: 'আর্কিটেকচার, সিভিল, ট্রান্সপোর্টেশন ও অর্গানিক ৩ডি মডেলিংয়ের ১৫+ প্লাগইন একসাথে',
    icon: '📦',
    badgeEn: 'All-in-One Mega Suite',
    badgeBn: 'অল-ইন-ওয়ান মেগা বান্ডেল',
    accentColor: 'from-purple-600 to-indigo-700',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    bgGradient: 'from-slate-900 via-purple-950/40 to-slate-900',
    descriptionEn:
      'The comprehensive master archive bundling all EVLab plugins for Trimble SketchUp (.rbz), Autodesk AutoCAD (.lsp), Blender (.py), Autodesk 3ds Max (.ms), Revit Dynamo (.dyn), and Rhino. Includes unified master loaders, installation guides, and documentation.',
    descriptionBn:
      'EVLab-এর সকল প্লাগইনের সম্পূর্ণ মাস্টার প্যাকেজ। এতে রয়েছে আর্কিটেকচারাল বিল্ডার্স, রেল ও সিভিল ইনফ্রাস্ট্রাকচার, ভার্টেক্স এডিটর এবং ড্রাফটিং অটোমেশন টুলস। স্কেচআপ, অটোক্যাড, ব্লেন্ডার, থ্রিডিএস ম্যাক্স এবং রিভিটের জন্য সুসংগঠিত ফোল্ডার ও মাস্টার লোডার সহ প্রস্তুত।',
    includedPluginIds: [
      'sketchup-evl-vertex',
      'sketchup-evl-grill',
      'sketchup-evl-window',
      'sketchup-evl-door',
      'sketchup-evl-gate',
      'sketchup-evl-railing',
      'sketchup-evl-rail',
      'sketchup-evl-boundarywall',
      'sketchup-evl-facemaker',
      'autocad-evl-tlen',
      'autocad-evl-rebar',
      'revit-evl-roomtagger',
      'civil3d-evl-cutfill',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Extensions', badge: 'All SketchUp' },
      { name: 'Autodesk AutoCAD', format: '.lsp AutoLISP', badge: 'All AutoCAD' },
      { name: 'Blender 3D', format: '.py Addons', badge: 'Blender 3x-4x' },
      { name: 'Autodesk 3ds Max', format: '.ms Scripts', badge: '3ds Max' },
      { name: 'Autodesk Revit', format: '.dyn Dynamo', badge: 'Revit BIM' },
      { name: 'Rhino / Grasshopper', format: '.py Python', badge: 'Rhino 7/8' },
    ],
    highlightsEn: [
      'Entire EVLab plugin ecosystem in a single organized ZIP package',
      'Folder structure: /SketchUp_RBZ/, /AutoCAD_LSP/, /Blender_Addons/, /3dsMax_Scripts/, /Revit_Dynamo/',
      'Master auto-loaders: evlab_master.rb, ACAD_LOAD_ALL.lsp, and complete PDF/TXT guide',
      'Lifetime offline access with zero dependencies',
    ],
    highlightsBn: [
      'একটিমাত্র সুবিন্যস্ত জিপে EVLab-এর সম্পূর্ণ প্লাগইন ইকোসিস্টেম',
      'সফ্টওয়্যার অনুযায়ী আলাদা ফোল্ডার: /SketchUp_RBZ/, /AutoCAD_LSP/, /Blender_Addons/, ইত্যাদি',
      'এক ক্লিকে সব টুল চালু করার মাস্টার অটো-লোডার স্ক্রিপ্ট',
      'কোনো ইন্টারনেটের প্রয়োজন নেই, ১০০% অফলাইন ও পারফেক্ট ক্যাড ইন্টিগ্রেশন',
    ],
    estimatedTotalSize: '168.5 KB (Compressed ZIP)',
    pluginCount: 13,
  },

  // 5. Civil 3D Infrastructure Hub Suite
  {
    id: 'suite-civil3d-hub',
    codeName: 'EVL-Civil-Infra',
    nameEn: 'EVL-Civil 3D: Highway Road, Storm Drain, Pipe Network & Culvert Suite',
    nameBn: 'EVL-Civil 3D: হাইওয়ে রোড, ড্রেন, আন্ডারগ্রাউন্ড পাইপ নেটওয়ার্ক ও কালভার্ট স্যুট',
    taglineEn: 'Civil 3D road corridors, U-drains with gratings, sewer manholes & box culverts',
    taglineBn: 'সিভিল ৩ডি রোড নেটওয়ার্ক, গ্র্যাভিটি ফল ড্রেন, সিউয়ারেজ ম্যানহোল ও আরসিসি কালভার্ট',
    icon: '🛣️',
    badgeEn: 'Civil 3D Infrastructure Suite',
    badgeBn: 'সিভিল ৩ডি ইনফ্রা বান্ডেল',
    accentColor: 'from-emerald-600 to-teal-800',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgGradient: 'from-slate-900 via-emerald-950/40 to-slate-900',
    descriptionEn:
      'The comprehensive Civil 3D infrastructure suite for SketchUp: Parametric road network with 2.5% drainage cross-slope camber, hydraulic concrete U/box drains, underground sewer networks with circular manholes, and RCC box culverts with flared wing walls.',
    descriptionBn:
      'স্কেচআপে সিভিল ৩ডি লেভেলের সাইট ও হাইওয়ে মডেলিংয়ের পূর্ণাঙ্গ স্যুট: ক্যাম্বার ও কার্ব সহ রাস্তা, গ্রেটিং কাভার সহ আরসিসি ড্রেন, ম্যানহোল সহ আন্ডারগ্রাউন্ড পাইপ নেটওয়ার্ক এবং উইং ওয়াল সহ বক্স কালভার্ট।',
    includedPluginIds: [
      'sketchup-evl-road',
      'sketchup-evl-drain',
      'sketchup-evl-pipenetwork',
      'sketchup-evl-culvert',
      'sketchup-evl-rail',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Bundle', badge: 'SketchUp 2019-2026' },
      { name: 'AutoCAD Civil 3D', format: '.lsp Scripts', badge: 'Civil 3D' },
      { name: 'Universal CAD / BIM', format: '.dxf / .ifc', badge: 'All CAD' },
    ],
    highlightsEn: [
      'True 2.5% drainage camber from centerline crown to kerb gutter',
      'Hydraulic RCC drains with cast iron gratings & precast slabs',
      'Sewer utility network with circular RCC manhole chambers & ductile covers',
      'Single/twin barrel box culverts with 45-degree splayed wing walls & aprons',
    ],
    highlightsBn: [
      'পানি নিষ্কাশনের জন্য ২.৫% ক্যাম্বার ও কার্বস্টোন সহ রাস্তা',
      'কাস্ট আয়রন গ্রেটিং ও স্ল্যাব কাভার সহ সলিড ড্রেন চ্যানেল',
      'ইনভার্ট লেভেল ও কোনিক্যাল রিডিউসার সহ সার্কুলার ম্যানহোল চেম্বার',
      '৪৫ ডিগ্রি উইং ওয়াল ও স্কর অ্যাপ্রন সহ সলিড আরসিসি বক্স কালভার্ট',
    ],
    estimatedTotalSize: '68.4 KB (Compressed ZIP)',
    pluginCount: 5,
  },

  // 6. Plant 3D & MEP Process Piping Suite
  {
    id: 'suite-plant3d-mep',
    codeName: 'EVL-Plant3D',
    nameEn: 'EVL-Plant 3D: Industrial Process Valves, Fittings & Piping Suite',
    nameBn: 'EVL-Plant 3D: ইন্ডাস্ট্রিয়াল প্রসেস ভালভ, এলবো, ফ্ল্যাঞ্জ ও পাইপিং স্যুট',
    taglineEn: 'AutoCAD Plant 3D style gate/ball/butterfly valves, 90° LR elbows, tees & schedule pipes',
    taglineBn: 'অটোক্যাড প্ল্যান্ট ৩ডি স্টাইল গেট/বল/বাটারফ্লাই ভালভ, লং রেডিয়াস এলবো, টি ও শিডিউল পাইপ',
    icon: '🏭',
    badgeEn: 'Plant 3D & MEP Suite',
    badgeBn: 'প্ল্যান্ট ৩ডি মেকানিক্যাল বান্ডেল',
    accentColor: 'from-rose-700 to-red-900',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    bgGradient: 'from-slate-900 via-rose-950/40 to-slate-900',
    descriptionEn:
      'Plant 3D piping and valves suite: OS&Y rising-stem gate valves with spoke handwheels, quarter-turn ball valves with red lever handles, resilient-seated butterfly valves, smooth 90° long radius (1.5D) elbows, equal tees, and uPVC/HDPE/Steel pipes with schedule wall thickness.',
    descriptionBn:
      'প্ল্যান্ট ও মেকানিক্যাল পাইপিংয়ের পূর্ণাঙ্গ স্যুট: হ্যান্ডহুইল সহ গেট ভালভ, লিভার সহ বল ভালভ, বাটারফ্লাই ভালভ, ১.৫ডি লং রেডিয়াস ৯০ ডিগ্রি এলবো, টি ফিটিংস এবং শিডিউল পাইপ মেকার।',
    includedPluginIds: [
      'sketchup-evl-plant3d',
      'sketchup-evl-pipe',
      'sketchup-boq-estimator',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Bundle', badge: 'SketchUp 2019-2026' },
      { name: 'AutoCAD Plant 3D', format: '.lsp Scripts', badge: 'Plant 3D' },
      { name: 'Revit MEP', format: '.dyn Dynamo', badge: 'Revit BIM' },
    ],
    highlightsEn: [
      'OS&Y rising stem Gate Valves with red handwheels, bonnet and flanges',
      'Quarter-turn Ball Valves and wafer Butterfly Valves',
      'Smooth 90° butt-weld long radius elbows (1.5D) and branched tees',
      'uPVC, HDPE SDR-11, Carbon Steel Sch 40 & Hume pipes with couplings',
    ],
    highlightsBn: [
      'হ্যান্ডহুইল ও স্পোক বনেটের নিখুঁত ওএসঅ্যান্ডওয়াই গেট ভালভ',
      'সেফটি লিভার সহ বল ভালভ ও বাটারফ্লাই ভালভ',
      '১.৫ডি লং রেডিয়াস স্মুথ ৯০ ডিগ্রি এলবো ও ব্র্যাঞ্চড টি',
      'ইউপিভিসি, এইচডিপিই এবং স্টিল পাইপলাইন কাপলিং সহ',
    ],
    estimatedTotalSize: '42.6 KB (Compressed ZIP)',
    pluginCount: 3,
  },

  // 7. Landscape & Plantation Suite
  {
    id: 'suite-landscape',
    codeName: 'EVL-Landscape',
    nameEn: 'EVL-Landscape: Avenue Trees, Royal Palms, Conifers & Greenery Suite',
    nameBn: 'EVL-Landscape: এভিনিউ গাছপালা, রয়েল পাম, কনিফার ও গ্রিনারি স্যুট',
    taglineEn: 'Royal palms, coconut palms, broad canopy shade trees, conifers & hedges with zero lag',
    taglineBn: 'রয়েল পাম, নারিকেল গাছ, ছায়াদার বৃক্ষ, কনিফার ও হেজ (ল্যাগহীন ২ডি ফেস-মি ও ৩ডি)',
    icon: '🌴',
    badgeEn: 'Landscape & Greenery Suite',
    badgeBn: 'ল্যান্ডস্কেপ বৃক্ষরোপণ বান্ডেল',
    accentColor: 'from-green-600 to-emerald-800',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    bgGradient: 'from-slate-900 via-green-950/40 to-slate-900',
    descriptionEn:
      'Ultra-lightweight landscaping and plantation suite: Place thousands of Royal Palms, coconut trees, broad canopy shade trees, columnar conifers, and manicured hedges along roads or sites with camera-tracking 2D Face-Me and clean 3D.',
    descriptionBn:
      'স্কেচআপের জন্য হালকা ও নিখুঁত ল্যান্ডস্কেপ ইঞ্জিন: রোডের পাশে বা সাইটে কোনো ল্যাগ ছাড়া হাজার হাজার রয়েল পাম, নারিকেল গাছ, ছায়াদার বৃক্ষ, কনিফার পাইন ও বক্সউড হেজ এক ক্লিকে রোপণ করুন।',
    includedPluginIds: [
      'sketchup-evl-plantation',
      'sketchup-boq-estimator',
    ],
    supportedSoftwares: [
      { name: 'Trimble SketchUp', format: '.rbz Bundle', badge: 'SketchUp 2019-2026' },
      { name: 'Blender 3D', format: '.py Addons', badge: 'Blender 3.x - 4.x' },
    ],
    highlightsEn: [
      'Zero viewport lag: smart 2D Face-Me mode follows active camera',
      'Path Array mode: line entire avenues or medians at custom intervals (6m/8m)',
      'Natural tree bark and lush tropical foliage materials',
      'Architectural low-poly 3D mode for clean shadow casting',
    ],
    highlightsBn: [
      'ফাইলে কোনো ল্যাগ হয় না: স্মার্ট ২ডি ফেস-মি ও হালকা ৩ডি মোড',
      'পাথ অ্যারে: রাস্তার দুপাশে নির্দিষ্ট ব্যবধানে এক ক্লিকে সারি সারি গাছ',
      'বাস্তবসম্মত কাঠের গুঁড়ি ও প্রাণবন্ত ট্রপিক্যাল পাতার টেক্সচার',
      'আর্কিটেকচারাল রেন্ডারিং ও মাস্টারপ্ল্যানের জন্য অপরিহার্য',
    ],
    estimatedTotalSize: '28.2 KB (Compressed ZIP)',
    pluginCount: 2,
  },
];
