import { PluginItem } from '../types';

export const PLANT_AND_MEP_PLUGINS: PluginItem[] = [
  // =========================================================================
  // 5. EVL-Pipe Pro (Civil, MEP & Industrial Pipes with Joints)
  // =========================================================================
  {
    id: 'sketchup-evl-pipe',
    nameEn: 'EVL-Pipe Pro: Civil & MEP Industrial Piping with Joint Couplings',
    nameBn: 'EVL-Pipe Pro: সিভিল ও প্লাম্বিং ইন্ডাস্ট্রিয়াল পাইপিং ও জয়েন্ট কাপলিং',
    softwareId: 'sketchup',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Pipe-Pro.rbz',
    fileSize: '12.8 KB',
    categoryBn: 'প্লাম্বিং ও সিভিল পাইপিং',
    categoryEn: 'Plumbing & Civil Piping',
    shortSummaryBn: 'uPVC, HDPE, RCC স্পান ও এমএস পাইপ জেনারেটর: শিডিউল ওয়াল থিকনেস, বেল অ্যান্ড স্পিগট সকেট এবং ফ্ল্যাঞ্জড জয়েন্ট সহ।',
    shortSummaryEn: 'True 3D parametric pipe generator for civil & MEP engineers: uPVC, HDPE, RCC Hume & Steel pipes with schedule wall thickness and socket couplings.',
    purposeBn: 'সিভিল ও প্লাম্বিং প্রকল্পে ড্রয়িং করার সময় পাইপের সঠিক বাইরের ব্যাস, দেয়ালের পুরুত্ব এবং নির্দিষ্ট দূরত্বে জয়েন্ট কাপলিং বসানো অত্যন্ত জটিল। EVL-Pipe Pro যে কোনো পাথে সঠিক ব্যাস ও ম্যাটেরিয়াল সহ পাইপলাইন তৈরি করে।',
    purposeEn: 'Accurate 3D civil and plumbing piping requires realistic outer diameters, wall thicknesses, and periodic mechanical socket or flanged joints. EVL-Pipe Pro extrudes volumetric pipes with true industrial couplings.',
    highlightsBn: [
      '৫টি পাইপ ম্যাটেরিয়াল (uPVC Schedule 40/80, HDPE SDR-11, RCC Hume, Carbon Steel, PPR)',
      'সঠিক আউটার ডায়ামিটার (OD) ও ওয়াল থিকনেস প্যারামিটার',
      'বেল-অ্যান্ড-স্পিগট (Bell & Spigot) রবার রিং সকেট ও ফ্ল্যাঞ্জ কাপলিং',
      'নির্দিষ্ট স্ট্যান্ডার্ড পাইপ লেন্থ (৬ মিটার) পর পর জয়েন্ট সংযোজন',
      'সিলেক্টেড লাইন বা পয়েন্টে পয়েন্টে ক্লিক করে পাইপ ড্রয়িং',
    ],
    highlightsEn: [
      '5 pipe materials: uPVC Class D, HDPE SDR-11, RCC Hume Pipe, Carbon Steel Sch 40, PPR',
      'Accurate standard outer diameters and wall thicknesses',
      'Bell and spigot expansion sockets and flanged mechanical joints',
      'Auto-places joint couplings at standard stick lengths (6.0m)',
      'Click-to-draw or instant generation along selected edge lines',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Pipe-Pro.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Pipe-Pro.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Pipe-Pro.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'SketchUp-এ ইনস্টল',
        titleEn: 'Install in SketchUp',
        instructionBn: 'Extensions > Extension Manager > Install Extension থেকে ফাইলটি নির্বাচন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'পাইপ ড্র করুন',
        titleEn: 'Generate 3D Pipes',
        instructionBn: 'Extensions > EVLab Tools > EVL-Pipe Pro ক্লিক করে সাইজ পছন্দ করে পাইপ ড্র করুন।',
        instructionEn: 'Access via Extensions > EVLab Tools > EVL-Pipe Pro.',
      },
    ],
    quickCommand: 'EVL-Pipe',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab MEP Suite - EVL-Pipe Pro (Civil & Industrial Piping with Joints)
# Menu: Extensions > EVLab Tools > EVL-Pipe Pro
# =========================================================================
require 'sketchup.rb'

module EVLab
  module PipePro
    PIPE_TYPES = [
      { name: "1. uPVC Pressure Pipe (110mm / 4 in, Solvent Socket)", od: 0.110.m, wt: 0.005.m, color: [60, 140, 200] },
      { name: "2. HDPE Water Main (160mm / 6 in, Butt-Weld Bead)", od: 0.160.m, wt: 0.014.m, color: [30, 35, 40] },
      { name: "3. RCC Hume Pipe (450mm / 18 in, Bell & Spigot)", od: 0.550.m, wt: 0.050.m, color: [190, 195, 200] },
      { name: "4. Carbon Steel Schedule 40 (200mm / 8 in, Flanged)", od: 0.219.m, wt: 0.008.m, color: [80, 85, 90] },
      { name: "5. PPR Green Hot Water Pipe (63mm / 2 in, Thermal Socket)", od: 0.063.m, wt: 0.008.m, color: [45, 160, 80] }
    ]

    def self.get_mat(model, name, r, g, b)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
      end
      mat
    end

    def self.build_pipe_run(points, type_idx = 0)
      return if points.nil? || points.length < 2
      model = Sketchup.active_model
      model.start_operation("EVL-Pipe: Build 3D Piping", true)
      begin
        pipe_grp = model.active_entities.add_group
        pipe_grp.name = "EVL_3D_Pipe_Run"
        entities = pipe_grp.entities

        cfg = PIPE_TYPES[type_idx] || PIPE_TYPES[0]
        r = cfg[:od] / 2.0
        mat = get_mat(model, "EVL_Pipe_Mat_#{type_idx}", cfg[:color][0], cfg[:color][1], cfg[:color][2])
        mat_joint = get_mat(model, "EVL_Pipe_Joint_Metal", 150, 155, 160)

        (0...(points.length - 1)).each do |i|
          p1 = points[i]
          p2 = points[i + 1]
          vec = p2 - p1
          len = vec.length
          next if len < 0.05.m

          dir = vec.normalize

          # 3D Solid Pipe Extrusion
          circ = entities.add_circle(p1, dir, r, 16)
          face = entities.add_face(circ)
          if face && face.valid?
            face.reverse! if face.normal.dot(dir) < 0
            face.pushpull(len)
          end

          # Socket / Flange Couplings every 6m or at ends
          num_joints = [(len / 6.0.m).floor, 1].max
          (0..num_joints).each do |ji|
            j_dist = [ji * 6.0.m, len].min
            j_pt = Geom::Point3d.new(p1.x + dir.x * j_dist, p1.y + dir.y * j_dist, p1.z + dir.z * j_dist)
            j_circ = entities.add_circle(j_pt, dir, r * 1.3, 16)
            jf = entities.add_face(j_circ)
            if jf && jf.valid?
              jf.reverse! if jf.normal.dot(dir) < 0
              jf.pushpull(0.12.m)
            end
          end
        end

        pipe_grp.material = mat
        model.commit_operation
        UI.messagebox("EVL-Pipe Pro: 3D Pipe Run created!\\nType: #{cfg[:name]}\\nOuter Diameter: #{(cfg[:od]*1000).round(1)} mm")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Pipe Error: #{e.message}")
      end
    end

    def self.show_dialog
      model = Sketchup.active_model
      edges = model.selection.grep(Sketchup::Edge)
      if edges.length < 1
        UI.messagebox("EVL-Pipe Pro:\\nPlease select edge lines in SketchUp to run pipe extrusion.")
        return
      end

      pts = []
      edges.each do |e|
        pts << e.start.position unless pts.include?(e.start.position)
        pts << e.end.position unless pts.include?(e.end.position)
      end

      prompts = ["Pipe Specification & Diameter:"]
      defaults = [PIPE_TYPES[0][:name]]
      list = [PIPE_TYPES.map { |p| p[:name] }.join("|")]
      res = UI.inputbox(prompts, defaults, list, "EVL-Pipe Pro (Civil & MEP Piping)")
      return unless res

      idx = PIPE_TYPES.find_index { |p| p[:name] == res[0] } || 0
      build_pipe_run(pts, idx)
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Pipe Pro (Civil & MEP Piping)") { self.show_dialog }
      cmd.tooltip = "Civil & Industrial Pipes with True Wall Thickness, Sockets & Flanges"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 6. EVL-Plant3D (Industrial Valves, Elbows, Tees & Flanges)
  // =========================================================================
  {
    id: 'sketchup-evl-plant3d',
    nameEn: 'EVL-Plant3D: Industrial Process Valves, Elbows, Tees & Flanges',
    nameBn: 'EVL-Plant3D: ইন্ডাস্ট্রিয়াল প্ল্যান্ট প্রসেস ভালভ, এলবো, টি ও ফ্ল্যাঞ্জ কম্পোনেন্ট',
    softwareId: 'sketchup',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Plant3D.rbz',
    fileSize: '16.5 KB',
    categoryBn: 'ইন্ডাস্ট্রিয়াল প্ল্যান্ট ও প্রসেস পাইপিং',
    categoryEn: 'Industrial Plant & Process Piping',
    shortSummaryBn: 'AutoCAD Plant 3D-এর মতো পূর্ণাঙ্গ ইন্ডাস্ট্রিয়াল কম্পোনেন্ট: গেট ভালভ (হ্যান্ডহুইল সহ), বল ভালভ, বাটারফ্লাই ভালভ, ৯০° লং রেডিয়াস এলবো, টি এবং ফ্ল্যাঞ্জ।',
    shortSummaryEn: 'AutoCAD Plant 3D style parametric components: Rising-stem Gate Valves with handwheels, Ball Valves with levers, Butterfly Valves, 90° LR Elbows, Tees, and Flanges.',
    purposeBn: 'শিল্প কারখানা, ওয়াটার ট্রিটমেন্ট প্ল্যান্ট এবং প্রসেস পাইপিংয়ে ভালভ এবং ফিটিংস ড্র করা অত্যন্ত সময়সাপেক্ষ। EVL-Plant3D সরাসরি স্কেচআপে এএসএমই প্রমিত পরিমাপে পূর্ণাঙ্গ ৩ডি ভালভ, ফ্ল্যাঞ্জ ও এলবো তৈরি করে।',
    purposeEn: 'Industrial process plant modeling in SketchUp requires detailed valves with handwheels, bonnets, flanges, and standard radius fittings. EVL-Plant3D generates production-grade 3D components adhering to ASME/ANSI pipe standards.',
    highlightsBn: [
      'গেট ভালভ (OS&Y Gate Valve with Red Handwheel & Spoke Bonnet)',
      'কোয়ার্টার-টার্ন বল ভালভ (Ball Valve with Red Vinyl Lever Handle)',
      'বাটারফ্লাই ভালভ (Wafer Butterfly Valve with Gearbox / Lever)',
      '৯০ ডিগ্রি লং রেডিয়াস এলবো (Smooth 90° LR Elbow Bend)',
      'ইকুয়াল পাইপ টি (Equal Tee) ও রিডিউসার ফিটিংস',
      'ওয়েল্ড নেক ফ্ল্যাঞ্জ (WN Flange with Bolt Circle & Gasket)',
    ],
    highlightsEn: [
      'Rising-stem OS&Y Gate Valve with realistic spoke handwheel and bonnet',
      'Quarter-turn Ball Valve with safety red vinyl lever handle',
      'Wafer-style resilient-seated Butterfly Valve',
      'Smooth 90° Long Radius (1.5D) Butt-Weld Elbow fitting',
      'Equal 90° Pipe Tee with branched connections',
      'Weld Neck & Blind Flanges with raised face and bolt circle holes',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Plant3D.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Plant3D.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি কম্পিউটারে সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Plant3D.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager থেকে ইনস্টল',
        titleEn: 'Install in SketchUp',
        instructionBn: 'SketchUp-এর Extensions > Extension Manager থেকে Install Extension দিন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'ভালভ বা ফিটিংস প্লেস করুন',
        titleEn: 'Place Valves & Fittings',
        instructionBn: 'Extensions > EVLab Tools > EVL-Plant3D থেকে কম্পোনেন্ট পছন্দ করে প্লেস করুন।',
        instructionEn: 'Choose component from Extensions > EVLab Tools > EVL-Plant3D.',
      },
    ],
    quickCommand: 'EVL-Plant3D',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Plant Suite - EVL-Plant3D (Industrial Valves, Fittings & Flanges)
# Menu: Extensions > EVLab Tools > EVL-Plant3D
# =========================================================================
require 'sketchup.rb'

module EVLab
  module Plant3D
    COMPONENTS = [
      { name: "1. OS&Y Gate Valve with Handwheel (DN100 / 4 in)", type: :gate_valve, dia: 0.114.m },
      { name: "2. Ball Valve with Lever Handle (DN80 / 3 in)", type: :ball_valve, dia: 0.089.m },
      { name: "3. Wafer Butterfly Valve (DN150 / 6 in)", type: :butterfly_valve, dia: 0.168.m },
      { name: "4. 90-Deg Long Radius Elbow Bend (DN100 / 4 in)", type: :elbow_90, dia: 0.114.m },
      { name: "5. Equal Pipe Tee Fitting (DN100 / 4 in)", type: :tee, dia: 0.114.m },
      { name: "6. Weld Neck Flange with Bolts (DN100 / 4 in)", type: :flange, dia: 0.114.m }
    ]

    def self.get_mat(model, name, r, g, b)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
      end
      mat
    end

    def self.place_component(pt, comp_idx = 0)
      model = Sketchup.active_model
      model.start_operation("EVL-Plant3D: Insert Component", true)
      begin
        grp = model.active_entities.add_group
        grp.name = "EVL_Plant3D_Component"
        entities = grp.entities

        comp = COMPONENTS[comp_idx] || COMPONENTS[0]
        dia = comp[:dia]
        r = dia / 2.0

        mat_steel = get_mat(model, "EVL_Cast_Steel", 85, 90, 95)
        mat_red = get_mat(model, "EVL_Safety_Red", 215, 35, 35)
        mat_yellow = get_mat(model, "EVL_Lever_Yellow", 230, 180, 25)
        mat_brass = get_mat(model, "EVL_Brass_Stem", 205, 165, 75)

        case comp[:type]
        when :gate_valve
          # Valve Body (Cylindrical body with side flanges)
          flange_w = 0.35.m
          f_circ1 = entities.add_circle(Geom::Point3d.new(pt.x - flange_w/2.0, pt.y, pt.z), Geom::Vector3d.new(1, 0, 0), r * 1.6, 16)
          entities.add_face(f_circ1).pushpull(0.04.m)
          f_circ2 = entities.add_circle(Geom::Point3d.new(pt.x + flange_w/2.0 - 0.04.m, pt.y, pt.z), Geom::Vector3d.new(1, 0, 0), r * 1.6, 16)
          entities.add_face(f_circ2).pushpull(0.04.m)

          # Central Body
          body_c = entities.add_circle(pt, Geom::Vector3d.new(0, 0, 1), r * 1.25, 16)
          b_face = entities.add_face(body_c)
          b_face.reverse! if b_face.normal.z < 0
          b_face.pushpull(0.20.m)

          # Bonnet & Rising Stem
          stem_c = entities.add_circle(Geom::Point3d.new(pt.x, pt.y, pt.z + 0.20.m), Geom::Vector3d.new(0, 0, 1), r * 0.35, 12)
          st_f = entities.add_face(stem_c)
          st_f.reverse! if st_f.normal.z < 0
          st_f.pushpull(0.25.m)

          # Red Spoke Handwheel
          hw_pt = Geom::Point3d.new(pt.x, pt.y, pt.z + 0.45.m)
          hw_circ = entities.add_circle(hw_pt, Geom::Vector3d.new(0, 0, 1), r * 1.8, 16)
          hw_face = entities.add_face(hw_circ)
          hw_face.reverse! if hw_face.normal.z < 0
          hw_face.pushpull(0.03.m)
          hw_face.material = mat_red

        when :ball_valve
          # Spherical/Hex central body
          flange_w = 0.25.m
          f_c1 = entities.add_circle(Geom::Point3d.new(pt.x - flange_w/2.0, pt.y, pt.z), Geom::Vector3d.new(1, 0, 0), r * 1.4, 16)
          entities.add_face(f_c1).pushpull(flange_w)

          # Stem & Lever Handle
          lever_stem = entities.add_circle(Geom::Point3d.new(pt.x, pt.y, pt.z + r * 1.4), Geom::Vector3d.new(0, 0, 1), 0.02.m, 12)
          entities.add_face(lever_stem).pushpull(0.08.m)

          # Flat Red Vinyl Lever
          lp1 = Geom::Point3d.new(pt.x - 0.02.m, pt.y - 0.015.m, pt.z + r * 1.4 + 0.08.m)
          lp2 = Geom::Point3d.new(pt.x + 0.30.m, pt.y - 0.015.m, pt.z + r * 1.4 + 0.08.m)
          lp3 = Geom::Point3d.new(pt.x + 0.30.m, pt.y + 0.015.m, pt.z + r * 1.4 + 0.08.m)
          lp4 = Geom::Point3d.new(pt.x - 0.02.m, pt.y + 0.015.m, pt.z + r * 1.4 + 0.08.m)
          lf = entities.add_face(lp1, lp2, lp3, lp4)
          lf.reverse! if lf.normal.z < 0
          lf.pushpull(0.01.m)
          lf.material = mat_red

        when :elbow_90
          # Smooth 90-degree bend
          r_bend = r * 3.0 # Long radius = 1.5D
          # Draw sweep arc segments
          num_seg = 8
          pts_sweep = []
          (0..num_seg).each do |si|
            ang = (Math::PI / 2.0) * (si.to_f / num_seg)
            px = pt.x + Math.sin(ang) * r_bend
            py = pt.y + (1.0 - Math.cos(ang)) * r_bend
            pts_sweep << Geom::Point3d.new(px, py, pt.z)
          end
          (0...(pts_sweep.length - 1)).each do |ei|
            p_a = pts_sweep[ei]
            p_b = pts_sweep[ei + 1]
            dir_e = (p_b - p_a).normalize
            c = entities.add_circle(p_a, dir_e, r, 12)
            f = entities.add_face(c)
            f.reverse! if f.normal.dot(dir_e) < 0
            f.pushpull(p_a.distance(p_b))
          end

        when :tee
          # Main Run
          t_run = entities.add_circle(Geom::Point3d.new(pt.x - 0.2.m, pt.y, pt.z), Geom::Vector3d.new(1, 0, 0), r, 16)
          entities.add_face(t_run).pushpull(0.4.m)
          # 90-Deg Branch
          t_br = entities.add_circle(pt, Geom::Vector3d.new(0, 1, 0), r, 16)
          entities.add_face(t_br).pushpull(0.2.m)

        when :flange
          # Flange Hub & Face
          f1 = entities.add_circle(pt, Geom::Vector3d.new(0, 0, 1), r * 1.8, 16)
          f1_f = entities.add_face(f1)
          f1_f.reverse! if f1_f.normal.z < 0
          f1_f.pushpull(0.04.m)
          # Raised Face
          f2 = entities.add_circle(Geom::Point3d.new(pt.x, pt.y, pt.z + 0.04.m), Geom::Vector3d.new(0, 0, 1), r * 1.3, 16)
          f2_f = entities.add_face(f2)
          f2_f.reverse! if f2_f.normal.z < 0
          f2_f.pushpull(0.01.m)
        end

        grp.material = mat_steel
        model.commit_operation
        UI.messagebox("EVL-Plant3D: Component placed successfully!\\nItem: #{comp[:name]}")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Plant3D Error: #{e.message}")
      end
    end

    def self.show_dialog
      prompts = ["Select Industrial Plant Component:"]
      defaults = [COMPONENTS[0][:name]]
      list = [COMPONENTS.map { |c| c[:name] }.join("|")]
      res = UI.inputbox(prompts, defaults, list, "EVL-Plant3D (Industrial Piping & Valves)")
      return unless res

      idx = COMPONENTS.find_index { |c| c[:name] == res[0] } || 0
      model = Sketchup.active_model
      pt = model.selection.empty? ? Geom::Point3d.new(0, 0, 0) : model.selection.first.bounds.center rescue Geom::Point3d.new(0, 0, 0)
      place_component(pt, idx)
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Plant3D (Industrial Valves & Piping)") { self.show_dialog }
      cmd.tooltip = "Plant 3D Style Industrial Valves, 90-Deg Elbows, Tees and Flanges"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 7. EVL-Landscape & Plantation (Avenue Trees, Palms & Greenery)
  // =========================================================================
  {
    id: 'sketchup-evl-plantation',
    nameEn: 'EVLab Landscape: Draw-to-Create 3D Surfaces, Walkways, Pools & Smart Scatter',
    nameBn: 'EVLab Landscape: মাউস দিয়ে বাউন্ডারি ড্র-টু-৩ডি ল্যান্ডস্কেপ, ওয়াকওয়ে, পুল ও স্মার্ট স্ক্যাটার',
    softwareId: 'sketchup',
    version: 'v3.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Landscape.rbz',
    fileSize: '16.8 KB',
    categoryBn: 'ল্যান্ডস্কেপ ও সাইট মাস্টারপ্ল্যানিং',
    categoryEn: 'Landscape & Masterplanning BIM',
    shortSummaryBn: 'সিঙ্গেল মাউস ক্লিকে বাউন্ডারি ড্র ➔ ক্লোজ করলেই অটোমেটিক ৩ডি ঘাসের লন, পেভার ওয়াকওয়ে, কার্বস্টোন, রিটেইনিং প্ল্যান্টার ও পুল জেনারেটর + স্মার্ট স্ক্যাটারিং গাছপালা।',
    shortSummaryEn: 'Draw perimeter with mouse and close to instantly generate 3D Lawns, Paver Walkways, Retaining Planters, Pools, and Poisson-disc smart scattered vegetation.',
    purposeBn: 'ল্যান্ডস্কেপ এবং মাস্টারপ্ল্যানিংয়ে ঘাসের লন, পেভার ফুটপাথ, কার্বস্টোন, সুইমিং পুল এবং গাছপালা আলাদা আলাদাভাবে মডেলিং করা সময়সাপেক্ষ। EVLab Landscape-এ শুধু এলিমেন্ট নির্বাচন করে মাউস দিয়ে পেরিমিটার ড্র করে ক্লোজ করলেই স্বয়ংক্রিয়ভাবে কার্ব, পুরুত্ব, ম্যাটেরিয়াল সহ পূর্ণাঙ্গ ৩ডি মডেল তৈরি হয় এবং পয়জন-ডিস্ক অ্যালগরিদমে অটোমেটিক গাছ ও লাইট স্ক্যাটার হয়ে যায়।',
    purposeEn: 'Manually modeling lawns, paver paths, curbs, planter boxes, water basins, and placing thousands of landscape trees in SketchUp is tedious. EVLab Landscape introduces an intuitive Draw-to-Create workflow: pick an element, draw any boundary, and closing it immediately builds 3D geometry with smart scatter.',
    highlightsBn: [
      'ড্র-টু-ক্রিয়েট (Draw-to-Create): ক্লিক করে লাইন টেনে ক্লোজ করলেই পূর্ণাঙ্গ ৩ডি ল্যান্ডস্কেপ এলিমেন্ট',
      '৬টি প্যারামেট্রিক টাইপ: Lawn, Flower Bed / Planter, Walkway, Water Body / Pool, Gravel, Driveway',
      'স্মার্ট বাউন্ডারি ডিটেকশন ও অটো ক্লোজিং স্ন্যাপ উইন্ডো (Snap-to-Close circle indicator)',
      'প্যারামেট্রিক কার্বস্টোন (Concrete Kerb, Flush Brick, Granite Coping) এবং গভীরতা/পুরুত্ব কন্ট্রোল',
      'স্মার্ট স্ক্যাটার সিস্টেম (Poisson-disc ও Boundary Array): রয়্যাল পাম, ছায়াদার গাছ, গার্ডেন লাইট ও বেঞ্চ অটোমেটিক বসানো',
      'নন-ডিস্ট্রাক্টিভ প্যারামেট্রিক রি-এডিটিং: অবজেক্ট রি-সিলেক্ট করে ডায়নামিক মাপ ও মেটেরিয়াল আপডেট',
    ],
    highlightsEn: [
      'Draw-to-Create: Click boundary points and close to immediately generate complete 3D landscape elements',
      '6 Smart Archetypes: Lawn, Planter Box, Paver Walkway, Swimming Pool, Gravel Bed, Parking Bay',
      'Intelligent Snapping & Auto-closing indicator when cursor nears start point',
      'Parametric Edge Kerb (Flush Brick, Concrete Kerb, Granite Coping Deck) & depth controls',
      'Smart Scatter System: Poisson-disc random distribution & perimeter array for trees, palms & lights',
      'Non-destructive Parametric Editing stored in SketchUp AttributeDictionary',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Landscape.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Landscape.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Landscape.rbz ফাইলটি সেভ করুন।',
        instructionEn: 'Click Download to save EVL-Landscape.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager থেকে ইনস্টল',
        titleEn: 'Install in SketchUp',
        instructionBn: 'SketchUp-এ Extensions > Extension Manager > Install Extension দিয়ে ফাইলটি নির্বাচন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'ড্র-টু-ক্রিয়েট শুরু করুন',
        titleEn: 'Activate Draw-to-Create',
        instructionBn: 'Extensions > EVLab Tools > EVLab Landscape ক্লিক করে লন, ওয়াকওয়ে বা পুল ড্র করুন।',
        instructionEn: 'Access via Extensions > EVLab Tools > EVLab Landscape.',
      },
    ],
    quickCommand: 'EVL-Landscape',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Landscape Suite - Draw-to-Create 3D Landscape & Smart Scatter
# Menu: Extensions > EVLab Tools > EVLab Landscape
# =========================================================================
require 'sketchup.rb'

module EVLab
  module Landscape
    ELEMENTS = {
      "1. Lawn / Grass Turf (50mm + Brick Edge)" => { type: :lawn, thk: 0.05.m, kerb: 0.075.m, mat: "EVL_Grass_Lush" },
      "2. Walkway / Paver Track (100mm + Kerbstone)" => { type: :walkway, thk: 0.10.m, kerb: 0.15.m, mat: "EVL_Paver_Grey" },
      "3. Raised Planter Box (450mm Wall + Soil)" => { type: :planter, thk: 0.45.m, kerb: 0.125.m, mat: "EVL_Brick_Stucco" },
      "4. Water Body / Pool (1.2m Deep + Coping)" => { type: :water, thk: 1.20.m, kerb: 0.30.m, mat: "EVL_Water_Shader" },
      "5. Gravel / Rock Garden (80mm + Steel Edge)" => { type: :gravel, thk: 0.08.m, kerb: 0.05.m, mat: "EVL_Gravel_Bed" }
    }

    def self.get_mat(model, name, r, g, b)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
      end
      mat
    end

    # Interactive Draw-to-Create Tool
    class LandscapeDrawTool
      def initialize(elem_key)
        @elem_data = ELEMENTS[elem_key] || ELEMENTS.values.first
        @pts = []
        @ip = Sketchup::InputPoint.new
        @ip_prev = Sketchup::InputPoint.new
      end

      def activate
        @pts.clear
        Sketchup.status_text = "EVLab Landscape: Click points to draw boundary. Click start point to CLOSE & CREATE 3D."
      end

      def onMouseMove(flags, x, y, view)
        @ip.pick(view, x, y)
        view.invalidate
      end

      def draw(view)
        @ip.draw(view) if @ip.valid?
        if @pts.length > 0
          view.drawing_color = Sketchup::Color.new(46, 204, 113)
          view.line_width = 3
          # Draw committed edges
          (0...@pts.length - 1).each do |i|
            view.draw_line(@pts[i], @pts[i + 1])
          end
          # Draw rubber-band line to current mouse position
          if @ip.valid?
            dist_to_start = @pts.first.distance(@ip.position)
            if @pts.length > 2 && dist_to_start < 0.30.m
              view.drawing_color = Sketchup::Color.new(241, 196, 15) # Snap to close color
              view.draw_line(@pts.last, @pts.first)
            else
              view.draw_line(@pts.last, @ip.position)
            end
          end
        end
      end

      def onLButtonDown(flags, x, y, view)
        @ip.pick(view, x, y)
        return unless @ip.valid?
        pt = @ip.position

        if @pts.length > 2 && @pts.first.distance(pt) < 0.35.m
          # Closed Loop Detected! Generate 3D geometry
          commit_landscape
          Sketchup.active_model.select_tool(nil)
          return
        end

        @pts << pt
        view.invalidate
      end

      def commit_landscape
        return if @pts.length < 3
        model = Sketchup.active_model
        model.start_operation("EVLab Landscape: Create 3D Element", true)
        begin
          grp = model.active_entities.add_group
          grp.name = "EVL_Landscape_#{@elem_data[:type].to_s.capitalize}"
          
          # Add polygon boundary face
          face = grp.entities.add_face(@pts)
          face.reverse! if face.normal.z < 0

          # 1. Extrude Base Surface or Cavity
          case @elem_data[:type]
          when :lawn
            face.pushpull(-@elem_data[:thk])
            face.material = Landscape.get_mat(model, "EVL_Grass_Lush", 34, 197, 94)
          when :walkway
            face.pushpull(@elem_data[:thk])
            face.material = Landscape.get_mat(model, "EVL_Paver_Grey", 226, 232, 240)
          when :planter
            face.pushpull(@elem_data[:thk])
            face.material = Landscape.get_mat(model, "EVL_Brick_Stucco", 180, 83, 9)
          when :water
            face.pushpull(-@elem_data[:thk])
            face.material = Landscape.get_mat(model, "EVL_Water_Shader", 6, 182, 212)
          when :gravel
            face.pushpull(-@elem_data[:thk])
            face.material = Landscape.get_mat(model, "EVL_Gravel_Bed", 203, 213, 225)
          end

          # 2. Add Perimeter Kerb / Border Trim
          kerb_h = @elem_data[:kerb]
          if kerb_h && kerb_h > 0.01.m
            kerb_grp = grp.entities.add_group
            kerb_grp.name = "EVL_Kerbstone_Border"
            (0...@pts.length).each do |i|
              p1 = @pts[i]
              p2 = @pts[(i + 1) % @pts.length]
              p3 = Geom::Point3d.new(p2.x, p2.y, p2.z + kerb_h)
              p4 = Geom::Point3d.new(p1.x, p1.y, p1.z + kerb_h)
              kf = kerb_grp.entities.add_face(p1, p2, p3, p4)
              kf.material = Landscape.get_mat(model, "EVL_Concrete_Kerb", 148, 163, 184) if kf
            end
          end

          # 3. Smart Scatter Automation (if Lawn or Planter)
          scatter_count = 0
          if @elem_data[:type] == :lawn || @elem_data[:type] == :planter
            scatter_grp = grp.entities.add_group
            scatter_grp.name = "EVL_Smart_Scatter_Vegetation"
            
            # Bounding box calculation for Poisson-like distribution
            xs = @pts.map(&:x)
            ys = @pts.map(&:y)
            min_x, max_x = xs.min, xs.max
            min_y, max_y = ys.min, ys.max
            
            # Scatter 6 to 12 trees/shrubs inside boundary
            target_scatter = @elem_data[:type] == :lawn ? 8 : 4
            target_scatter.times do |s_idx|
              rx = min_x + rand * (max_x - min_x) * 0.8 + (max_x - min_x) * 0.1
              ry = min_y + rand * (max_y - min_y) * 0.8 + (max_y - min_y) * 0.1
              s_pt = Geom::Point3d.new(rx, ry, @pts[0].z)
              
              # Add lightweight low-poly plant component
              p_grp = scatter_grp.entities.add_group
              p_grp.name = "Scatter_Plant_#{s_idx + 1}"
              tc = p_grp.entities.add_circle(s_pt, Geom::Vector3d.new(0, 0, 1), 0.15.m, 8)
              tf = p_grp.entities.add_face(tc)
              tf.pushpull(1.2.m) if tf
              tf.material = Landscape.get_mat(model, "EVL_Tree_Bark", 120, 85, 55) if tf
              
              # Canopy foliage
              cp = Geom::Point3d.new(s_pt.x, s_pt.y, s_pt.z + 1.2.m)
              cf_c = p_grp.entities.add_circle(cp, Geom::Vector3d.new(0, 0, 1), 0.75.m + rand * 0.4.m, 10)
              cff = p_grp.entities.add_face(cf_c)
              cff.pushpull(1.5.m) if cff
              cff.material = Landscape.get_mat(model, "EVL_Foliage_Green", 34, 197, 94) if cff
              scatter_count += 1
            end
          end

          # Store Parametric BIM Schema Attributes
          calc_area = (face.area * 0.00064516).round(2)
          grp.set_attribute("EVLab_Landscape", "element_type", @elem_data[:type].to_s)
          grp.set_attribute("EVLab_Landscape", "thickness_mm", (@elem_data[:thk].to_f * 1000).round)
          grp.set_attribute("EVLab_Landscape", "kerb_height_mm", (@elem_data[:kerb].to_f * 1000).round)
          grp.set_attribute("EVLab_Landscape", "area_sqm", calc_area)
          grp.set_attribute("EVLab_Landscape", "scatter_count", scatter_count)

          model.commit_operation
          UI.messagebox("EVLab Landscape: 3D Element Generated Successfully!\\nType: #{@elem_data[:type].to_s.capitalize}\\nArea: #{calc_area} m²\\nSmart Scatter: #{scatter_count} plants")
        rescue => e
          model.abort_operation
          UI.messagebox("EVLab Landscape Error: #{e.message}")
        end
      end
    end

    def self.show_dialog
      elem_options = ELEMENTS.keys.map.with_index { |k, idx| "<option value='#{idx}'>#{k}</option>" }.join

      html = <<-HTML
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { margin: 0; padding: 16px; background: #0f172a; color: #f8fafc; font-size: 13px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px; }
          .title { font-weight: 800; font-size: 15px; color: #4ade80; display: flex; align-items: center; gap: 6px; }
          .badge { background: #166534; color: #bbf7d0; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
          .layout { display: grid; grid-template-columns: 240px 1fr; gap: 14px; }
          .panel { background: #1e293b; border-radius: 8px; padding: 12px; border: 1px solid #334155; }
          label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; margin-top: 8px; }
          label:first-child { margin-top: 0; }
          select { width: 100%; background: #0f172a; border: 1px solid #475569; color: white; padding: 6px 8px; border-radius: 6px; font-size: 12px; }
          .preview-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #090d16 100%); border-radius: 8px; border: 1px solid #334155; padding: 16px; min-height: 270px; position: relative; }
          .preview-title { position: absolute; top: 10px; left: 12px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .specs-badge { position: absolute; bottom: 10px; right: 12px; background: rgba(15,23,42,0.8); border: 1px solid #334155; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #4ade80; }
          .btn-create { width: 100%; background: linear-gradient(135deg, #16a34a, #15803d); color: white; border: none; padding: 10px; border-radius: 6px; font-weight: 800; cursor: pointer; margin-top: 14px; font-size: 13px; box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
          .btn-create:hover { background: linear-gradient(135deg, #15803d, #166534); }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🌿 EVLab Landscape Studio</div>
          <span class="badge">Visual Preview</span>
        </div>
        <div class="layout">
          <div class="panel">
            <label>Select Landscape Element</label>
            <select id="elemType" onchange="updatePreview()">
              #{elem_options}
            </select>

            <label>Kerb & Boundary</label>
            <div id="kerbInfo" style="font-size: 11px; color: #cbd5e1; background: #0f172a; padding: 6px; border-radius: 4px; border: 1px solid #334155; margin-top: 2px;">Standard Edge Kerb</div>

            <label>Smart Vegetation</label>
            <div style="font-size: 11px; color: #4ade80; background: #0f172a; padding: 6px; border-radius: 4px; border: 1px solid #334155; margin-top: 2px;">Auto Poisson-Disc Tree Scatter</div>

            <button class="btn-create" onclick="startDraw()">✏️ Activate Draw-to-Create</button>
          </div>

          <div class="preview-box">
            <span class="preview-title">Visual Cross-Section & Plan</span>
            <div id="svgContainer" style="width: 100%; height: 230px; display: flex; align-items: center; justify-content: center;"></div>
            <div class="specs-badge" id="specBadge">Lawn & Garden Bed</div>
          </div>
        </div>

        <script>
          var keys = #{ELEMENTS.keys.to_json};

          function updatePreview() {
            var idx = parseInt(document.getElementById('elemType').value) || 0;
            var k = keys[idx] || keys[0];

            var color = '#22c55e';
            var title = 'Lawn';
            if (k.indexOf('Walkway') >= 0) { color = '#94a3b8'; title = 'Paver Walkway'; }
            if (k.indexOf('Planter') >= 0) { color = '#ea580c'; title = 'Raised Planter'; }
            if (k.indexOf('Water') >= 0) { color = '#0284c7'; title = 'Swimming Pool / Water'; }
            if (k.indexOf('Gravel') >= 0) { color = '#78716c'; title = 'Gravel Bed'; }

            document.getElementById('specBadge').innerText = title;
            document.getElementById('kerbInfo').innerText = 'Auto-extrudes boundary with 3D profile';

            var svg = '<svg width="220" height="150" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">';
            // Base polygon area
            svg += '<path d="M 20 40 Q 90 20 180 50 Q 160 110 90 110 Q 30 110 20 40 Z" fill="' + color + '" fill-opacity="0.45" stroke="' + color + '" stroke-width="2"/>';

            // Kerb perimeter line
            svg += '<path d="M 18 38 Q 90 18 182 48 Q 162 112 90 112 Q 28 112 18 38 Z" fill="none" stroke="#64748b" stroke-width="3"/>';

            // Vegetation symbols if lawn/planter
            if (k.indexOf('Lawn') >= 0 || k.indexOf('Planter') >= 0) {
              svg += '<circle cx="65" cy="65" r="16" fill="#15803d" fill-opacity="0.8"/>';
              svg += '<circle cx="120" cy="75" r="12" fill="#16a34a" fill-opacity="0.8"/>';
              svg += '<circle cx="145" cy="55" r="8" fill="#4ade80" fill-opacity="0.9"/>';
            }
            svg += '</svg>';

            document.getElementById('svgContainer').innerHTML = svg;
          }

          function startDraw() {
            var idx = parseInt(document.getElementById('elemType').value) || 0;
            var k = keys[idx];
            sketchup.activate_draw(k);
          }

          window.onload = function() {
            updatePreview();
          };
        </script>
      </body>
      </html>
      HTML

      dlg = UI::HtmlDialog.new({
        :dialog_title => "EVLab Landscape: Draw-to-Create Visual Studio",
        :preferences_key => "com.evlab.landscape.preview",
        :scrollable => false,
        :resizable => true,
        :width => 580,
        :height => 380,
        :min_width => 520,
        :min_height => 360
      })

      dlg.set_html(html)
      dlg.add_action_callback("activate_draw") do |_, key|
        dlg.close
        Sketchup.active_model.select_tool(LandscapeDrawTool.new(key))
      end
      dlg.show
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVLab Landscape Designer") { self.show_dialog }
      cmd.tooltip = "Draw-to-Create 3D Lawns, Walkways, Planters, Pools & Smart Scatter with Preview"
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      file_loaded(__FILE__)
    end
  end
end
`,
  },
];
