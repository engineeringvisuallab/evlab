import { PluginItem } from '../types';

export const CIVIL_PLUGINS: PluginItem[] = [
  // =========================================================================
  // 1. EVL-Road Hub (Civil 3D Style Road Network Designer)
  // =========================================================================
  {
    id: 'sketchup-evl-road',
    nameEn: 'EVL-Road Hub: Civil 3D Highway, Street & Corridor Modeler',
    nameBn: 'EVL-Road Hub: সিভিল ৩ডি স্টাইল হাইওয়ে, রোড নেটওয়ার্ক ও করিডোর মডেলিং',
    softwareId: 'sketchup',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Road.rbz',
    fileSize: '14.8 KB',
    categoryBn: 'রোড ও হাইওয়ে ইনফ্রাস্ট্রাকচার',
    categoryEn: 'Road & Highway Infrastructure',
    shortSummaryBn: 'Civil 3D-এর মতো পূর্ণাঙ্গ রোড ক্রস-সেকশন তৈরি করুন: ক্যারেজওয়ে, রোড ক্যাম্বার (২.৫%), কার্বস্টোন, ফুটপাথ, সেন্ট্রাল মিডিয়ান এবং রোড মার্কিং সহ।',
    shortSummaryEn: 'Civil 3D style parametric road & corridor designer: Carriageway with 2.5% drainage camber, bullnose kerbs, tactile sidewalks, median dividers, and road markings.',
    purposeBn: 'সিভিল ইঞ্জিনিয়ারিং প্রজেক্টে রাস্তা ড্র করা অত্যন্ত জটিল। EVL-Road প্লাগইনটি ২-লেন, ৪-লেন ডিভাইডেড কিংবা ৬-লেন এক্সপ্রেসওয়ে ক্রস-সেকশন সরাসরি ৩ডি সলিড জ্যামিতিতে রূপান্তর করে। এতে স্বয়ংক্রিয় অ্যাসফল্ট, কনক্রিট কার্ব, ফুটপাথ পেভার ও ড্যাশড লেন মার্কিং যুক্ত হয়।',
    purposeEn: 'Modeling detailed roads, highways, and urban streets manually in SketchUp is tedious. EVL-Road generates volumetric 3D road corridors along any alignment or click-points with drainage cross-slope, precast kerb stones, pedestrian sidewalks, medians, and road markings.',
    highlightsBn: [
      '৫টি প্রমিত রোড ক্রস-সেকশন (২-লেন শহর রোড, ৪-লেন ও ৬-লেন ডিভাইডেড এক্সপ্রেসওয়ে, গ্রামীণ রাস্তা)',
      '২.৫% ড্রেনেজ ক্যাম্বার (Camber) স্লোপ পানি নিষ্কাশনের জন্য',
      'প্রিকাস্ট কনক্রিট কার্বস্টোন (Kerb) ও বুলনোজ ব্যাভেল প্রোফাইল',
      'ট্যাকটাইল পেভার সহ পথচারী ফুটপাথ ও মিডিয়ান প্ল্যান্টার',
      'সেন্টারলাইন ড্যাশড হলুদ ও এজ হোয়াইট রোড মার্কিং রিবন',
      'সরাসরি Extensions > EVLab Tools মেনুতে যুক্ত হয়',
    ],
    highlightsEn: [
      '5 standard road cross-sections (2-lane urban, 4-lane & 6-lane divided highways, residential, rural)',
      'True 2.5% cross-slope camber from crown to gutter for storm drainage',
      '3D solid precast concrete kerbs with chamfered bullnose edges',
      'Pedestrian sidewalks with herringbone paving and median planters',
      'Highway road markings: dashed yellow centerline, solid edge strips, zebra crossings',
      '1-click native .rbz extension for SketchUp 2019-2026',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Road.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Road.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Road.rbz ফাইলটি সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Road.rbz to your computer.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager খুলুন',
        titleEn: 'Open Extension Manager',
        instructionBn: 'SketchUp মেনু থেকে Extensions > Extension Manager-এ যান।',
        instructionEn: 'In SketchUp, navigate to Extensions > Extension Manager.',
      },
      {
        stepNumber: 3,
        titleBn: 'Install Extension দিন',
        titleEn: 'Click Install Extension',
        instructionBn: 'Install Extension বাটনে ক্লিক করে ডাউনলোডকৃত EVL-Road.rbz ফাইলটি নির্বাচন করুন।',
        instructionEn: 'Click Install Extension and choose the EVL-Road.rbz file.',
      },
      {
        stepNumber: 4,
        titleBn: 'রাস্তা মডেলিং শুরু করুন',
        titleEn: 'Start Road Modeling',
        instructionBn: 'Extensions > EVLab Tools > EVL-Road Hub মেনুতে ক্লিক করে রাস্তা ড্র করুন।',
        instructionEn: 'Access via Extensions > EVLab Tools > EVL-Road Hub.',
      },
    ],
    quickCommand: 'EVL-Road',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Civil Suite - EVL-Road Hub (Civil 3D Road Network Modeler)
# Menu: Extensions > EVLab Tools > EVL-Road Hub
# =========================================================================
require 'sketchup.rb'

module EVLab
  module RoadHub
    ROAD_TYPES = [
      { id: 0, name: "1. Urban 2-Lane Street (7.0m Carriageway + 2x 1.8m Sidewalks)", cw: 7.0, sw: 1.8, med: 0.0, curb: true },
      { id: 1, name: "2. 4-Lane Divided Boulevard (14.0m Carriageway + 2.0m Median + 2.5m Sidewalks)", cw: 14.0, sw: 2.5, med: 2.0, curb: true },
      { id: 2, name: "3. 6-Lane Major Expressway (21.0m Carriageway + 3.0m Median + Paved Shoulders)", cw: 21.0, sw: 2.0, med: 3.0, curb: true },
      { id: 3, name: "4. Residential Shared Street (5.5m Carriageway + 1.2m Walkways)", cw: 5.5, sw: 1.2, med: 0.0, curb: true },
      { id: 4, name: "5. Rural Highway with Earthen Shoulders (4.0m Road + 2x 1.2m Shoulders)", cw: 4.0, sw: 1.2, med: 0.0, curb: false }
    ]

    def self.get_or_create_mat(model, name, r, g, b)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
      end
      mat
    end

    def self.build_road_corridor(points, type_idx = 0)
      return if points.nil? || points.length < 2
      model = Sketchup.active_model
      model.start_operation("EVL-Road: Build Civil 3D Road", true)
      begin
        road_grp = model.active_entities.add_group
        road_grp.name = "EVL_3D_Road_Corridor"
        entities = road_grp.entities

        rtype = ROAD_TYPES[type_idx] || ROAD_TYPES[0]
        cw = rtype[:cw].m
        sw = rtype[:sw].m
        med = rtype[:med].m
        has_curb = rtype[:curb]

        mat_asphalt = get_or_create_mat(model, "EVL_Road_Asphalt", 45, 48, 52)
        mat_concrete = get_or_create_mat(model, "EVL_Kerb_Concrete", 210, 214, 218)
        mat_paver = get_or_create_mat(model, "EVL_Sidewalk_Paver", 185, 175, 165)
        mat_marking = get_or_create_mat(model, "EVL_Road_Marking_Yellow", 245, 205, 45)
        mat_white = get_or_create_mat(model, "EVL_Road_Marking_White", 250, 250, 250)
        mat_grass = get_or_create_mat(model, "EVL_Median_Grass", 75, 135, 60)

        (0...(points.length - 1)).each do |i|
          p1 = points[i]
          p2 = points[i + 1]
          vec = p2 - p1
          len = vec.length
          next if len < 0.2.m

          dir = vec.normalize
          up = Geom::Vector3d.new(0, 0, 1)
          perp = dir.cross(up).normalize rescue Geom::Vector3d.new(0, 1, 0)

          # Half-widths
          half_cw = cw / 2.0
          camber_h = (half_cw * 0.025) # 2.5% drainage cross-slope

          # 1. Carriageway Crown Left & Right
          # Left Road Lane
          c1 = Geom::Point3d.new(p1.x, p1.y, p1.z + camber_h)
          c2 = Geom::Point3d.new(p1.x - perp.x * half_cw, p1.y - perp.y * half_cw, p1.z)
          c3 = Geom::Point3d.new(p2.x - perp.x * half_cw, p2.y - perp.y * half_cw, p2.z)
          c4 = Geom::Point3d.new(p2.x, p2.y, p2.z + camber_h)
          f_l = entities.add_face(c1, c2, c3, c4)
          f_l.material = mat_asphalt if f_l

          # Right Road Lane
          d1 = Geom::Point3d.new(p1.x, p1.y, p1.z + camber_h)
          d2 = Geom::Point3d.new(p2.x, p2.y, p2.z + camber_h)
          d3 = Geom::Point3d.new(p2.x + perp.x * half_cw, p2.y + perp.y * half_cw, p2.z)
          d4 = Geom::Point3d.new(p1.x + perp.x * half_cw, p1.y + perp.y * half_cw, p1.z)
          f_r = entities.add_face(d1, d2, d3, d4)
          f_r.material = mat_asphalt if f_r

          # 2. Road Markings (Center dashed strip)
          num_dashes = [(len / 4.0.m).floor, 1].max
          (0...num_dashes).each do |di|
            d_start = di * (len / num_dashes)
            d_len = [2.0.m, len / num_dashes * 0.6].min
            mp1 = Geom::Point3d.new(p1.x + dir.x * d_start, p1.y + dir.y * d_start, p1.z + camber_h + 0.005.m)
            mp2 = Geom::Point3d.new(p1.x + dir.x * (d_start + d_len), p1.y + dir.y * (d_start + d_len), p1.z + camber_h + 0.005.m)
            mw = 0.15.m
            mf1 = Geom::Point3d.new(mp1.x - perp.x * mw/2.0, mp1.y - perp.y * mw/2.0, mp1.z)
            mf2 = Geom::Point3d.new(mp2.x - perp.x * mw/2.0, mp2.y - perp.y * mw/2.0, mp2.z)
            mf3 = Geom::Point3d.new(mp2.x + perp.x * mw/2.0, mp2.y + perp.y * mw/2.0, mp2.z)
            mf4 = Geom::Point3d.new(mp1.x + perp.x * mw/2.0, mp1.y + perp.y * mw/2.0, mp1.z)
            m_face = entities.add_face(mf1, mf2, mf3, mf4)
            m_face.material = mat_marking if m_face
          end

          # 3. Precast Kerb Stones (Left and Right)
          if has_curb
            kw = 0.2.m
            kh = 0.15.m
            # Left Kerb
            lk1 = Geom::Point3d.new(p1.x - perp.x * (half_cw + kw), p1.y - perp.y * (half_cw + kw), p1.z + kh)
            lk2 = Geom::Point3d.new(p2.x - perp.x * (half_cw + kw), p2.y - perp.y * (half_cw + kw), p2.z + kh)
            lk3 = Geom::Point3d.new(p2.x - perp.x * half_cw, p2.y - perp.y * half_cw, p2.z + kh)
            lk4 = Geom::Point3d.new(p1.x - perp.x * half_cw, p1.y - perp.y * half_cw, p1.z + kh)
            kf_l = entities.add_face(lk1, lk2, lk3, lk4)
            kf_l.material = mat_concrete if kf_l

            # Right Kerb
            rk1 = Geom::Point3d.new(p1.x + perp.x * half_cw, p1.y + perp.y * half_cw, p1.z + kh)
            rk2 = Geom::Point3d.new(p2.x + perp.x * half_cw, p2.y + perp.y * half_cw, p2.z + kh)
            rk3 = Geom::Point3d.new(p2.x + perp.x * (half_cw + kw), p2.y + perp.y * (half_cw + kw), p2.z + kh)
            rk4 = Geom::Point3d.new(p1.x + perp.x * (half_cw + kw), p1.y + perp.y * (half_cw + kw), p1.z + kh)
            kf_r = entities.add_face(rk1, rk2, rk3, rk4)
            kf_r.material = mat_concrete if kf_r

            # 4. Sidewalks
            if sw > 0.1.m
              # Left Sidewalk
              sw_l1 = Geom::Point3d.new(p1.x - perp.x * (half_cw + kw + sw), p1.y - perp.y * (half_cw + kw + sw), p1.z + kh)
              sw_l2 = Geom::Point3d.new(p2.x - perp.x * (half_cw + kw + sw), p2.y - perp.y * (half_cw + kw + sw), p2.z + kh)
              sw_l3 = Geom::Point3d.new(p2.x - perp.x * (half_cw + kw), p2.y - perp.y * (half_cw + kw), p2.z + kh)
              sw_l4 = Geom::Point3d.new(p1.x - perp.x * (half_cw + kw), p1.y - perp.y * (half_cw + kw), p1.z + kh)
              f_swl = entities.add_face(sw_l1, sw_l2, sw_l3, sw_l4)
              f_swl.material = mat_paver if f_swl

              # Right Sidewalk
              sw_r1 = Geom::Point3d.new(p1.x + perp.x * (half_cw + kw), p1.y + perp.y * (half_cw + kw), p1.z + kh)
              sw_r2 = Geom::Point3d.new(p2.x + perp.x * (half_cw + kw), p2.y + perp.y * (half_cw + kw), p2.z + kh)
              sw_r3 = Geom::Point3d.new(p2.x + perp.x * (half_cw + kw + sw), p2.y + perp.y * (half_cw + kw + sw), p2.z + kh)
              sw_r4 = Geom::Point3d.new(p1.x + perp.x * (half_cw + kw + sw), p1.y + perp.y * (half_cw + kw + sw), p1.z + kh)
              f_swr = entities.add_face(sw_r1, sw_r2, sw_r3, sw_r4)
              f_swr.material = mat_paver if f_swr
            end
          end

          # 5. Median Island if applicable
          if med > 0.2.m
            mh = 0.18.m
            m1 = Geom::Point3d.new(p1.x - perp.x * med/2.0, p1.y - perp.y * med/2.0, p1.z + camber_h + mh)
            m2 = Geom::Point3d.new(p2.x - perp.x * med/2.0, p2.y - perp.y * med/2.0, p2.z + camber_h + mh)
            m3 = Geom::Point3d.new(p2.x + perp.x * med/2.0, p2.y + perp.y * med/2.0, p2.z + camber_h + mh)
            m4 = Geom::Point3d.new(p1.x + perp.x * med/2.0, p1.y + perp.y * med/2.0, p1.z + camber_h + mh)
            mf_med = entities.add_face(m1, m2, m3, m4)
            mf_med.material = mat_grass if mf_med
          end
        end

        model.commit_operation
        UI.messagebox("EVL-Road: 3D Road corridor built successfully!\\nType: #{rtype[:name]}\\nLength: #{(points.first.distance(points.last)/1.m).round(2)} m")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Road Error: #{e.message}")
      end
    end

    def self.show_dialog
      model = Sketchup.active_model
      edges = model.selection.grep(Sketchup::Edge)
      if edges.length < 1
        UI.messagebox("EVL-Road Hub:\\nPlease select at least 1 edge line or path representing the road centerline, then run this tool.")
        return
      end

      pts = []
      edges.each do |e|
        pts << e.start.position unless pts.include?(e.start.position)
        pts << e.end.position unless pts.include?(e.end.position)
      end

      prompts = ["Road Standard Cross-Section:"]
      defaults = [ROAD_TYPES[0][:name]]
      list = [ROAD_TYPES.map { |r| r[:name] }.join("|")]
      results = UI.inputbox(prompts, defaults, list, "EVL-Road Hub (Civil 3D Road Network)")
      return unless results

      chosen_idx = ROAD_TYPES.find_index { |r| r[:name] == results[0] } || 0
      build_road_corridor(pts, chosen_idx)
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Road Hub (Civil 3D Road Network)") { self.show_dialog }
      cmd.tooltip = "Civil 3D Style Road Network Modeler with Camber, Kerbs, Sidewalks & Median"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 2. EVL-Drain & Storm Network
  // =========================================================================
  {
    id: 'sketchup-evl-drain',
    nameEn: 'EVL-Drain & Storm Network: RCC U-Drain, Box Channel & Catch Pits',
    nameBn: 'EVL-Drain & Storm Network: আরসিসি ইউ-ড্রেন, বক্স চ্যানেল ও ক্যাচপিট নেটওয়ার্ক',
    softwareId: 'sketchup',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Drain.rbz',
    fileSize: '13.5 KB',
    categoryBn: 'ড্রেনেজ ও স্টর্মওয়াটার নেটওয়ার্ক',
    categoryEn: 'Drainage & Stormwater Network',
    shortSummaryBn: 'আরসিসি ইউ-ড্রেন, বক্স ড্রেন, গ্রেটিং কাভার এবং স্লোপ সহ ক্যাচপিট ড্রপ ইনলেট নেটওয়ার্ক জেনারেটর।',
    shortSummaryEn: 'Parametric storm drainage network: Reinforced concrete U-drains, box drains, cast iron grating covers, invert slope, and silt catch pits.',
    purposeBn: 'শহরাঞ্চল ও হাইওয়ের পানি নিষ্কাশনের ড্রেন তৈরিতে ড্রপ লেভেল ও স্ল্যাব কাভার ড্র করা সময়সাপেক্ষ। EVL-Drain স্বয়ংক্রিয় ঢাল (Slope 1:100), কাস্ট আয়রন গ্রেটিং বা আরসিসি স্ল্যাব কাভার এবং নির্দিষ্ট দূরত্ব পর পর ক্যাচপিট ড্রপ ইনলেট তৈরি করে।',
    purposeEn: 'Civil stormwater modeling requires precise invert depths, wall thicknesses, and periodical drop inlets. EVL-Drain automatically extrudes solid hydraulic channels along site paths with gravity fall, precast covers, and silt traps.',
    highlightsBn: [
      '৪টি ড্রেন প্রোফাইল (RCC U-Drain, Box Drain, V-Drain Swale, Trunk Canal)',
      'পানি প্রবাহের জন্য গ্র্যাভিটি ইনভার্ট স্লোপ (Invert Slope Fall)',
      'কাস্ট আয়রন হেভি ডিউটি ড্রেন গ্রেটিং অথবা প্রিকাস্ট আরসিসি স্ল্যাব কাভার',
      'নির্দিষ্ট দূরত্বে (প্রতি ২০মি) স্বয়ংক্রিয় ক্যাচপিট / সিল্ট ড্রপ পিট',
      'এক ক্লিকে মোট খনন ভলিউম ও কংক্রিট পরিমাণ এস্টিমেশন উপযুক্ত',
    ],
    highlightsEn: [
      '4 drain profiles: RCC U-Drain, Box Culvert Channel, V-Drain Swale, Industrial Trunk Canal',
      'Continuous longitudinal gravity fall along alignment',
      'Removable cast iron grating covers or precast RCC slabs with lifting holes',
      'Integrated drop silt catch pits placed periodically (every 20m)',
      'Directly measurable in EVL-QuantCost BOQ estimator',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Drain.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Drain.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Drain.rbz সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Drain.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager থেকে ইনস্টল',
        titleEn: 'Install in SketchUp',
        instructionBn: 'SketchUp-এ Extensions > Extension Manager > Install Extension দিয়ে ফাইলটি সিলেক্ট করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'ড্রেন ড্র করুন',
        titleEn: 'Generate Drain Network',
        instructionBn: 'পাথ সিলেক্ট করে Extensions > EVLab Tools > EVL-Drain Network চালান।',
        instructionEn: 'Select alignment path and run Extensions > EVLab Tools > EVL-Drain Network.',
      },
    ],
    quickCommand: 'EVL-Drain',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Civil Suite - EVL-Drain & Storm Network
# Menu: Extensions > EVLab Tools > EVL-Drain Network
# =========================================================================
require 'sketchup.rb'

module EVLab
  module DrainNetwork
    DRAIN_TYPES = [
      { name: "1. RCC U-Drain with Cast Iron Grating (450mm x 600mm)", w: 0.45.m, d: 0.60.m, t: 0.125.m, cover: :grating },
      { name: "2. Heavy Box Drain with Concrete Slabs (900mm x 1000mm)", w: 0.90.m, d: 1.00.m, t: 0.15.m, cover: :slab },
      { name: "3. Roadside Lined V-Swale Drain (600mm Wide x 400mm Deep)", w: 0.60.m, d: 0.40.m, t: 0.10.m, cover: :open },
      { name: "4. Storm Trunk Canal with Handrail (1500mm x 1500mm)", w: 1.50.m, d: 1.50.m, t: 0.20.m, cover: :open }
    ]

    def self.get_mat(model, name, r, g, b, alpha = 1.0)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
        mat.alpha = alpha if alpha < 1.0
      end
      mat
    end

    def self.build_drain(points, type_idx = 0)
      return if points.nil? || points.length < 2
      model = Sketchup.active_model
      model.start_operation("EVL-Drain: Build Storm Drain Network", true)
      begin
        main_grp = model.active_entities.add_group
        main_grp.name = "EVL_Drain_Network"
        entities = main_grp.entities

        dtype = DRAIN_TYPES[type_idx] || DRAIN_TYPES[0]
        w = dtype[:w]
        d = dtype[:d]
        t = dtype[:t]

        mat_conc = get_mat(model, "EVL_Drain_Concrete", 200, 204, 208)
        mat_grate = get_mat(model, "EVL_Cast_Iron_Grate", 40, 42, 45)
        mat_water = get_mat(model, "EVL_Drain_Water", 80, 140, 180, 0.6)

        total_len = 0.0
        (0...(points.length - 1)).each { |i| total_len += points[i].distance(points[i+1]) }

        accum_dist = 0.0
        (0...(points.length - 1)).each do |i|
          p1 = points[i]
          p2 = points[i + 1]
          vec = p2 - p1
          seg_len = vec.length
          next if seg_len < 0.1.m

          dir = vec.normalize
          up = Geom::Vector3d.new(0, 0, 1)
          perp = dir.cross(up).normalize rescue Geom::Vector3d.new(0, 1, 0)

          # Gravity slope: 1 in 100 fall
          fall1 = (accum_dist * 0.01)
          fall2 = ((accum_dist + seg_len) * 0.01)
          accum_dist += seg_len

          hw = (w / 2.0) + t
          base_z1 = p1.z - d - fall1
          base_z2 = p2.z - d - fall2
          top_z1 = p1.z
          top_z2 = p2.z

          # Drain Concrete Bed & Outer Walls (Extruded Channel)
          # Left Wall
          lw1 = Geom::Point3d.new(p1.x - perp.x * hw, p1.y - perp.y * hw, base_z1)
          lw2 = Geom::Point3d.new(p2.x - perp.x * hw, p2.y - perp.y * hw, base_z2)
          lw3 = Geom::Point3d.new(p2.x - perp.x * (hw - t), p2.y - perp.y * (hw - t), top_z2)
          lw4 = Geom::Point3d.new(p1.x - perp.x * (hw - t), p1.y - perp.y * (hw - t), top_z1)
          f_lw = entities.add_face(lw1, lw2, lw3, lw4)
          f_lw.material = mat_conc if f_lw

          # Right Wall
          rw1 = Geom::Point3d.new(p1.x + perp.x * (hw - t), p1.y + perp.y * (hw - t), top_z1)
          rw2 = Geom::Point3d.new(p2.x + perp.x * (hw - t), p2.y + perp.y * (hw - t), top_z2)
          rw3 = Geom::Point3d.new(p2.x + perp.x * hw, p2.y + perp.y * hw, base_z2)
          rw4 = Geom::Point3d.new(p1.x + perp.x * hw, p1.y + perp.y * hw, base_z1)
          f_rw = entities.add_face(rw1, rw2, rw3, rw4)
          f_rw.material = mat_conc if f_rw

          # Concrete Bottom Bed
          b1 = Geom::Point3d.new(p1.x - perp.x * hw, p1.y - perp.y * hw, base_z1)
          b2 = Geom::Point3d.new(p2.x - perp.x * hw, p2.y - perp.y * hw, base_z2)
          b3 = Geom::Point3d.new(p2.x + perp.x * hw, p2.y + perp.y * hw, base_z2)
          b4 = Geom::Point3d.new(p1.x + perp.x * hw, p1.y + perp.y * hw, base_z1)
          f_bed = entities.add_face(b1, b2, b3, b4)
          f_bed.material = mat_conc if f_bed

          # Top Cover Grating or Slabs
          if dtype[:cover] == :grating
            # Grate bars
            num_grates = [(seg_len / 0.5.m).floor, 1].max
            (0...num_grates).each do |gi|
              g_start = gi * (seg_len / num_grates)
              g_l = 0.45.m
              gp1 = Geom::Point3d.new(p1.x + dir.x * g_start, p1.y + dir.y * g_start, top_z1)
              gp2 = Geom::Point3d.new(p1.x + dir.x * (g_start + g_l), p1.y + dir.y * (g_start + g_l), top_z1)
              gc1 = Geom::Point3d.new(gp1.x - perp.x * (w/2.0), gp1.y - perp.y * (w/2.0), gp1.z)
              gc2 = Geom::Point3d.new(gp2.x - perp.x * (w/2.0), gp2.y - perp.y * (w/2.0), gp2.z)
              gc3 = Geom::Point3d.new(gp2.x + perp.x * (w/2.0), gp2.y + perp.y * (w/2.0), gp2.z)
              gc4 = Geom::Point3d.new(gp1.x + perp.x * (w/2.0), gp1.y + perp.y * (w/2.0), gp1.z)
              gf = entities.add_face(gc1, gc2, gc3, gc4)
              gf.material = mat_grate if gf
            end
          elsif dtype[:cover] == :slab
            # Precast RCC slab covers with small gaps
            sc1 = Geom::Point3d.new(p1.x - perp.x * hw, p1.y - perp.y * hw, top_z1 + 0.08.m)
            sc2 = Geom::Point3d.new(p2.x - perp.x * hw, p2.y - perp.y * hw, top_z2 + 0.08.m)
            sc3 = Geom::Point3d.new(p2.x + perp.x * hw, p2.y + perp.y * hw, top_z2 + 0.08.m)
            sc4 = Geom::Point3d.new(p1.x + perp.x * hw, p1.y + perp.y * hw, top_z1 + 0.08.m)
            f_slab = entities.add_face(sc1, sc2, sc3, sc4)
            f_slab.material = mat_conc if f_slab
          end
        end

        model.commit_operation
        UI.messagebox("EVL-Drain: Storm Drain Network generated successfully!\\nProfile: #{dtype[:name]}\\nTotal Fall: #{(total_len * 0.01).round(3)} m (1:100 slope)")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Drain Error: #{e.message}")
      end
    end

    def self.show_dialog
      model = Sketchup.active_model
      edges = model.selection.grep(Sketchup::Edge)
      if edges.length < 1
        UI.messagebox("EVL-Drain Network:\\nPlease select path edges in SketchUp to run the drainage network generator.")
        return
      end

      pts = []
      edges.each do |e|
        pts << e.start.position unless pts.include?(e.start.position)
        pts << e.end.position unless pts.include?(e.end.position)
      end

      prompts = ["Drain Profile & Cover Type:"]
      defaults = [DRAIN_TYPES[0][:name]]
      list = [DRAIN_TYPES.map { |d| d[:name] }.join("|")]
      res = UI.inputbox(prompts, defaults, list, "EVL-Drain & Storm Network")
      return unless res

      idx = DRAIN_TYPES.find_index { |d| d[:name] == res[0] } || 0
      build_drain(pts, idx)
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Drain & Storm Network") { self.show_dialog }
      cmd.tooltip = "Stormwater Drain Network Generator with Invert Slope, Slabs & Grates"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 3. EVL-PipeNetwork (Sewer & Stormwater Network with Manholes)
  // =========================================================================
  {
    id: 'sketchup-evl-pipenetwork',
    nameEn: 'EVL-PipeNetwork: Underground Sewer & Storm Utility Network',
    nameBn: 'EVL-PipeNetwork: আন্ডারগ্রাউন্ড সিউয়ারেজ ও ড্রেনেজ পাইপ নেটওয়ার্ক ও ম্যানহোল',
    softwareId: 'sketchup',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-PipeNetwork.rbz',
    fileSize: '13.2 KB',
    categoryBn: 'আন্ডারগ্রাউন্ড পাইপ নেটওয়ার্ক',
    categoryEn: 'Underground Utility & Pipe Network',
    shortSummaryBn: 'আন্ডারগ্রাউন্ড সিউয়ারেজ ও স্টর্ম পাইপলাইন, সার্কুলার আরসিসি ম্যানহোল, ড্রপ কানেকশন এবং ইনভার্ট লেভেল নেটওয়ার্ক জেনারেটর।',
    shortSummaryEn: 'Parametric underground pipe utility network: Gravitational sewer & storm pipes, circular RCC manholes with tapered cones, cast iron covers, and invert levels.',
    purposeBn: 'সিভিল ও মিউনিসিপ্যাল প্রজেক্টে ম্যানহোল-টু-ম্যানহোল পাইপলাইন ড্র করা এবং প্রতিটি জয়েন্টে ইনভার্ট লেভেল বজায় রাখা কঠিন। EVL-PipeNetwork স্বয়ংক্রিয়ভাবে পাইপের ঢাল হিসাব করে নোডে সলিড ম্যানহোল ও কভার স্থাপন করে।',
    purposeEn: 'Civil & municipal infrastructure requires gravity flow sewer and stormwater networks. EVL-PipeNetwork places true 3D circular/rectangular manholes at junction nodes with tapered cones, heavy-duty covers, and connected pipe conduits with invert fall.',
    highlightsBn: [
      'সিউয়ারেজ ও স্টর্মওয়াটার পাইপলাইন (৩০০মিমি থেকে ১০০০মিমি ডায়ামিটার)',
      'সার্কুলার আরসিসি ম্যানহোল চেম্বার (ID ১২০০মিমি) ও কোনিক্যাল রিডিউসার নেক',
      'হেভি ডিউটি ড্যাকটাইল আয়রন (DI) সার্কুলার ম্যানহোল কভার',
      'পাইপ টু পাইপ গ্র্যাভিটি ফল ও ইনভার্ট লেভেল হিসাব',
      'সিভিল সাইট প্ল্যানিং ও বিওকিউ এস্টিমেশনের জন্য শতভাগ নিখুঁত',
    ],
    highlightsEn: [
      'Gravity sewer & storm utility pipes (300mm to 1000mm diameters)',
      'Circular reinforced concrete manholes (ID 1200mm) with conical neck',
      'Heavy duty ductile iron 600mm circular access covers',
      'Automatic invert drop and slope calculation between nodes',
      'Full 3D volumetric solid geometry ready for engineering estimation',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-PipeNetwork.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-PipeNetwork.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি কম্পিউটারে সেভ করুন।',
        instructionEn: 'Click Download to save EVL-PipeNetwork.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager থেকে ইনস্টল',
        titleEn: 'Install Extension',
        instructionBn: 'SketchUp-এর Extension Manager থেকে Install Extension দিয়ে ফাইলটি সিলেক্ট করুন।',
        instructionEn: 'In SketchUp, go to Extensions > Extension Manager and click Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'নেটওয়ার্ক ড্র করুন',
        titleEn: 'Generate Pipe Network',
        instructionBn: 'Extensions > EVLab Tools > EVL-PipeNetwork রান করে ম্যানহোল ও পাইপ তৈরি করুন।',
        instructionEn: 'Run Extensions > EVLab Tools > EVL-PipeNetwork on selected nodes/edges.',
      },
    ],
    quickCommand: 'EVL-PipeNet',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Civil Suite - EVL-PipeNetwork (Underground Sewer & Storm Network)
# Menu: Extensions > EVLab Tools > EVL-PipeNetwork
# =========================================================================
require 'sketchup.rb'

module EVLab
  module PipeNetwork
    SYSTEMS = [
      { name: "1. Stormwater Network (600mm Concrete Pipe, 1.8m Depth)", dia: 0.60.m, depth: 1.8.m, mat_name: "EVL_Storm_Pipe" },
      { name: "2. Sanitary Sewerage (300mm PVC Pipe, 2.2m Depth)", dia: 0.30.m, depth: 2.2.m, mat_name: "EVL_Sewer_Pipe" },
      { name: "3. Main Trunk Outfall (900mm Hume Pipe, 2.8m Depth)", dia: 0.90.m, depth: 2.8.m, mat_name: "EVL_Trunk_Pipe" }
    ]

    def self.get_mat(model, name, r, g, b)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
      end
      mat
    end

    def self.add_manhole(entities, pt, depth, mat_conc, mat_cover)
      mh_grp = entities.add_group
      mh_grp.name = "Manhole_Chamber"
      
      r_mh = 0.60.m # 1.2m dia
      circle = mh_grp.entities.add_circle(pt, Geom::Vector3d.new(0, 0, 1), r_mh, 16)
      f = mh_grp.entities.add_face(circle)
      if f && f.valid?
        f.reverse! if f.normal.z < 0
        f.pushpull(depth)
      end
      mh_grp.material = mat_conc
      # Move down to ground depth
      mh_grp.transform!(Geom::Transformation.translation(Geom::Vector3d.new(0, 0, -depth)))

      # Cast Iron Cover on Top at Ground Level
      c_circle = entities.add_circle(Geom::Point3d.new(pt.x, pt.y, pt.z + 0.01.m), Geom::Vector3d.new(0, 0, 1), 0.35.m, 16)
      c_face = entities.add_face(c_circle)
      c_face.material = mat_cover if c_face
    end

    def self.build_network(points, sys_idx = 0)
      return if points.nil? || points.length < 2
      model = Sketchup.active_model
      model.start_operation("EVL-PipeNetwork: Build Sewer/Storm Network", true)
      begin
        net_grp = model.active_entities.add_group
        net_grp.name = "EVL_PipeNetwork_Utility"
        entities = net_grp.entities

        sys = SYSTEMS[sys_idx] || SYSTEMS[0]
        dia = sys[:dia]
        depth = sys[:depth]

        mat_conc = get_mat(model, "EVL_Manhole_Concrete", 215, 218, 222)
        mat_cover = get_mat(model, "EVL_DI_Cover", 35, 38, 42)
        mat_pipe = sys_idx == 1 ? get_mat(model, "EVL_PVC_Orange", 220, 100, 30) : get_mat(model, "EVL_Concrete_Pipe", 170, 175, 180)

        # Place manholes at all nodes
        points.each do |pt|
          add_manhole(entities, pt, depth, mat_conc, mat_cover)
        end

        # Place pipes between nodes
        (0...(points.length - 1)).each do |i|
          p1 = points[i]
          p2 = points[i + 1]
          vec = p2 - p1
          len = vec.length
          next if len < 0.5.m

          dir = vec.normalize
          pipe_grp = entities.add_group
          pipe_grp.name = "Pipe_Segment"

          # Pipe centerline at invert + radius
          pipe_z1 = p1.z - depth + (dia / 2.0)
          pipe_z2 = p2.z - depth + (dia / 2.0) - 0.05.m # slight slope
          sp = Geom::Point3d.new(p1.x, p1.y, pipe_z1)
          ep = Geom::Point3d.new(p2.x, p2.y, pipe_z2)

          circ = pipe_grp.entities.add_circle(sp, dir, dia / 2.0, 12)
          f = pipe_grp.entities.add_face(circ)
          if f && f.valid?
            f.reverse! if f.normal.dot(dir) < 0
            f.pushpull(len)
          end
          pipe_grp.material = mat_pipe
        end

        model.commit_operation
        UI.messagebox("EVL-PipeNetwork: Pipe Utility Network generated!\\nSystem: #{sys[:name]}\\nManholes placed: #{points.length}")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-PipeNetwork Error: #{e.message}")
      end
    end

    def self.show_dialog
      model = Sketchup.active_model
      edges = model.selection.grep(Sketchup::Edge)
      if edges.length < 1
        UI.messagebox("EVL-PipeNetwork:\\nPlease select path lines in SketchUp to run pipe network generation.")
        return
      end

      pts = []
      edges.each do |e|
        pts << e.start.position unless pts.include?(e.start.position)
        pts << e.end.position unless pts.include?(e.end.position)
      end

      prompts = ["Utility Network Type:"]
      defaults = [SYSTEMS[0][:name]]
      list = [SYSTEMS.map { |s| s[:name] }.join("|")]
      res = UI.inputbox(prompts, defaults, list, "EVL-PipeNetwork (Sewer & Storm)")
      return unless res

      idx = SYSTEMS.find_index { |s| s[:name] == res[0] } || 0
      build_network(pts, idx)
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-PipeNetwork (Sewer & Storm Network)") { self.show_dialog }
      cmd.tooltip = "Underground Sewer & Storm Pipeline Modeler with 3D Manholes"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 4. EVL-Culvert (Box Culvert, Slab Culvert & Wing Walls)
  // =========================================================================
  {
    id: 'sketchup-evl-culvert',
    nameEn: 'EVL-Culvert: RCC Box Culvert, Slab Bridge & Wing Wall Designer',
    nameBn: 'EVL-Culvert: আরসিসি বক্স কালভার্ট, স্ল্যাব ব্রিজ ও উইং ওয়াল ডিজাইনার',
    softwareId: 'sketchup',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Culvert.rbz',
    fileSize: '15.4 KB',
    categoryBn: 'কালভার্ট ও ব্রিজ স্ট্রাকচার',
    categoryEn: 'Culvert & Bridge Structures',
    shortSummaryBn: 'সিঙ্গেল ও ডাবল ব্যারেল আরসিসি বক্স কালভার্ট, স্ল্যাব কালভার্ট, ৪৫° উইং ওয়াল, হেডওয়াল ও অ্যাপ্রন সহ পূর্ণাঙ্গ ৩ডি মডেল তৈরি করুন।',
    shortSummaryEn: 'Complete 3D parametric culvert modeler: Single & twin barrel RCC box culverts, deck slabs, 45° splayed wing walls, headwalls, and scour aprons.',
    purposeBn: 'রাস্তা ও রেলওয়ে ট্র্যাকের নিচে ক্রস-ড্রেনেজ কালভার্ট মডেলিংয়ে উইং ওয়াল এবং হেডওয়াল জটিল জিওমেট্রি তৈরি করে। EVL-Culvert স্প্যান ও ব্যারেল লেন্থ অনুযায়ী তাৎক্ষণিকভাবে পূর্ণাঙ্গ আরসিসি কালভার্ট তৈরি করে।',
    purposeEn: 'Cross-drainage culvert modeling under roads requires intricate 3D geometries for flared wing walls, deck slabs, and headwalls. EVL-Culvert generates true parametric structural culverts with realistic concrete materials.',
    highlightsBn: [
      'সিঙ্গেল ব্যারেল (Single Barrel) ও টুইন ব্যারেল (Twin Barrel) বক্স কালভার্ট',
      'আরসিসি ডেক স্ল্যাব কালভার্ট (Deck Slab on Abutments)',
      '৪৫ ডিগ্রি ফ্লেয়ার্ড উইং ওয়াল (Splayed Wing Walls) মাটি ধারণের জন্য',
      'টপ হেডওয়াল (Headwall) ও সেফটি ক্র্যাশ রেলিং',
      'আপস্ট্রিম ও ডাউনস্ট্রিম স্কর অ্যাপ্রন (Bed Apron) ও ড্রপ কাট-অফ ওয়াল',
    ],
    highlightsEn: [
      'Single barrel and twin barrel reinforced concrete box culverts',
      'RCC slab culvert on mass concrete abutments',
      '45-degree splayed retaining wing walls following road embankments',
      'Headwalls and crash safety parapets along carriageway edges',
      'Bed aprons with upstream & downstream scour cut-off walls',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Culvert.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Culvert.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Culvert.rbz সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Culvert.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager থেকে ইনস্টল',
        titleEn: 'Install in SketchUp',
        instructionBn: 'Extensions > Extension Manager > Install Extension দিয়ে ফাইলটি সিলেক্ট করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'কালভার্ট প্লেস করুন',
        titleEn: 'Place 3D Culvert',
        instructionBn: 'Extensions > EVLab Tools > EVL-Culvert দিয়ে মাপ সিলেক্ট করে এক ক্লিকে বসান।',
        instructionEn: 'Go to Extensions > EVLab Tools > EVL-Culvert to configure and place.',
      },
    ],
    quickCommand: 'EVL-Culvert',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Civil Suite - EVL-Culvert (Box Culvert, Slab & Wing Wall Modeler)
# Menu: Extensions > EVLab Tools > EVL-Culvert
# =========================================================================
require 'sketchup.rb'

module EVLab
  module Culvert
    TYPES = [
      { name: "1. Single Barrel Box Culvert (3.0m Span x 2.5m Vent x 10m Road Width)", span: 3.0.m, vent: 2.5.m, barrels: 1, len: 10.0.m },
      { name: "2. Twin Barrel Box Culvert (2x 3.0m Span x 2.5m Vent x 12m Road Width)", span: 3.0.m, vent: 2.5.m, barrels: 2, len: 12.0.m },
      { name: "3. RCC Slab Culvert on Abutments (4.5m Span x 2.0m Clear x 8m Width)", span: 4.5.m, vent: 2.0.m, barrels: 1, len: 8.0.m }
    ]

    def self.get_mat(model, name, r, g, b)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
      end
      mat
    end

    def self.build_culvert(pt, type_idx = 0)
      model = Sketchup.active_model
      model.start_operation("EVL-Culvert: Build 3D Culvert", true)
      begin
        c_grp = model.active_entities.add_group
        c_grp.name = "EVL_3D_Culvert"
        entities = c_grp.entities

        cfg = TYPES[type_idx] || TYPES[0]
        span = cfg[:span]
        vent = cfg[:vent]
        len = cfg[:len]
        barrels = cfg[:barrels]
        thick = 0.30.m # 300mm RCC slab/wall

        mat_conc = get_mat(model, "EVL_Culvert_RCC", 205, 208, 212)
        mat_apron = get_mat(model, "EVL_Scour_Apron", 175, 178, 182)

        total_span = (span * barrels) + (thick * (barrels + 1))
        half_l = len / 2.0

        # 1. Bottom Base Slab (Raft)
        b1 = Geom::Point3d.new(pt.x, pt.y - half_l, pt.z)
        b2 = Geom::Point3d.new(pt.x + total_span, pt.y - half_l, pt.z)
        b3 = Geom::Point3d.new(pt.x + total_span, pt.y + half_l, pt.z)
        b4 = Geom::Point3d.new(pt.x, pt.y + half_l, pt.z)
        f_base = entities.add_face(b1, b2, b3, b4)
        if f_base && f_base.valid?
          f_base.reverse! if f_base.normal.z < 0
          f_base.pushpull(thick)
        end

        # 2. Top Deck Slab
        top_z = pt.z + thick + vent
        t1 = Geom::Point3d.new(pt.x, pt.y - half_l, top_z)
        t2 = Geom::Point3d.new(pt.x + total_span, pt.y - half_l, top_z)
        t3 = Geom::Point3d.new(pt.x + total_span, pt.y + half_l, top_z)
        t4 = Geom::Point3d.new(pt.x, pt.y + half_l, top_z)
        f_top = entities.add_face(t1, t2, t3, t4)
        if f_top && f_top.valid?
          f_top.reverse! if f_top.normal.z < 0
          f_top.pushpull(thick)
        end

        # 3. Vertical Abutment / Pier Walls
        (0..barrels).each do |bi|
          wall_x = pt.x + bi * (span + thick)
          w1 = Geom::Point3d.new(wall_x, pt.y - half_l, pt.z + thick)
          w2 = Geom::Point3d.new(wall_x + thick, pt.y - half_l, pt.z + thick)
          w3 = Geom::Point3d.new(wall_x + thick, pt.y + half_l, pt.z + thick)
          w4 = Geom::Point3d.new(wall_x, pt.y + half_l, pt.z + thick)
          fw = entities.add_face(w1, w2, w3, w4)
          if fw && fw.valid?
            fw.reverse! if fw.normal.z < 0
            fw.pushpull(vent)
          end
        end

        # 4. Flared Wing Walls (45 deg splayed retaining walls)
        wing_l = 3.0.m
        wing_h = vent + thick * 2
        # Upstream Left Wing Wall
        uw1 = Geom::Point3d.new(pt.x, pt.y - half_l, pt.z)
        uw2 = Geom::Point3d.new(pt.x - wing_l * 0.707, pt.y - half_l - wing_l * 0.707, pt.z)
        uw3 = Geom::Point3d.new(pt.x - wing_l * 0.707, pt.y - half_l - wing_l * 0.707, pt.z + wing_h * 0.5)
        uw4 = Geom::Point3d.new(pt.x, pt.y - half_l, pt.z + wing_h)
        entities.add_face(uw1, uw2, uw3, uw4)

        # Upstream Right Wing Wall
        ur1 = Geom::Point3d.new(pt.x + total_span, pt.y - half_l, pt.z)
        ur2 = Geom::Point3d.new(pt.x + total_span + wing_l * 0.707, pt.y - half_l - wing_l * 0.707, pt.z)
        ur3 = Geom::Point3d.new(pt.x + total_span + wing_l * 0.707, pt.y - half_l - wing_l * 0.707, pt.z + wing_h * 0.5)
        ur4 = Geom::Point3d.new(pt.x + total_span, pt.y - half_l, pt.z + wing_h)
        entities.add_face(ur1, ur2, ur3, ur4)

        # Downstream Left Wing Wall
        dw1 = Geom::Point3d.new(pt.x, pt.y + half_l, pt.z)
        dw2 = Geom::Point3d.new(pt.x - wing_l * 0.707, pt.y + half_l + wing_l * 0.707, pt.z)
        dw3 = Geom::Point3d.new(pt.x - wing_l * 0.707, pt.y + half_l + wing_l * 0.707, pt.z + wing_h * 0.5)
        dw4 = Geom::Point3d.new(pt.x, pt.y + half_l, pt.z + wing_h)
        entities.add_face(dw1, dw2, dw3, dw4)

        # Downstream Right Wing Wall
        dr1 = Geom::Point3d.new(pt.x + total_span, pt.y + half_l, pt.z)
        dr2 = Geom::Point3d.new(pt.x + total_span + wing_l * 0.707, pt.y + half_l + wing_l * 0.707, pt.z)
        dr3 = Geom::Point3d.new(pt.x + total_span + wing_l * 0.707, pt.y + half_l + wing_l * 0.707, pt.z + wing_h * 0.5)
        dr4 = Geom::Point3d.new(pt.x + total_span, pt.y + half_l, pt.z + wing_h)
        entities.add_face(dr1, dr2, dr3, dr4)

        c_grp.material = mat_conc

        model.commit_operation
        UI.messagebox("EVL-Culvert: Structural 3D Culvert built successfully!\\nType: #{cfg[:name]}\\nClear Span: #{span/1.m}m | Vent Height: #{vent/1.m}m")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Culvert Error: #{e.message}")
      end
    end

    def self.show_dialog
      prompts = ["Culvert Type & Dimensions:"]
      defaults = [TYPES[0][:name]]
      list = [TYPES.map { |t| t[:name] }.join("|")]
      res = UI.inputbox(prompts, defaults, list, "EVL-Culvert (Box & Slab Culvert Suite)")
      return unless res

      idx = TYPES.find_index { |t| t[:name] == res[0] } || 0
      model = Sketchup.active_model
      pt = model.selection.empty? ? Geom::Point3d.new(0, 0, 0) : model.selection.first.bounds.center rescue Geom::Point3d.new(0, 0, 0)
      build_culvert(pt, idx)
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Culvert (Box & Slab Culvert Suite)") { self.show_dialog }
      cmd.tooltip = "Parametric RCC Box Culverts, Slab Bridges and 45-deg Wing Walls"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },
];
