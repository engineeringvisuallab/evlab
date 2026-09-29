import { PluginItem } from '../types';

export const BUILDING_PLUGINS: PluginItem[] = [
  // =========================================================================
  // 1. EVL-BuildingLayers (Standard Architectural Tag/Layer Generator & Isolator)
  // =========================================================================
  {
    id: 'sketchup-evl-building-layers',
    nameEn: 'EVL-BuildingLayers: 1-Click Architectural Tag/Layer Manager & Isolator',
    nameBn: 'EVL-BuildingLayers: ১-ক্লিকে আর্কিটেকচারাল লেয়ার/ট্যাগ তৈরি ও আইসোলেটর',
    softwareId: 'sketchup',
    version: 'v1.5.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-BuildingLayers.rbz',
    fileSize: '14.2 KB',
    categoryBn: 'লেয়ার ম্যানেজমেন্ট ও বিআইএম স্ট্যান্ডার্ড',
    categoryEn: 'Layer Management & BIM Standards',
    shortSummaryBn: 'বিল্ডিং ৩ডি মডেলিংয়ের শুরুতে ১-ক্লিক করলেই ১৩টি স্ট্যান্ডার্ড আর্কিটেকচারাল লেয়ার/ট্যাগ স্বয়ংক্রিয় কালার কোড সহ তৈরি হবে এবং মডেল অবজেক্ট অটো-অ্যাসাইন করবে।',
    shortSummaryEn: 'Instantly generate 13 standard architectural BIM layers/tags with designated ACI color codes, quick layer isolation toggles, and auto-tagging for untagged geometry.',
    purposeBn: 'স্কেচআপে বিল্ডিং মডেলিংয়ের সময় লেয়ার বা ট্যাগ ছাড়া কাজ করলে ফাইল এলোমেলো হয়ে যায়। দেয়াল লুকানো, দরজা-জানালা ফিল্টার করা বা ছাদ সরিয়ে ভেতরের রুম দেখা অসম্ভব হয়ে পড়ে। EVL-BuildingLayers প্লাগইনটি আন্তর্জাতিক বিআইএম ও এআইএ স্ট্যান্ডার্ড অনুযায়ী এক ক্লিকে সাইট, কলাম, বিম, বহিরাগত ও অভ্যন্তরীণ দেয়াল, স্ল্যাব, দরজা, জানালা, সিঁড়ি, ছাদ ও প্লাম্বিংয়ের জন্য ১৩টি সুবিন্যস্ত ট্যাগ কালার সহ তৈরি করে দেয়।',
    purposeEn: 'Modeling without a disciplined tag structure in SketchUp causes chaotic files where isolating walls, hiding roofs to inspect interiors, or managing IFC exports becomes nearly impossible. EVL-BuildingLayers sets up a pristine 13-tag architectural hierarchy adhering to international BIM conventions in 1 click, with dedicated color codes, live isolation controls, and automatic tag assignment.',
    highlightsBn: [
      '১৩টি স্ট্যান্ডার্ড লেয়ার: 00_SITE, 01_COLUMNS_BEAMS, 02_WALLS_EXT, 03_WALLS_INT, 04_SLABS, 05_DOORS, 06_WINDOWS, 07_STAIRS, 08_ROOF, 09_BALCONY, 10_MEP, 11_FURNITURE, 12_BOUNDARY',
      'প্রি-ডিফাইন্ড কালার কোডিং: প্রতিটি ট্যাগের জন্য আলাদা প্রফেশনাল কালার কোড সেট করা থাকে',
      'কুইক আইসোলেশন ফিল্টার: ১-ক্লিকে শুধু দেয়াল, শুধু কলাম-বিম অথবা শুধু ওপেনিংস দৃশ্যমান রাখা যায়',
      'অটো-ট্যাগ অ্যাসাইনমেন্ট: মডেলের আনট্যাগড (Layer0) অবজেক্টকে নাম অনুযায়ী সঠিক ট্যাগে যুক্ত করা',
      'HTML ডক ডায়ালগ: ব্রাউজার-স্টাইল ইন্টারেক্টিভ পপআপ উইন্ডো ও লাইভ টগল সুইচ',
    ],
    highlightsEn: [
      '13 Standard BIM Tags: 00_SITE, 01_COLUMNS_BEAMS, 02_WALLS_EXT, 03_WALLS_INT, 04_SLABS, 05_DOORS, 06_WINDOWS, 07_STAIRS, 08_ROOF, 09_BALCONY, 10_MEP, 11_FURNITURE, 12_BOUNDARY',
      'Pre-configured Color Standards: Distinct chromatic palette for each architectural discipline',
      'Instant Discipline Isolation: 1-click toggles to show only Structure, Walls, or Openings',
      'Smart Tag Assigner: Scans model and auto-assigns Layer0 groups based on object taxonomy',
      'Floating HTML Dialog: Interactive web UI with real-time layer stats and visibility controls',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-BuildingLayers.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-BuildingLayers.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে .rbz ফাইলটি সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-BuildingLayers.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'SketchUp-এ এক্সটেনশন ইনস্টল করুন',
        titleEn: 'Install Extension in SketchUp',
        instructionBn: 'SketchUp খুলে Extensions > Extension Manager > Install Extension বাটনে ক্লিক করে ফাইলটি সিলেক্ট করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension and select the file.',
      },
      {
        stepNumber: 3,
        titleBn: 'লেয়ার ম্যানেজার চালান',
        titleEn: 'Launch Layer Manager',
        instructionBn: 'Extensions > EVLab Tools > EVLab Building Layers মেনুতে ক্লিক করে লেয়ার তৈরি করুন।',
        instructionEn: 'Navigate to Extensions > EVLab Tools > EVLab Building Layers.',
      },
    ],
    quickCommand: 'EVL-TAGS',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Building Layers & Tag Manager for Trimble SketchUp
# Menu: Extensions > EVLab Tools > EVLab Building Layers
# =========================================================================
require 'sketchup.rb'

module EVLab
  module BuildingLayers
    STANDARD_TAGS = [
      { name: '00_SITE_SURVEY',       color: [128, 128, 128], desc: 'Site boundaries, contours & survey grid' },
      { name: '01_COLUMNS_BEAMS',     color: [185, 28, 28],   desc: 'RCC structural frame, columns & tie beams' },
      { name: '02_WALLS_EXTERIOR',    color: [29, 78, 216],   desc: '10 inch (250mm) exterior perimeter walls' },
      { name: '03_WALLS_INTERIOR',    color: [2, 132, 199],   desc: '5 inch (125mm) interior partition walls' },
      { name: '04_SLABS_CEILING',     color: [217, 119, 6],   desc: 'RCC floor slabs, sunken slabs & false ceilings' },
      { name: '05_DOORS',             color: [147, 51, 234],  desc: 'Chowkath frames, timber shutters & hardware' },
      { name: '06_WINDOWS_GRILLS',    color: [6, 182, 212],   desc: 'Sliding/casement windows, glass & safety grills' },
      { name: '07_STAIRS_RAILING',    color: [225, 29, 72],   desc: 'Dog-legged stairs, risers, treads & SS balustrades' },
      { name: '08_ROOF_PARAPET',      color: [101, 163, 13],  desc: 'Roof terrace, 3ft parapet wall & water tank' },
      { name: '09_BALCONY_CANOPY',    color: [5, 150, 105],   desc: 'Cantilever balconies, sunshades & drop fascias' },
      { name: '10_PLUMBING_MEP',      color: [37, 99, 235],   desc: 'Water supply, drainage pipes & sanitary fixtures' },
      { name: '11_FURNITURE_FIXTURES',color: [217, 70, 239],  desc: 'Interior layout furniture, kitchen cabinets' },
      { name: '12_BOUNDARY_SITE',     color: [120, 113, 108], desc: 'Perimeter boundary wall, driveway gates' }
    ]

    # Helper function available to other tools
    def self.get_or_create_layer(layer_name)
      model = Sketchup.active_model
      layers = model.layers
      layer = layers[layer_name]
      unless layer
        layer = layers.add(layer_name)
        # Find matching tag config
        tag_cfg = STANDARD_TAGS.find { |t| t[:name] == layer_name }
        if tag_cfg && layer.respond_to?(:color=)
          layer.color = Sketchup::Color.new(tag_cfg[:color][0], tag_cfg[:color][1], tag_cfg[:color][2])
        end
      end
      layer
    end

    def self.assign_to_layer(entity, layer_name)
      layer = get_or_create_layer(layer_name)
      entity.layer = layer if entity.respond_to?(:layer=)
    end

    def self.create_all_tags
      model = Sketchup.active_model
      model.start_operation("EVLab Create Building Tags", true)
      layers = model.layers
      created_count = 0

      STANDARD_TAGS.each do |tag|
        unless layers[tag[:name]]
          l = layers.add(tag[:name])
          l.color = Sketchup::Color.new(tag[:color][0], tag[:color][1], tag[:color][2]) if l.respond_to?(:color=)
          created_count += 1
        end
      end

      model.commit_operation
      UI.messagebox("EVLab Building Layers:\\nSuccessfully created/verified 13 Standard Architectural Tags!\\nNew tags added: #{created_count}")
    end

    def self.isolate_discipline(disc_key)
      model = Sketchup.active_model
      layers = model.layers
      model.start_operation("EVLab Isolate Tags", true)

      STANDARD_TAGS.each do |tag|
        l = layers[tag[:name]]
        next unless l
        case disc_key
        when 'all'
          l.visible = true
        when 'structure'
          l.visible = ['01_COLUMNS_BEAMS', '04_SLABS_CEILING', '07_STAIRS_RAILING'].include?(tag[:name])
        when 'walls'
          l.visible = ['02_WALLS_EXTERIOR', '03_WALLS_INTERIOR', '08_ROOF_PARAPET'].include?(tag[:name])
        when 'openings'
          l.visible = ['05_DOORS', '06_WINDOWS_GRILLS'].include?(tag[:name])
        when 'interior'
          l.visible = ['03_WALLS_INTERIOR', '05_DOORS', '11_FURNITURE_FIXTURES'].include?(tag[:name])
        when 'site'
          l.visible = ['00_SITE_SURVEY', '12_BOUNDARY_SITE'].include?(tag[:name])
        end
      end

      model.commit_operation
    end

    def self.auto_tag_selection
      model = Sketchup.active_model
      sel = model.selection
      if sel.empty?
        UI.messagebox("Please select building groups/components to auto-tag.")
        return
      end

      model.start_operation("EVLab Auto-Tag Entities", true)
      tagged = 0

      sel.each do |ent|
        next unless ent.is_a?(Sketchup::Group) || ent.is_a?(Sketchup::ComponentInstance)
        name = (ent.name || ent.definition.name).downcase
        target_layer = nil

        if name.include?('col') || name.include?('pillar') || name.include?('beam')
          target_layer = '01_COLUMNS_BEAMS'
        elsif name.include?('ext') || name.include?('facade') || name.include?('outer')
          target_layer = '02_WALLS_EXTERIOR'
        elsif name.include?('int') || name.include?('partition') || name.include?('room')
          target_layer = '03_WALLS_INTERIOR'
        elsif name.include?('slab') || name.include?('floor') || name.include?('ceiling')
          target_layer = '04_SLABS_CEILING'
        elsif name.include?('door') || name.include?('chowkath') || name.include?('shutter')
          target_layer = '05_DOORS'
        elsif name.include?('win') || name.include?('grill') || name.include?('glass')
          target_layer = '06_WINDOWS_GRILLS'
        elsif name.include?('stair') || name.include?('step') || name.include?('rail')
          target_layer = '07_STAIRS_RAILING'
        elsif name.include?('roof') || name.include?('parapet') || name.include?('tank')
          target_layer = '08_ROOF_PARAPET'
        elsif name.include?('balcony') || name.include?('verandah') || name.include?('chajja')
          target_layer = '09_BALCONY_CANOPY'
        elsif name.include?('bound') || name.include?('gate') || name.include?('fence')
          target_layer = '12_BOUNDARY_SITE'
        else
          target_layer = '02_WALLS_EXTERIOR'
        end

        assign_to_layer(ent, target_layer)
        tagged += 1
      end

      model.commit_operation
      UI.messagebox("Successfully organized #{tagged} building entities into standard tags!")
    end

    def self.show_dialog
      html = <<-HTML
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { margin: 0; padding: 14px; background: #0b1120; color: #f1f5f9; font-size: 12px; }
          h2 { margin: 0 0 10px; color: #38bdf8; font-size: 15px; display: flex; align-items: center; gap: 8px; }
          .badge { background: #0369a1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
          .btn { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 8px; border-radius: 6px; cursor: pointer; text-align: left; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
          .btn:hover { background: #0284c7; border-color: #38bdf8; color: white; }
          .btn-primary { background: linear-gradient(135deg, #0284c7, #2563eb); border: none; color: white; padding: 10px; font-weight: bold; border-radius: 6px; width: 100%; cursor: pointer; margin-bottom: 10px; text-align: center; }
          .btn-primary:hover { opacity: 0.9; }
          .tag-list { background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; max-height: 180px; overflow-y: auto; }
          .tag-item { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 4px; font-size: 11px; }
          .tag-item:nth-child(even) { background: #131d33; }
          .color-dot { width: 10px; height: 10px; border-radius: 50%; }
        </style>
      </head>
      <body>
        <h2>🏷️ EVL-BuildingLayers <span class="badge">BIM Standard</span></h2>
        <button class="btn-primary" onclick="sketchup.create_tags()">⚡ ১-ক্লিকে ১৩টি বিল্ডিং ট্যাগ তৈরি করুন (Create 13 Tags)</button>

        <div style="font-weight:bold; margin-bottom: 6px; color: #94a3b8;">👁️ আইসোলেশন ও ফিল্টার (Discipline Isolator):</div>
        <div class="grid">
          <button class="btn" onclick="sketchup.isolate('all')"><span>🌐 সব ট্যাগ অন (Show All)</span></button>
          <button class="btn" onclick="sketchup.isolate('structure')"><span>🏗️ শুধু স্ট্রাকচার (Columns/Slabs)</span></button>
          <button class="btn" onclick="sketchup.isolate('walls')"><span>🧱 শুধু দেয়াল (Walls Only)</span></button>
          <button class="btn" onclick="sketchup.isolate('openings')"><span>🚪 শুধু দরজা/জানালা (Openings)</span></button>
          <button class="btn" onclick="sketchup.isolate('interior')"><span>🛋️ ইন্টেরিয়র (Interior Layout)</span></button>
          <button class="btn" onclick="sketchup.isolate('site')"><span>🌳 সাইট ও বাউন্ডারি (Site Works)</span></button>
        </div>

        <button class="btn" style="width:100%; margin-bottom: 10px; justify-content:center;" onclick="sketchup.auto_tag()">
          🎯 সিলেক্ট করা অবজেক্ট অটো-ট্যাগ করুন (Auto-Tag Selection)
        </button>

        <div style="font-weight:bold; margin-bottom: 6px; color: #94a3b8;">📋 অন্তর্ভুক্ত ১৩টি স্ট্যান্ডার্ড ট্যাগ:</div>
        <div class="tag-list">
          <div class="tag-item"><span class="color-dot" style="background:#808080"></span><b>00_SITE_SURVEY</b> - জমি ও সার্ভে</div>
          <div class="tag-item"><span class="color-dot" style="background:#B91C1C"></span><b>01_COLUMNS_BEAMS</b> - আরসিসি কলাম ও বিম</div>
          <div class="tag-item"><span class="color-dot" style="background:#1D4ED8"></span><b>02_WALLS_EXTERIOR</b> - ১০" বহিরাগত দেয়াল</div>
          <div class="tag-item"><span class="color-dot" style="background:#0284C7"></span><b>03_WALLS_INTERIOR</b> - ৫" অভ্যন্তরীণ দেয়াল</div>
          <div class="tag-item"><span class="color-dot" style="background:#D97706"></span><b>04_SLABS_CEILING</b> - ফ্লোর স্ল্যাব ও সিলিং</div>
          <div class="tag-item"><span class="color-dot" style="background:#9333EA"></span><b>05_DOORS</b> - কাঠের চৌকাঠ ও পাল্লা</div>
          <div class="tag-item"><span class="color-dot" style="background:#06B6D4"></span><b>06_WINDOWS_GRILLS</b> - স্লাইডিং জানালা ও গ্রিল</div>
          <div class="tag-item"><span class="color-dot" style="background:#E11D48"></span><b>07_STAIRS_RAILING</b> - আরসিসি সিঁড়ি ও রেলিং</div>
          <div class="tag-item"><span class="color-dot" style="background:#65A30D"></span><b>08_ROOF_PARAPET</b> - ছাদ, প্যারাপেট ও পানির ট্যাঙ্ক</div>
          <div class="tag-item"><span class="color-dot" style="background:#059669"></span><b>09_BALCONY_CANOPY</b> - বারান্দা ও সানশেড</div>
          <div class="tag-item"><span class="color-dot" style="background:#2563EB"></span><b>10_PLUMBING_MEP</b> - প্লাম্বিং পাইপলাইন</div>
          <div class="tag-item"><span class="color-dot" style="background:#D946EF"></span><b>11_FURNITURE_FIXTURES</b> - ফার্নিচার ও ফিটিংস</div>
          <div class="tag-item"><span class="color-dot" style="background:#78716C"></span><b>12_BOUNDARY_SITE</b> - বাউন্ডারি দেয়াল ও গেট</div>
        </div>
      </body>
      </html>
      HTML

      dlg = UI::HtmlDialog.new({
        :dialog_title => "🏷️ EVL-BuildingLayers & Tag Manager",
        :preferences_key => "com.evlab.building.layers",
        :scrollable => true,
        :resizable => true,
        :width => 440,
        :height => 520
      })
      dlg.set_html(html)
      dlg.add_action_callback("create_tags") { |_, _| self.create_all_tags }
      dlg.add_action_callback("isolate") { |_, k| self.isolate_discipline(k) }
      dlg.add_action_callback("auto_tag") { |_, _| self.auto_tag_selection }
      dlg.show
    end
  end
end

# -------------------------------------------------------------------------
# Shared EVLab Building 3D Toolbar & Menu Registry
# -------------------------------------------------------------------------
module EVLab
  module Building3D
    module Registry
      @tools ||= {}
      @toolbar ||= nil
      @menu ||= nil
      @added_to_toolbar ||= {}
      @added_to_menu ||= {}
      @toolbar_shown ||= false

      TOOLBAR_NAME = "EVLab Building 3D"
      MENU_NAME = "EVLab Building 3D"

      ORDER = [
        :layers, :facemaker, :col_beam, :wall, :slab,
        :door, :window, :grill, :stair, :railing,
        :roof, :boundary, :gate, :bim, :boq
      ]

      TOOL_METADATA = {
        :layers    => { name: "EVL-Layers",     tooltip: "EVL-Layers: 1-Click 13 BIM Tags/Layers & Isolator", icon: "layers" },
        :facemaker => { name: "FaceMaker",      tooltip: "FaceMaker: Heal CAD 2D Wireframes to Solid Front Faces", icon: "facemaker" },
        :col_beam  => { name: "Col & Beam",     tooltip: "Col & Beam: RCC Columns & Tie Beams Framework", icon: "col_beam" },
        :wall      => { name: "Wall 5\\"/10\\"",  tooltip: "Wall 5\\"/10\\": Parametric 3D Walls from Faces or Centerlines", icon: "wall" },
        :slab      => { name: "Slab & Floor",   tooltip: "Slab & Floor: Floor Slabs, Sunken Drops & Balconies", icon: "slab" },
        :door      => { name: "Door Pro",       tooltip: "Door Pro: 10 Architectural Doors with Chowkat Rebate", icon: "door" },
        :window    => { name: "Window Pro",     tooltip: "Window Pro: 10 Sliding & Casement Windows with Glass", icon: "window" },
        :grill     => { name: "Grill Pro",      tooltip: "Grill Pro: 10 Ornamental Window & Verandah Safety Grills", icon: "grill" },
        :stair     => { name: "Stair Pro",      tooltip: "Stair Pro: RCC Dog-Legged & Straight Stairs with Landing", icon: "stair" },
        :railing   => { name: "Railing Pro",    tooltip: "Railing Pro: 10 Glass, Cable, SS & Timber Railing Styles", icon: "railing" },
        :roof      => { name: "Roof & Tank",    tooltip: "Roof & Tank: Terrace Slab, 3ft Parapet, Coping & Water Tank", icon: "roof" },
        :boundary  => { name: "Boundary",       tooltip: "Boundary: 10 Perimeter Masonry Walls & Pillars", icon: "boundary" },
        :gate      => { name: "Driveway Gate",  tooltip: "Driveway Gate: 10 Sliding, Swing & CNC Driveway Gates", icon: "gate" },
        :bim       => { name: "BIM Modeler",    tooltip: "BIM Modeler: Revit-Style Levels, Grids & Hosted Openings", icon: "bim" },
        :boq       => { name: "BOQ Estimator",  tooltip: "BOQ Estimator: 1-Click Quantity Takeoff & Material Costing", icon: "boq" }
      }

      def self.register_tool(key, options = {}, &action)
        return if @tools[key] && !options[:force_reload]
        meta = TOOL_METADATA[key] || {}
        @tools[key] = {
          key: key,
          name: options[:name] || meta[:name] || key.to_s.capitalize,
          tooltip: options[:tooltip] || meta[:tooltip] || options[:name],
          status_bar: options[:status_bar] || options[:tooltip] || meta[:tooltip],
          icon_base: options[:icon_base] || meta[:icon] || key.to_s,
          action: action
        }
        rebuild_ui
      end

      def self.rebuild_ui
        @toolbar ||= UI::Toolbar.new(TOOLBAR_NAME)
        @menu ||= UI.menu('Extensions').add_submenu(MENU_NAME)

        ORDER.each do |key|
          tool = @tools[key]
          next unless tool
          next if @added_to_toolbar[key]

          cmd = UI::Command.new(tool[:name]) { tool[:action].call }
          cmd.tooltip = tool[:tooltip]
          cmd.status_bar_text = tool[:status_bar]

          icon_key = tool[:icon_base]
          candidates = [
            File.join(File.dirname(__FILE__), 'icons', "#{icon_key}.svg"),
            File.join(File.dirname(__FILE__), 'icons', "#{icon_key}.png"),
            File.join(File.dirname(__FILE__), '..', 'icons', "#{icon_key}.svg")
          ]
          icon_file = candidates.find { |p| File.exist?(p) }
          if icon_file
            cmd.small_icon = icon_file
            cmd.large_icon = icon_file
          end

          @toolbar.add_item(cmd)
          @added_to_toolbar[key] = true

          unless @added_to_menu[key]
            @menu.add_item(cmd)
            @added_to_menu[key] = true
          end
        end

        if @toolbar.count > 0 && !@toolbar_shown
          @toolbar.show
          @toolbar.restore
          @toolbar_shown = true
        end
      end
    end
  end
end unless defined?(EVLab::Building3D::Registry)

unless file_loaded?(__FILE__)
  EVLab::Building3D::Registry.register_tool(:layers, name: "EVL-Layers", tooltip: "EVL-Layers: 1-Click 13 BIM Tags/Layers & Isolator", icon_base: "layers") {
    EVLab::BuildingLayers.show_dialog
  }
  file_loaded(__FILE__)
end
`,
  },

  // =========================================================================
  // 2. EVL-WallBuilder (Parametric 3D Wall Generator & Auto-Puncher)
  // =========================================================================
  {
    id: 'sketchup-evl-wall-builder',
    nameEn: 'EVL-WallBuilder: Parametric 3D Wall Extruder, Lintel & Opening Maker',
    nameBn: 'EVL-WallBuilder: ২ডি লাইন/প্ল্যান থেকে ৩ডি দেয়াল, লিন্টেল ও ওপেনিং মেকার',
    softwareId: 'sketchup',
    version: 'v2.1.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-WallBuilder.rbz',
    fileSize: '16.8 KB',
    categoryBn: 'আর্কিটেকচারাল দেয়াল ও থ্রিডি এক্সট্রুশন',
    categoryEn: 'Architectural Walls & 3D Extrusion',
    shortSummaryBn: '২ডি অটোক্যাড লাইন বা ফেস সিলেক্ট করে ৫" বা ১০" দেয়াল ১০ ফুট উচ্চতায় এক ক্লিকে তুলুন, ৭ ফুট লিন্টেল ও সিল হাইটে স্বয়ংক্রিয় ওপেনিং কাটুন।',
    shortSummaryEn: 'Select 2D lines or floorplan faces to extrude 5" or 10" brick walls up to 10ft ceiling height, with automated 7ft lintels and window sill punches into dedicated layers.',
    purposeBn: 'অটোক্যাড থেকে আনা ফ্লোরপ্ল্যানে লাইন টেনে অফসেট করে করে দেয়াল তোলা এবং জানালা-দরজার জন্য ওয়াল কাটতে ঘণ্টার পর ঘণ্টা সময় অপচয় হয়। EVL-WallBuilder প্লাগইনটি ৫ ইঞ্চি পার্টিশন ওয়াল এবং ১০ ইঞ্চি মূল বহিরাগত দেয়াল স্বয়ংক্রিয়ভাবে পুশ-পুল করে দেয়। এটি নিজে থেকে লিন্টেল ও ড্রপওয়াল বজায় রেখে জানালা ও দরজার ফাঁকা জায়গা তৈরি করে এবং দেয়ালগুলোকে সরাসরি 02_WALLS_EXTERIOR ও 03_WALLS_INTERIOR লেয়ারে পুট করে।',
    purposeEn: 'Manually offsetting lines, push-pulling wall faces, and carving opening voids for every window and door takes tedious hours in SketchUp. EVL-WallBuilder automates this with 1-click wall extrusions from 2D profiles, supports 5" interior and 10" exterior masonry thicknesses, leaves parametric 7ft lintels and 2.5ft sills intact, and places finished solids onto the standard BIM wall tags.',
    highlightsBn: [
      '৫" ও ১০" দেয়াল প্রিসেট: স্ট্যান্ডার্ড বাংলাদেশি ৫ ইঞ্চি পার্টিশন এবং ১০ ইঞ্চি মেইন ওয়াল সাপোর্ট',
      'কাস্টম উচ্চতা নির্ধারণ: ১০ ফুট সিলিং হাইট, ৭ ফুট লিন্টেল বিম ও ২.৫ ফুট উইন্ডো সিল',
      'অটো লেয়ার অ্যাসাইনমেন্ট: বহিরাগত দেয়াল 02_WALLS_EXTERIOR এবং অভ্যন্তরীণ দেয়াল 03_WALLS_INTERIOR এ চলে যায়',
      'স্মার্ট ২-পয়েন্ট ও ফেস মোড: লাইন নির্বাচন করে অথবা সরাসরি ফেস সিলেক্ট করে দেয়াল এক্সট্রুশন',
      'সলিড গ্রুপ আউটপুট: পরবর্তী সময়ে দরজা-জানালা কাটিংয়ের জন্য ক্লিন ৩ডি সলিড জ্যামিতি প্রস্তুত থাকে',
    ],
    highlightsEn: [
      '5" and 10" Wall Presets: Native support for standard brick partition and exterior wall specs',
      'Parametric Heights: 10ft ceiling clearance, 7ft lintel beams, and 2.5ft window sill cutouts',
      'Automated Tag Placement: Direct assignment to 02_WALLS_EXTERIOR and 03_WALLS_INTERIOR tags',
      'Dual Operation Modes: Extrude directly from closed 2D faces or trace centerlines/edges',
      'Clean Solid Manifold: Geometry created as clean manifold solids ready for boolean punches',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-WallBuilder.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-WallBuilder.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-WallBuilder.rbz সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-WallBuilder.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager থেকে ইনস্টল',
        titleEn: 'Install via Extension Manager',
        instructionBn: 'Extensions > Extension Manager > Install Extension থেকে ফাইলটি নির্বাচন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'দেয়াল তৈরি শুরু করুন',
        titleEn: 'Start Building Walls',
        instructionBn: 'Extensions > EVLab Tools > EVLab Wall Builder নির্বাচন করে দেয়াল এক্সট্রুড করুন।',
        instructionEn: 'Launch from Extensions > EVLab Tools > EVLab Wall Builder.',
      },
    ],
    quickCommand: 'EVL-WALL',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Wall Builder - Parametric 3D Wall Generator for Trimble SketchUp
# Menu: Extensions > EVLab Tools > EVLab Wall Builder
# Command: EVL-WALL | Console: evl_wall
# Compatibility: Trimble SketchUp 2019 - 2026
# =========================================================================
require 'sketchup.rb'

module EVLab
  module WallBuilder
    # Development & Debug logging
    def self.log(msg)
      puts "[EVL-WallBuilder] #{msg}"
    end

    # Robust length parsing supporting native SketchUp units, ft/in strings, and metric
    def self.parse_length(val_str, default_inches, default_unit = :inch)
      return default_inches.to_f if val_str.nil?
      s = val_str.to_s.strip
      return default_inches.to_f if s.empty?

      # Normalize quotes
      s = s.tr("”’", "\\\"'")

      # 1. Try SketchUp native String#to_l
      begin
        return s.to_l.to_f
      rescue => _e
        # Fall back to custom regex parsing
      end

      # 2. Regex for 9'-6" or 9' 6"
      if s =~ /(\\d+)\\s*['’]\\s*(\\d+(?:\\.\\d+)?)\\s*["”]?/
        return ($1.to_f * 12.0) + $2.to_f
      elsif s =~ /(\\d+(?:\\.\\d+)?)\\s*['’]/
        return $1.to_f * 12.0
      elsif s =~ /(\\d+(?:\\.\\d+)?)\\s*["”]?$/
        num = $1.to_f
        return (default_unit == :feet) ? (num * 12.0) : num
      elsif s =~ /(\\d+(?:\\.\\d+)?)\\s*mm/i
        return $1.to_f / 25.4
      elsif s =~ /(\\d+(?:\\.\\d+)?)\\s*cm/i
        return $1.to_f / 2.54
      elsif s =~ /(\\d+(?:\\.\\d+)?)\\s*m/i
        return $1.to_f * 39.3701
      end

      default_inches.to_f
    end

    # Tag/Layer Helper - Reuses existing Tag if present, creates if missing
    def self.get_or_create_tag(model, tag_name, color_rgb)
      layers = model.layers
      tag = layers[tag_name]
      unless tag
        tag = layers.add(tag_name)
        if tag.respond_to?(:color=) && color_rgb
          tag.color = Sketchup::Color.new(color_rgb[0], color_rgb[1], color_rgb[2])
        end
      end
      tag
    end

    # =========================================================================
    # 1. FACE MODE: Clean extrusion of valid selected faces with holes/voids
    # =========================================================================
    def self.build_from_faces(valid_faces, gents, height_in)
      created_count = 0

      valid_faces.each do |f|
        next unless f.valid?
        next if f.area < 0.01

        # Collect loops: outer loop first
        outer_pts = f.outer_loop.vertices.map { |v| Geom::Point3d.new(v.position.x, v.position.y, v.position.z) }
        next if outer_pts.length < 3

        # Add outer face into group entities
        new_face = gents.add_face(outer_pts)
        next unless new_face

        # Add inner loops if any to cut holes/voids
        if f.loops.length > 1
          f.loops.each do |loop|
            next if loop == f.outer_loop
            inner_pts = loop.vertices.map { |v| Geom::Point3d.new(v.position.x, v.position.y, v.position.z) }
            next if inner_pts.length < 3
            inner_f = gents.add_face(inner_pts)
            inner_f.erase! if inner_f && inner_f.valid?
          end
        end

        # Ensure correct vertical orientation
        current_faces = gents.grep(Sketchup::Face).select { |gf| gf.valid? && gf.normal.z.abs > 0.85 }
        current_faces.each do |wf|
          next unless wf.valid?
          wf.reverse! if wf.normal.z < 0
          wf.pushpull(height_in)
          created_count += 1
        end
      end

      created_count
    end

    # =========================================================================
    # 2. CENTERLINE MODE: Continuous wall graph, mitered corners & L/T healing
    # =========================================================================
    def self.build_from_centerlines(valid_edges, gents, thick_in, height_in)
      half_w = thick_in / 2.0
      log("Processing #{valid_edges.length} centerline edges with thickness #{thick_in}\\\"")

      # 1. Clean & Deduplicate edges in 2D
      segments = []
      valid_edges.each do |e|
        p1 = e.start.position
        p2 = e.end.position
        # Horizontal projection
        p1_2d = Geom::Point3d.new(p1.x, p1.y, p1.z)
        p2_2d = Geom::Point3d.new(p2.x, p2.y, p1.z)
        len = p1_2d.distance(p2_2d)
        next if len < 0.1 # Skip tiny CAD artifacts

        # Ensure consistent orientation for deduplication
        if (p1_2d.x > p2_2d.x) || ((p1_2d.x - p2_2d.x).abs < 0.001 && p1_2d.y > p2_2d.y)
          p1_2d, p2_2d = p2_2d, p1_2d
        end

        # Check duplicate
        is_dup = segments.any? do |s|
          (s[:p1].distance(p1_2d) < 0.01 && s[:p2].distance(p2_2d) < 0.01)
        end
        next if is_dup

        vec = p2_2d - p1_2d
        unit_vec = vec.normalize
        # True perpendicular in XY plane: (-dy, dx, 0)
        perp = Geom::Vector3d.new(-unit_vec.y, unit_vec.x, 0).normalize

        segments << {
          p1: p1_2d,
          p2: p2_2d,
          vec: vec,
          u: unit_vec,
          perp: perp,
          len: len
        }
      end

      return 0 if segments.empty?

      # 2. Build 2D Ribbon Quads with extension for junctions
      segments.each do |seg|
        p1 = seg[:p1]
        p2 = seg[:p2]
        u = seg[:u]
        perp = seg[:perp]

        # Extend slightly at ends by half_w so that intersections at L & T corners overlap cleanly
        sp1 = p1 - (u * half_w)
        ep2 = p2 + (u * half_w)

        c1 = sp1 + (perp * half_w)
        c2 = ep2 + (perp * half_w)
        c3 = ep2 - (perp * half_w)
        c4 = sp1 - (perp * half_w)

        gents.add_face(c1, c2, c3, c4)
      end

      # 3. Corner & Intersection Healing: Dissolve internal seam edges!
      # Erasing edges shared by two coplanar wall faces joins them into a single continuous face
      cleaned = true
      passes = 0
      while cleaned && passes < 10
        cleaned = false
        passes += 1
        gents.grep(Sketchup::Edge).each do |ed|
          next unless ed.valid?
          if ed.faces.length == 2
            f1, f2 = ed.faces
            if f1.normal.parallel?(Z_AXIS) && f2.normal.parallel?(Z_AXIS)
              if f1.normal.dot(f2.normal) > 0.9
                ed.erase!
                cleaned = true
              end
            end
          end
        end
      end

      # 4. Pushpull all continuous unified wall faces
      wall_faces = gents.grep(Sketchup::Face).select { |f| f.valid? && f.normal.z.abs > 0.85 }
      return 0 if wall_faces.empty?

      created = 0
      wall_faces.each do |wf|
        next unless wf.valid?
        wf.reverse! if wf.normal.z < 0
        wf.pushpull(height_in)
        created += 1
      end

      created
    end

    # =========================================================================
    # 3. MAIN RUNNER: Validates selection, sets Tags, executes & protects plan
    # =========================================================================
    def self.generate_walls(thick_str, height_str, wall_type_str, mode_str)
      model = Sketchup.active_model
      sel = model.selection

      if sel.empty?
        UI.messagebox("EVL-WallBuilder:\\nNo valid geometry selected.\\nPlease select 2D floorplan faces or centerline lines first.\\n(আগে দেয়ালের ২ডি ফেস বা লাইন সিলেক্ট করুন।)")
        return
      end

      # Parse parameters
      thick_in = parse_length(thick_str, 5.0, :inch)
      height_in = parse_length(height_str, 120.0, :feet) # default 10 ft

      is_interior = wall_type_str.to_s.downcase.include?('interior')
      tag_name = is_interior ? '03_WALLS_INTERIOR' : '02_WALLS_EXTERIOR'
      tag_color = is_interior ? [2, 132, 199] : [29, 78, 216]

      # Adjust default thickness if exterior and set to 5"
      if !is_interior && (thick_str.to_s.strip == '5' || thick_str.to_s.strip == '5"')
        thick_in = 10.0
      end

      # Detect valid candidate geometry (ONLY horizontal planar faces & flat edges)
      raw_faces = sel.grep(Sketchup::Face)
      raw_edges = sel.grep(Sketchup::Edge)

      valid_faces = raw_faces.select do |f|
        f.normal.z.abs > 0.85 && f.area > 0.01
      end

      valid_edges = raw_edges.select do |e|
        (e.start.position.z - e.end.position.z).abs < 0.1 && e.length > 0.1
      end

      # Determine Mode
      chosen_mode = :auto
      if mode_str.to_s.include?('Face')
        chosen_mode = :face
      elsif mode_str.to_s.include?('Centerline')
        chosen_mode = :centerline
      else
        chosen_mode = valid_faces.any? ? :face : :centerline
      end

      if chosen_mode == :face && valid_faces.empty?
        UI.messagebox("EVL-WallBuilder:\\nNo valid wall face selected.\\n(সিলেকশনে কোনো বৈধ দেয়ালের ফেস পাওয়া যায়নি।)")
        return
      end

      if chosen_mode == :centerline && valid_edges.empty?
        UI.messagebox("EVL-WallBuilder:\\nNo valid centerline edges selected.\\n(সিলেকশনে কোনো বৈধ দেয়ালের লাইন পাওয়া যায়নি।)")
        return
      end

      # Start single undo operation
      model.start_operation("EVL-WallBuilder: Generate 3D Walls", true)

      begin
        # Ensure Tag exists
        target_tag = get_or_create_tag(model, tag_name, tag_color)

        # Create isolated container group - Original CAD plan remains 100% untouched!
        type_label = is_interior ? "Interior" : "Exterior"
        wall_group = model.active_entities.add_group
        wall_group.name = "EVL_Walls_#{type_label}_#{thick_in.round(1)}in"
        wall_group.layer = target_tag if wall_group.respond_to?(:layer=)

        gents = wall_group.entities
        created_count = 0

        if chosen_mode == :face
          created_count = build_from_faces(valid_faces, gents, height_in)
        else
          created_count = build_from_centerlines(valid_edges, gents, thick_in, height_in)
        end

        if created_count == 0 || gents.length == 0
          wall_group.erase! if wall_group.valid?
          model.abort_operation
          UI.messagebox("EVL-WallBuilder could not create the selected wall geometry.\\nPlease verify your 2D lines/faces are coplanar and form valid wall paths.")
          return
        end

        model.commit_operation

        height_ft_display = (height_in / 12.0).round(2)
        UI.messagebox(
          "EVL-WallBuilder Success!\\n" +
          "----------------------------------------\\n" +
          "Walls Generated: #{created_count}\\n" +
          "Wall Type: #{type_label} (#{thick_in.round(1)}\\\")\\n" +
          "Height: #{height_ft_display} ft (#{height_in.round(1)}\\\")\\n" +
          "Tag/Layer Assigned: #{tag_name}\\n" +
          "Mode: #{chosen_mode.to_s.capitalize}\\n" +
          "Original 2D Plan: Protected & Intact"
        )
      rescue => ex
        model.abort_operation
        log("ERROR: #{ex.message}\\n#{ex.backtrace.join("\\n")}")
        UI.messagebox("EVL-WallBuilder Error:\\n#{ex.message}\\n(See Ruby Console for technical details)")
      end
    end

    # Interactive UI Dialog
    def self.show_dialog
      html = <<-HTML
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { margin: 0; padding: 14px; background: #0f172a; color: #f8fafc; font-size: 12px; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px; }
          .title { font-weight: 800; font-size: 14px; color: #38bdf8; display: flex; align-items: center; gap: 6px; }
          .badge { background: #0369a1; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .layout { display: grid; grid-template-columns: 240px 1fr; gap: 12px; }
          .panel { background: #1e293b; border-radius: 8px; padding: 12px; border: 1px solid #334155; }
          label { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 3px; margin-top: 7px; }
          label:first-child { margin-top: 0; }
          .mode-btn-group { display: flex; gap: 4px; margin-bottom: 6px; }
          .mode-btn { flex: 1; padding: 5px 6px; background: #0f172a; border: 1px solid #334155; color: #94a3b8; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600; text-align: center; }
          .mode-btn.active { background: #0284c7; color: white; border-color: #38bdf8; }
          select, input { width: 100%; background: #0f172a; border: 1px solid #475569; color: white; padding: 5px 7px; border-radius: 5px; font-size: 12px; }
          select:focus, input:focus { border-color: #38bdf8; outline: none; }
          .checkbox-group { margin-top: 8px; background: #0f172a; padding: 6px 8px; border-radius: 5px; border: 1px solid #334155; }
          .check-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #cbd5e1; margin-bottom: 3px; }
          .check-item:last-child { margin-bottom: 0; }
          .check-item label { margin: 0; text-transform: none; color: #cbd5e1; font-weight: normal; font-size: 11px; cursor: pointer; }
          .preview-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1e293b 0%, #090d16 100%); border-radius: 8px; border: 1px solid #334155; padding: 12px; min-height: 250px; position: relative; }
          .preview-title { position: absolute; top: 8px; left: 10px; font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .specs-badge { position: absolute; bottom: 8px; right: 10px; background: rgba(15,23,42,0.85); border: 1px solid #334155; padding: 3px 6px; border-radius: 4px; font-size: 10px; color: #38bdf8; }
          .btn-group { display: flex; gap: 6px; margin-top: 10px; }
          .btn-primary { flex: 2; background: linear-gradient(135deg, #0284c7, #2563eb); color: white; border: none; padding: 8px; border-radius: 5px; font-weight: 700; cursor: pointer; font-size: 12px; }
          .btn-primary:hover { background: linear-gradient(135deg, #0369a1, #1d4ed8); }
          .btn-secondary { flex: 1; background: #334155; color: #e2e8f0; border: none; padding: 8px; border-radius: 5px; font-weight: 600; cursor: pointer; font-size: 11px; text-align: center; }
          .btn-secondary:hover { background: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🧱 EVL-WallBuilder: Parametric 3D Walls</div>
          <span class="badge">Face & Centerline</span>
        </div>
        <div class="layout">
          <div class="panel">
            <label>Generation Mode</label>
            <div class="mode-btn-group">
              <div id="btnAuto" class="mode-btn active" onclick="setMode('auto')">Auto</div>
              <div id="btnFace" class="mode-btn" onclick="setMode('face')">Face</div>
              <div id="btnLine" class="mode-btn" onclick="setMode('centerline')">Centerline</div>
            </div>

            <label>Wall Type</label>
            <select id="wallType" onchange="onTypeChange()">
              <option value="ext" selected>Exterior 10" (02_WALLS_EXTERIOR)</option>
              <option value="int">Interior 5" (03_WALLS_INTERIOR)</option>
              <option value="custom">Custom Wall Type...</option>
            </select>

            <label>Thickness</label>
            <input type="text" id="wallThick" value="10\\"" oninput="updatePreview()">

            <label>Ceiling Height</label>
            <select id="wallHeight" onchange="onHeightChange()">
              <option value="10' 0\\"" selected>10'-0\\" (Standard Floor)</option>
              <option value="9' 6\\"">9'-6\\" (Residential)</option>
              <option value="9' 0\\"">9'-0\\" (Economy)</option>
              <option value="11' 0\\"">11'-0\\" (Commercial)</option>
              <option value="12' 0\\"">12'-0\\" (High Ceiling)</option>
              <option value="custom">Custom Height...</option>
            </select>
            <input type="text" id="customHeight" value="10' 0\\"" style="display:none; margin-top:3px;" oninput="updatePreview()">

            <div class="checkbox-group">
              <div class="check-item"><input type="checkbox" id="chkMerge" checked> <label for="chkMerge">Merge corners (Miter joins)</label></div>
              <div class="check-item"><input type="checkbox" id="chkClean" checked> <label for="chkClean">Clean CAD lines / Heal gaps</label></div>
              <div class="check-item"><input type="checkbox" id="chkGroup" checked> <label for="chkGroup">Create isolated group</label></div>
              <div class="check-item"><input type="checkbox" id="chkTag" checked> <label for="chkTag">Assign BIM Wall Tag</label></div>
            </div>

            <div class="btn-group">
              <button class="btn-secondary" onclick="updatePreview()">Preview</button>
              <button class="btn-primary" onclick="createWall()">Create Wall</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:4px;" onclick="sketchup.cancel()">Cancel</button>
          </div>

          <div class="preview-box">
            <span class="preview-title">Real-Time Section Preview</span>
            <div id="svgContainer" style="width: 100%; height: 210px; display: flex; align-items: center; justify-content: center;"></div>
            <div class="specs-badge" id="dimBadge">10" Wall • 10' 0" Height</div>
          </div>
        </div>

        <script>
          var currentMode = 'auto';

          function setMode(m) {
            currentMode = m;
            document.getElementById('btnAuto').className = 'mode-btn' + (m === 'auto' ? ' active' : '');
            document.getElementById('btnFace').className = 'mode-btn' + (m === 'face' ? ' active' : '');
            document.getElementById('btnLine').className = 'mode-btn' + (m === 'centerline' ? ' active' : '');
            updatePreview();
          }

          function onTypeChange() {
            var val = document.getElementById('wallType').value;
            if (val === 'ext') {
              document.getElementById('wallThick').value = '10\\"';
            } else if (val === 'int') {
              document.getElementById('wallThick').value = '5\\"';
            }
            updatePreview();
          }

          function onHeightChange() {
            var val = document.getElementById('wallHeight').value;
            var cInput = document.getElementById('customHeight');
            if (val === 'custom') {
              cInput.style.display = 'block';
            } else {
              cInput.style.display = 'none';
            }
            updatePreview();
          }

          function getEffectiveHeight() {
            var hSelect = document.getElementById('wallHeight').value;
            if (hSelect === 'custom') {
              return document.getElementById('customHeight').value;
            }
            return hSelect;
          }

          function updatePreview() {
            var thickStr = document.getElementById('wallThick').value || '10\\"';
            var heightStr = getEffectiveHeight();
            var isInt = document.getElementById('wallType').value === 'int' || thickStr.indexOf('5') !== -1;
            var wallColor = isInt ? '#0284c7' : '#1d4ed8';

            document.getElementById('dimBadge').innerText = thickStr + ' Wall • ' + heightStr + ' • ' + (isInt ? 'Interior' : 'Exterior');

            // Draw clean 2D/3D Isometric Wall Preview
            var svg = '<svg width="220" height="190" viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">';
            // Grid floor
            svg += '<path d="M20,150 L110,180 L200,150 L110,120 Z" fill="#0f172a" stroke="#334155" stroke-dasharray="2,2"/>';
            // Wall 3D Isometric Extrusion
            var wH = 90;
            var wThick = isInt ? 16 : 28;

            // Front face
            svg += '<polygon points="50,155 110,175 110,' + (175 - wH) + ' 50,' + (155 - wH) + '" fill="' + wallColor + '" stroke="#60a5fa" stroke-width="1.5"/>';
            // Side face
            svg += '<polygon points="110,175 110+' + wThick + ',170 110+' + wThick + ',' + (170 - wH) + ' 110,' + (175 - wH) + '" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>';
            // Top face
            svg += '<polygon points="50,' + (155 - wH) + ' 110,' + (175 - wH) + ' 110+' + wThick + ',' + (170 - wH) + ' 50+' + wThick + ',' + (150 - wH) + '" fill="#93c5fd" stroke="#60a5fa" stroke-width="1.5"/>';
            // Brick courses indication
            for (var bi = 1; bi <= 4; bi++) {
              var yC = 175 - bi * 18;
              svg += '<line x1="55" y1="' + (yC - 20) + '" x2="105" y2="' + yC + '" stroke="#93c5fd" stroke-opacity="0.3" stroke-width="1"/>';
            }
            // Height dimension arrow
            svg += '<line x1="36" y1="155" x2="36" y2="' + (155 - wH) + '" stroke="#38bdf8" stroke-width="1.5"/>';
            svg += '<polygon points="36,155 33,148 39,148" fill="#38bdf8"/>';
            svg += '<polygon points="36,' + (155 - wH) + ' 33,' + (162 - wH) + ' 39,' + (162 - wH) + '" fill="#38bdf8"/>';
            svg += '<text x="16" y="' + (155 - wH/2 + 4) + '" fill="#38bdf8" font-size="10" font-weight="bold">' + heightStr.split(' ')[0] + '</text>';

            svg += '</svg>';
            document.getElementById('svgContainer').innerHTML = svg;
          }

          function createWall() {
            var thick = document.getElementById('wallThick').value;
            var height = getEffectiveHeight();
            var typeVal = document.getElementById('wallType').value;
            var modeStr = currentMode === 'face' ? 'Face Mode (Selected Faces)' :
                          (currentMode === 'centerline' ? 'Centerline Mode (Selected Lines)' : 'Auto-Detect (Faces or Centerlines)');
            var typeStr = typeVal === 'int' ? 'Interior (5\\")' : 'Exterior (10\\")';
            sketchup.build_wall(thick, height, typeStr, modeStr);
          }

          window.onload = function() {
            updatePreview();
          };
        </script>
      </body>
      </html>
      HTML

      dlg = UI::HtmlDialog.new({
        :dialog_title => "🧱 EVL-WallBuilder: Parametric 3D Walls",
        :preferences_key => "com.evlab.wallbuilder.ui",
        :scrollable => false,
        :resizable => true,
        :width => 580,
        :height => 380,
        :min_width => 520,
        :min_height => 360
      })

      dlg.set_html(html)
      dlg.add_action_callback("build_wall") do |_, thick_val, height_val, type_val, mode_val|
        self.generate_walls(thick_val, height_val, type_val, mode_val)
      end
      dlg.add_action_callback("cancel") do |_, _|
        dlg.close
      end
      dlg.show
    end
  end
end

# -------------------------------------------------------------------------
# Shared EVLab Building 3D Toolbar & Menu Registry
# -------------------------------------------------------------------------
module EVLab
  module Building3D
    module Registry
      @tools ||= {}
      @toolbar ||= nil
      @menu ||= nil
      @added_to_toolbar ||= {}
      @added_to_menu ||= {}
      @toolbar_shown ||= false

      TOOLBAR_NAME = "EVLab Building 3D"
      MENU_NAME = "EVLab Building 3D"

      ORDER = [
        :layers, :facemaker, :col_beam, :wall, :slab,
        :door, :window, :grill, :stair, :railing,
        :roof, :boundary, :gate, :bim, :boq
      ]

      TOOL_METADATA = {
        :layers    => { name: "EVL-Layers",     tooltip: "EVL-Layers: 1-Click 13 BIM Tags/Layers & Isolator", icon: "layers" },
        :facemaker => { name: "FaceMaker",      tooltip: "FaceMaker: Heal CAD 2D Wireframes to Solid Front Faces", icon: "facemaker" },
        :col_beam  => { name: "Col & Beam",     tooltip: "Col & Beam: RCC Columns & Tie Beams Framework", icon: "col_beam" },
        :wall      => { name: "Wall 5\\"/10\\"",  tooltip: "Wall 5\\"/10\\": Parametric 3D Walls from Faces or Centerlines", icon: "wall" },
        :slab      => { name: "Slab & Floor",   tooltip: "Slab & Floor: Floor Slabs, Sunken Drops & Balconies", icon: "slab" },
        :door      => { name: "Door Pro",       tooltip: "Door Pro: 10 Architectural Doors with Chowkat Rebate", icon: "door" },
        :window    => { name: "Window Pro",     tooltip: "Window Pro: 10 Sliding & Casement Windows with Glass", icon: "window" },
        :grill     => { name: "Grill Pro",      tooltip: "Grill Pro: 10 Ornamental Window & Verandah Safety Grills", icon: "grill" },
        :stair     => { name: "Stair Pro",      tooltip: "Stair Pro: RCC Dog-Legged & Straight Stairs with Landing", icon: "stair" },
        :railing   => { name: "Railing Pro",    tooltip: "Railing Pro: 10 Glass, Cable, SS & Timber Railing Styles", icon: "railing" },
        :roof      => { name: "Roof & Tank",    tooltip: "Roof & Tank: Terrace Slab, 3ft Parapet, Coping & Water Tank", icon: "roof" },
        :boundary  => { name: "Boundary",       tooltip: "Boundary: 10 Perimeter Masonry Walls & Pillars", icon: "boundary" },
        :gate      => { name: "Driveway Gate",  tooltip: "Driveway Gate: 10 Sliding, Swing & CNC Driveway Gates", icon: "gate" },
        :bim       => { name: "BIM Modeler",    tooltip: "BIM Modeler: Revit-Style Levels, Grids & Hosted Openings", icon: "bim" },
        :boq       => { name: "BOQ Estimator",  tooltip: "BOQ Estimator: 1-Click Quantity Takeoff & Material Costing", icon: "boq" }
      }

      def self.register_tool(key, options = {}, &action)
        return if @tools[key] && !options[:force_reload]
        meta = TOOL_METADATA[key] || {}
        @tools[key] = {
          key: key,
          name: options[:name] || meta[:name] || key.to_s.capitalize,
          tooltip: options[:tooltip] || meta[:tooltip] || options[:name],
          status_bar: options[:status_bar] || options[:tooltip] || meta[:tooltip],
          icon_base: options[:icon_base] || meta[:icon] || key.to_s,
          action: action
        }
        rebuild_ui
      end

      def self.rebuild_ui
        @toolbar ||= UI::Toolbar.new(TOOLBAR_NAME)
        @menu ||= UI.menu('Extensions').add_submenu(MENU_NAME)

        ORDER.each do |key|
          tool = @tools[key]
          next unless tool
          next if @added_to_toolbar[key]

          cmd = UI::Command.new(tool[:name]) { tool[:action].call }
          cmd.tooltip = tool[:tooltip]
          cmd.status_bar_text = tool[:status_bar]

          icon_key = tool[:icon_base]
          candidates = [
            File.join(File.dirname(__FILE__), 'icons', "#{icon_key}.svg"),
            File.join(File.dirname(__FILE__), 'icons', "#{icon_key}.png"),
            File.join(File.dirname(__FILE__), '..', 'icons', "#{icon_key}.svg")
          ]
          icon_file = candidates.find { |p| File.exist?(p) }
          if icon_file
            cmd.small_icon = icon_file
            cmd.large_icon = icon_file
          end

          @toolbar.add_item(cmd)
          @added_to_toolbar[key] = true

          unless @added_to_menu[key]
            @menu.add_item(cmd)
            @added_to_menu[key] = true
          end
        end

        if @toolbar.count > 0 && !@toolbar_shown
          @toolbar.show
          @toolbar.restore
          @toolbar_shown = true
        end
      end
    end
  end
end unless defined?(EVLab::Building3D::Registry)

unless file_loaded?(__FILE__)
  EVLab::Building3D::Registry.register_tool(:wall, name: "Wall 5\\"/10\\"", tooltip: "Wall 5\\"/10\\": Parametric 3D Walls from Faces or Centerlines", icon_base: "wall") {
    EVLab::WallBuilder.show_dialog
  }
  file_loaded(__FILE__)
end

# Console aliases
def evl_wall
  EVLab::WallBuilder.show_dialog
end

def EVL_WALL
  EVLab::WallBuilder.show_dialog
end
`,
  },

  // =========================================================================
  // 3. EVL-StructuralFrame (Columns, Plinth & Roof Tie Beams Grid)
  // =========================================================================
  {
    id: 'sketchup-evl-structural-frame',
    nameEn: 'EVL-StructuralFrame: RCC Columns, Plinth & Roof Tie Beams Generator',
    nameBn: 'EVL-StructuralFrame: আরসিসি কলাম, প্লিন্থ ও ছাদের টাই বিম ফ্রেম জেনারেটর',
    softwareId: 'sketchup',
    version: 'v1.8.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-StructuralFrame.rbz',
    fileSize: '17.3 KB',
    categoryBn: 'স্ট্রাকচারাল ফ্রেম ও আরসিসি কলাম-বিম',
    categoryEn: 'Structural Frame & RCC Columns/Beams',
    shortSummaryBn: 'বিল্ডিংয়ের আর্কিটেকচারাল প্ল্যানে ১০"x১০", ১২"x১২", ১২"x১৮" বা ১৫"x২০" আরসিসি কলাম এবং প্লিন্থ ও ছাদের টাই বিম গ্রিড তৈরি করে 01_COLUMNS_BEAMS ট্যাগে যুক্ত করে।',
    shortSummaryEn: 'Generate reinforced concrete columns (10"x10", 12"x12", 12"x18", 15"x20") and plinth/roof tie beams across structural grid points onto 01_COLUMNS_BEAMS tag.',
    purposeBn: 'বিল্ডিং নির্মাণের মূল কাঠামো হলো আরসিসি কলাম ও বিমের ফ্রেমওয়ার্ক। স্কেচআপে প্রতিটি কলাম ম্যানুয়ালি ড্র করা, প্লেস করা এবং বিম টেনে জয়েন করা অত্যন্ত ক্লান্তিকর। এই টুলটি গ্রিড ইন্টারসেকশন বা পয়েন্ট ক্লিকে স্বয়ংক্রিয়ভাবে কলাম ও গ্রেড/টাই বিমের ফ্রেম কাঠামো সেকেন্ডে তৈরি করে দেয় এবং এটিকে আলাদা স্ট্রাকচারাল লেয়ারে অর্গানাইজ করে।',
    purposeEn: 'The primary load-bearing backbone of any building is its RCC column-beam skeletal frame. Modeling individual rectangular or circular columns and linking them with plinth/tie beams takes painstaking manual effort. EVL-StructuralFrame automates column placement at structural intersections, extrudes horizontal connecting beams, and encapsulates everything into the 01_COLUMNS_BEAMS tag.',
    highlightsBn: [
      'জনপ্রিয় কলাম সাইজ: ১০"x১০", ১২"x১২", ১২"x১৫", ১২"x১৮", ১৫"x২০" ও ১২" গোল কলাম',
      'টাই বিম অটো-লিংক: কলামগুলোর মধ্যবর্তী পয়েন্টে ১০"x১২" বা ১০"x১৫" আরসিসি বিম এক্সট্রুশন',
      'গ্রিড মোড ও ক্লিক মোড: ইন্টারসেকশন পয়েন্টে এক ক্লিকে সম্পূর্ণ ফ্লোরের কলাম ফ্রেম স্থাপন',
      'স্ট্রাকচারাল ট্যাগ: সবকিছু স্বয়ংক্রিয়ভাবে 01_COLUMNS_BEAMS ট্যাগে অন্তর্ভুক্ত হয়',
      'বিম ড্রপ ও স্ল্যাব অফসেট: স্ল্যাব থিকনেসের জন্য বিমের টপ লেভেল অটোমেটিক সমন্বয়',
    ],
    highlightsEn: [
      'Standard Column Dimensions: 10"x10", 12"x12", 12"x15", 12"x18", 15"x20", and 12" circular columns',
      'Auto-Connecting Tie Beams: Seamless extrusion of 10"x12" plinth and 10"x15" roof beams',
      'Grid & Coordinate Modes: Place columns across structural grid coordinates in 1 single execution',
      'Standard Tagged Output: Automatically nested within the 01_COLUMNS_BEAMS layer',
      'Slab Rebate Alignment: Beam tops accurately offset to accommodate structural floor slabs',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-StructuralFrame.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-StructuralFrame.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-StructuralFrame.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'SketchUp-এ ইনস্টল করুন',
        titleEn: 'Install in SketchUp',
        instructionBn: 'Extensions > Extension Manager > Install Extension থেকে ফাইলটি নির্বাচন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'কলাম ও বিম ফ্রেম তৈরি করুন',
        titleEn: 'Generate Frame',
        instructionBn: 'Extensions > EVLab Tools > EVLab Structural Frame মেনুতে ক্লিক করুন।',
        instructionEn: 'Run via Extensions > EVLab Tools > EVLab Structural Frame.',
      },
    ],
    quickCommand: 'EVL-FRAME',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Structural Frame - Columns & Beams Generator for Trimble SketchUp
# Menu: Extensions > EVLab Tools > EVLab Structural Frame
# =========================================================================
require 'sketchup.rb'

module EVLab
  module StructuralFrame
    def self.build_frame(col_w_in, col_d_in, col_h_ft, beam_w_in, beam_d_in, grid_x, grid_y, spacing_x_ft, spacing_y_ft)
      model = Sketchup.active_model
      model.start_operation("EVLab Generate Structural Frame", true)

      # Ensure tag exists
      tag_name = '01_COLUMNS_BEAMS'
      layers = model.layers
      target_layer = layers[tag_name] || layers.add(tag_name)
      target_layer.color = Sketchup::Color.new(185, 28, 28) if target_layer.respond_to?(:color=)

      frame_group = model.active_entities.add_group
      frame_group.name = "EVL_RCC_Structural_Frame"
      frame_group.layer = target_layer if frame_group.respond_to?(:layer=)
      gents = frame_group.entities

      cw = col_w_in.to_f
      cd = col_d_in.to_f
      ch = col_h_ft.to_f * 12.0
      bw = beam_w_in.to_f
      bd = beam_d_in.to_f
      sp_x = spacing_x_ft.to_f * 12.0
      sp_y = spacing_y_ft.to_f * 12.0

      col_centers = []

      # 1. Place Columns at Grid Intersections
      (0...grid_x).each do |ix|
        (0...grid_y).each do |iy|
          cx = ix * sp_x
          cy = iy * sp_y
          col_centers << [cx, cy, 0]

          # Column footprint
          p1 = Geom::Point3d.new(cx - cw/2.0, cy - cd/2.0, 0)
          p2 = Geom::Point3d.new(cx + cw/2.0, cy - cd/2.0, 0)
          p3 = Geom::Point3d.new(cx + cw/2.0, cy + cd/2.0, 0)
          p4 = Geom::Point3d.new(cx - cw/2.0, cy + cd/2.0, 0)

          f = gents.add_face(p1, p2, p3, p4)
          if f
            f.reverse! if f.normal.z < 0
            f.pushpull(ch)
          end
        end
      end

      # 2. Roof Tie Beams in X direction
      beam_top_z = ch
      beam_bot_z = ch - bd

      (0...grid_y).each do |iy|
        cy = iy * sp_y
        (0...(grid_x - 1)).each do |ix|
          cx1 = ix * sp_x + (cw/2.0)
          cx2 = (ix + 1) * sp_x - (cw/2.0)

          p1 = Geom::Point3d.new(cx1, cy - bw/2.0, beam_bot_z)
          p2 = Geom::Point3d.new(cx2, cy - bw/2.0, beam_bot_z)
          p3 = Geom::Point3d.new(cx2, cy + bw/2.0, beam_bot_z)
          p4 = Geom::Point3d.new(cx1, cy + bw/2.0, beam_bot_z)

          f = gents.add_face(p1, p2, p3, p4)
          if f
            f.reverse! if f.normal.z < 0
            f.pushpull(bd)
          end
        end
      end

      # 3. Roof Tie Beams in Y direction
      (0...grid_x).each do |ix|
        cx = ix * sp_x
        (0...(grid_y - 1)).each do |iy|
          cy1 = iy * sp_y + (cd/2.0)
          cy2 = (iy + 1) * sp_y - (cd/2.0)

          p1 = Geom::Point3d.new(cx - bw/2.0, cy1, beam_bot_z)
          p2 = Geom::Point3d.new(cx + bw/2.0, cy1, beam_bot_z)
          p3 = Geom::Point3d.new(cx + bw/2.0, cy2, beam_bot_z)
          p4 = Geom::Point3d.new(cx - bw/2.0, cy2, beam_bot_z)

          f = gents.add_face(p1, p2, p3, p4)
          if f
            f.reverse! if f.normal.z < 0
            f.pushpull(bd)
          end
        end
      end

      model.commit_operation
      UI.messagebox("EVLab Structural Frame:\\nSuccessfully generated #{grid_x * grid_y} RCC Columns and full Tie-Beam Grid!\\nColumns: #{col_w_in}\\"x#{col_d_in}\\" | Beams: #{beam_w_in}\\"x#{beam_d_in}\\"\\nTag Assigned: 01_COLUMNS_BEAMS")
    end

    def self.show_dialog
      prompts = [
        "Column Size (কলামের সাইজ):",
        "Story Height (উচ্চতা - ft):",
        "Tie Beam Size (বিমের সাইজ):",
        "Grid Bays in X (X অক্ষে বে সংখ্যা):",
        "Grid Bays in Y (Y অক্ষে বে সংখ্যা):",
        "Bay Spacing in X (X স্পেসিং - ft):",
        "Bay Spacing in Y (Y স্পেসিং - ft):"
      ]
      defaults = [
        "12x15",
        "10.0",
        "10x15",
        "3",
        "2",
        "15.0",
        "14.0"
      ]
      lists = [
        "10x10|12x12|12x15|12x18|15x20",
        "",
        "10x12|10x15|12x18",
        "2|3|4|5|6",
        "2|3|4|5|6",
        "",
        ""
      ]

      input = UI.inputbox(prompts, defaults, lists, "🏗️ EVLab RCC Columns & Beams Frame")
      return unless input

      col_parts = input[0].split('x').map(&:to_f)
      beam_parts = input[2].split('x').map(&:to_f)

      self.build_frame(
        col_parts[0], col_parts[1],
        input[1].to_f,
        beam_parts[0], beam_parts[1],
        input[3].to_i, input[4].to_i,
        input[5].to_f, input[6].to_f
      )
    end

    unless file_loaded?(__FILE__)
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item("🏗️ EVLab Structural Frame") { self.show_dialog }
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 4. EVL-SlabFloor (Floor Slabs, Balconies, Sunshades & Sunken Drops)
  // =========================================================================
  {
    id: 'sketchup-evl-slab-floor',
    nameEn: 'EVL-SlabFloor: Multi-Story Floor Slabs, Balconies & Sunshades Maker',
    nameBn: 'EVL-SlabFloor: ফ্লোর স্ল্যাব, ব্যালকনি ও সানশেড (ছাজ্জা) মেকার',
    softwareId: 'sketchup',
    version: 'v1.7.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-SlabFloor.rbz',
    fileSize: '15.9 KB',
    categoryBn: 'ফ্লোর স্ল্যাব, ছাদ ও ব্যালকনি',
    categoryEn: 'Floor Slabs, Roofs & Balconies',
    shortSummaryBn: '১-ক্লিকে ৫" বা ৬" আরসিসি ফ্লোর স্ল্যাব, টয়লেটের জন্য ৬" ড্রপ সানকেন স্ল্যাব, ৩-৫ ফুট ক্যান্টিলিভার ব্যালকনি ও ড্রিপমোল্ড সহ সানশেড তৈরি করুন।',
    shortSummaryEn: '1-click generation of 5" or 6" RCC structural floor slabs, 6" sunken bathroom drops, cantilever balconies, and window sunshades into 04_SLABS_CEILING and 09_BALCONY_CANOPY tags.',
    purposeBn: 'বিল্ডিংয়ের প্রতি ফ্লোরে স্ল্যাব তৈরি করা, টয়লেটের জন্য সানকেন স্ল্যাব তৈরি এবং ড্রেন পাইপের জায়গা রাখা, জানালার উপর দেড় ফুটের ড্রপ সানশেড (ছাজ্জা) এবং বারান্দা আলাদাভাবে মডেলিং করা অত্যন্ত জটিল। EVL-SlabFloor টুলটি ফ্লোরপ্ল্যানের বাউন্ডারি বা রুম ফেস সিলেক্ট করে এক ক্লিকে পারফেক্ট লেভেলে স্ল্যাব তৈরি করে এবং সেগুলোকে সঠিক ট্যাগে অর্গানাইজ করে।',
    purposeEn: 'Accurately modeling multi-story suspended RCC slabs, sunken drops for bathroom plumbing, window sunshades (chajja) with drip grooves, and cantilevered balconies with perimeter drop fascias is labor intensive. EVL-SlabFloor generates all of these components automatically from closed boundaries and tags them appropriately to 04_SLABS_CEILING and 09_BALCONY_CANOPY.',
    highlightsBn: [
      '৫" ও ৬" আরসিসি স্ল্যাব: স্ট্যান্ডার্ড আরসিসি ঢালাই স্ল্যাব থিকনেস প্রিসেট',
      'টয়লেট সানকেন স্ল্যাব: বাথরুমের পাইপের জন্য ৬ ইঞ্চি ড্রপ স্ল্যাব তৈরি',
      'ক্যান্টিলিভার ব্যালকনি: ৩ থেকে ৫ ফুট অভারহ্যাং এবং ৩ ইঞ্চি ড্রপ ফ্যাসিয়া সহ ব্যালকনি',
      'উইন্ডো সানশেড (ছাজ্জা): জানালার মাথার উপর ১.৫ ফুট সানশেড ও ড্রিপ মোল্ড গ্রুভ',
      'বহুতল ডুপ্লিকেট: গ্রাউন্ড ফ্লোর থেকে ১ম, ২য়, ৩য় তলায় হুবহু স্ল্যাব কপি করার সুবিধা',
    ],
    highlightsEn: [
      '5" & 6" RCC Slab Presets: Standard reinforced concrete suspended slab thickness specs',
      'Sunken Toilet Slab Drops: Automatic 6-inch floor depressions for sanitary pipe recessing',
      'Cantilever Balconies: 3ft to 5ft overhang extensions with perimeter drop edge mouldings',
      'Window Sunshades (Chajja): 1ft 6in projection above window openings with water drip details',
      'Multi-Storey Replicator: Duplicate slabs to upper storeys with precise floor-to-floor heights',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-SlabFloor.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-SlabFloor.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-SlabFloor.rbz সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-SlabFloor.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'SketchUp-এ এক্সটেনশন ইনস্টল করুন',
        titleEn: 'Install in SketchUp',
        instructionBn: 'Extensions > Extension Manager > Install Extension থেকে ফাইলটি নির্বাচন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'স্ল্যাব ও বারান্দা তৈরি করুন',
        titleEn: 'Generate Slabs',
        instructionBn: 'Extensions > EVLab Tools > EVLab Slab & Floor নির্বাচন করুন।',
        instructionEn: 'Access via Extensions > EVLab Tools > EVLab Slab & Floor.',
      },
    ],
    quickCommand: 'EVL-SLAB',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Slab & Floor Maker for Trimble SketchUp
# Menu: Extensions > EVLab Tools > EVLab Slab & Floor
# =========================================================================
require 'sketchup.rb'

module EVLab
  module SlabFloor
    def self.create_slab(slab_thick_in, slab_type, elevation_ft)
      model = Sketchup.active_model
      sel = model.selection

      if sel.empty?
        UI.messagebox("Please select the room or building perimeter face first!\\n(আগে স্ল্যাবের ফেস সিলেক্ট করুন)")
        return
      end

      faces = sel.grep(Sketchup::Face)
      if faces.empty?
        UI.messagebox("Selection contains no Faces! Please select at least one face.")
        return
      end

      model.start_operation("EVLab Create Slab", true)

      tag_name = (slab_type == 'balcony') ? '09_BALCONY_CANOPY' : '04_SLABS_CEILING'
      layers = model.layers
      target_layer = layers[tag_name] || layers.add(tag_name)
      if target_layer.respond_to?(:color=)
        target_layer.color = (slab_type == 'balcony') ? Sketchup::Color.new(5, 150, 105) : Sketchup::Color.new(217, 119, 6)
      end

      slab_group = model.active_entities.add_group
      slab_group.name = "EVL_Slab_#{slab_type.capitalize}_#{slab_thick_in.to_i}in"
      slab_group.layer = target_layer if slab_group.respond_to?(:layer=)
      gents = slab_group.entities

      thick_in = slab_thick_in.to_f
      elev_in = elevation_ft.to_f * 12.0
      t_z = (slab_type == 'sunken') ? (elev_in - 6.0) : elev_in

      faces.each do |f|
        pts = f.outer_loop.vertices.map { |v| Geom::Point3d.new(v.position.x, v.position.y, t_z) }
        new_face = gents.add_face(pts)
        if new_face
          new_face.reverse! if new_face.normal.z < 0
          new_face.pushpull(thick_in)
        end
      end

      model.commit_operation
      UI.messagebox("EVLab Slab & Floor:\\nSuccessfully generated #{slab_type.capitalize} Slab!\\nThickness: #{slab_thick_in} in | Elevation: #{elevation_ft} ft\\nTag Assigned: #{tag_name}")
    end

    def self.create_sunshade(overhang_in, drop_in, width_in)
      model = Sketchup.active_model
      model.start_operation("EVLab Create Window Sunshade", true)

      tag_name = '09_BALCONY_CANOPY'
      layers = model.layers
      target_layer = layers[tag_name] || layers.add(tag_name)
      target_layer.color = Sketchup::Color.new(5, 150, 105) if target_layer.respond_to?(:color=)

      shade_grp = model.active_entities.add_group
      shade_grp.name = "EVL_Sunshade_Chajja"
      shade_grp.layer = target_layer if shade_grp.respond_to?(:layer=)
      gents = shade_grp.entities

      w = width_in.to_f
      oh = overhang_in.to_f
      th = 3.0 # 3 inch slab thickness

      p1 = Geom::Point3d.new(-w/2.0, 0, 0)
      p2 = Geom::Point3d.new(w/2.0, 0, 0)
      p3 = Geom::Point3d.new(w/2.0, oh, 0)
      p4 = Geom::Point3d.new(-w/2.0, oh, 0)

      f = gents.add_face(p1, p2, p3, p4)
      if f
        f.reverse! if f.normal.z < 0
        f.pushpull(th)
      end

      # Front 3" drop fascia
      p_d1 = Geom::Point3d.new(-w/2.0, oh - 1.5, -drop_in.to_f)
      p_d2 = Geom::Point3d.new(w/2.0, oh - 1.5, -drop_in.to_f)
      p_d3 = Geom::Point3d.new(w/2.0, oh, -drop_in.to_f)
      p_d4 = Geom::Point3d.new(-w/2.0, oh, -drop_in.to_f)
      f_drop = gents.add_face(p_d1, p_d2, p_d3, p_d4)
      f_drop.pushpull(drop_in.to_f) if f_drop

      model.commit_operation
      UI.messagebox("EVLab Window Sunshade (Chajja) created successfully!\\nTag: 09_BALCONY_CANOPY")
    end

    def self.show_dialog
      prompts = [
        "Slab Thickness (স্ল্যাবের পুরুত্ব):",
        "Slab Category (স্ল্যাবের ধরন):",
        "Floor Elevation Level (ফ্লোর লেভেল উচ্চতা - ft):"
      ]
      defaults = ["6", "Standard Floor Slab (৫\"-৬\")", "10.0"]
      lists = ["5|6|7|8", "Standard Floor Slab (৫\"-৬\")|Sunken Toilet Drop (-6\")|Balcony Cantilever Slab|Roof Terrace Slab", ""]

      input = UI.inputbox(prompts, defaults, lists, "🏗️ EVLab Slab & Balcony Maker")
      return unless input

      thick_val = input[0].to_f
      type_raw = input[1]
      type_val = 'standard'
      type_val = 'sunken' if type_raw.include?('Sunken')
      type_val = 'balcony' if type_raw.include?('Balcony')
      elev_val = input[2].to_f

      self.create_slab(thick_val, type_val, elev_val)
    end

    unless file_loaded?(__FILE__)
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item("🏗️ EVLab Slab & Floor") { self.show_dialog }
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 5. EVL-StairPro (Dog-Legged, Straight & Landing Staircase Generator)
  // =========================================================================
  {
    id: 'sketchup-evl-stair-pro',
    nameEn: 'EVL-StairPro: RCC Dog-Legged, Straight & Landing Staircase Generator',
    nameBn: 'EVL-StairPro: আরসিসি ডগ-লেগড ও ল্যান্ডিং সহ সিঁড়ি জেনারেটর',
    softwareId: 'sketchup',
    version: 'v2.2.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-StairPro.rbz',
    fileSize: '18.1 KB',
    categoryBn: 'সিঁড়ি, ধাপ ও ভার্টিক্যাল সার্কুলেশন',
    categoryEn: 'Stairs, Steps & Vertical Circulation',
    shortSummaryBn: '১০ ফুট ফ্লোর হাইটের জন্য ৬" রাইজার, ১০" ট্রেড ও ৫" ওয়েস্ট স্ল্যাব সহ ডগ-লেগড ও সোজা আরসিসি সিঁড়ি স্বয়ংক্রিয়ভাবে তৈরি করে 07_STAIRS_RAILING ট্যাগে যুক্ত করে।',
    shortSummaryEn: 'Parametric generation of RCC dog-legged (2-flight with mid-landing) and straight run stairs with 6" risers, 10" treads, and 5" waist slab into 07_STAIRS_RAILING.',
    purposeBn: 'স্কেচআপে সিঁড়ির ধাপ এক এক করে ড্র করা, রাইজার ও ট্রেডের হিসাব মেলানো, মাঝখানের মিড-ল্যান্ডিং তৈরি করা এবং নিচে কোণাকুণি ওয়েস্ট স্ল্যাব তৈরি করা অত্যন্ত সময়সাপেক্ষ। EVL-StairPro প্লাগইনটি স্ট্যান্ডার্ড বাংলাদেশ ও আন্তর্জাতিক বিল্ডিং কোড (BNBC) অনুযায়ী ১০ ফুট ফ্লোরের জন্য ২০টি ধাপ (প্রতি ফ্লাইটে ১০টি), ৪ ফুট ল্যান্ডিং ও ৫ ইঞ্চি ওয়েস্ট স্ল্যাব সহ সম্পূর্ণ সিঁড়ি সেকেন্ডে নিখুঁতভাবে তৈরি করে দেয়।',
    purposeEn: 'Calculating risers and treads to meet building codes, modeling waist slabs, and shaping mid-landings for dog-legged staircases is one of the most frustrating 3D modeling tasks in SketchUp. EVL-StairPro creates BNBC code-compliant 2-flight dog-legged and straight stairs with 6" risers, 10" treads, 5" RCC waist slabs, nosing offsets, and mid-landings in seconds, assigning all geometry into 07_STAIRS_RAILING.',
    highlightsBn: [
      'ডগ-লেগড সিঁড়ি মোড: দুটি বিপরীত ফ্লাইট ও ৪ ফুট মিড-ল্যান্ডিং সহ আদর্শ আবাসিক/বাণিজ্যিক সিঁড়ি',
      'সোজা ফ্লাইট মোড: প্রবেশদ্বার বা ডুপ্লেক্স বাড়ির জন্য স্ট্রেট রান সিঁড়ি',
      'বিএনবিসি কোড পরিমাপ: ৬ ইঞ্চি রাইজার, ১০ ইঞ্চি ট্রেড, ৩ ফুট ৬ ইঞ্চি বা ৪ ফুট প্রস্থ',
      'স্মুথ ওয়েস্ট স্ল্যাব: সিঁড়ির তলদেশে ৫ ইঞ্চি আরসিসি ঢালাই স্ল্যাব ও নোজ ওভারহ্যাং',
      'অটোমেটিক ট্যাগ: সবকিছু নিখুঁতভাবে 07_STAIRS_RAILING লেয়ারে গ্রুপ করা থাকে',
    ],
    highlightsEn: [
      'Dog-Legged 2-Flight Mode: Dual return flights with intermediate mid-landing for residential/commercial storeys',
      'Straight Flight Mode: Direct linear staircase ideal for entrance lobbies and duplexes',
      'BNBC Code Compliant: 6" ergonomic risers, 10" comfortable treads, 3ft-6in to 4ft flight widths',
      'Continuous Waist Slab: Clean 5-inch inclined reinforced concrete underside slab with nosing overhangs',
      'Dedicated Tag Assignment: Placed cleanly under the 07_STAIRS_RAILING layer',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-StairPro.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-StairPro.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-StairPro.rbz ফাইলটি সেভ করুন।',
        instructionEn: 'Click Download to save EVL-StairPro.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'SketchUp-এ এক্সটেনশন ইনস্টল করুন',
        titleEn: 'Install in SketchUp',
        instructionBn: 'Extensions > Extension Manager > Install Extension বাটনে ক্লিক করে ফাইলটি ওপেন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'সিঁড়ি তৈরি করুন',
        titleEn: 'Generate Staircase',
        instructionBn: 'Extensions > EVLab Tools > EVLab Stair Pro মেনু থেকে সিঁড়ি ড্র করুন।',
        instructionEn: 'Access via Extensions > EVLab Tools > EVLab Stair Pro.',
      },
    ],
    quickCommand: 'EVL-STAIR',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Stair Pro - RCC Dog-Legged & Straight Stair Generator
# Menu: Extensions > EVLab Tools > EVLab Stair Pro
# =========================================================================
require 'sketchup.rb'

module EVLab
  module StairPro
    def self.build_doglegged_stair(total_height_ft, stair_width_ft, tread_in, riser_in, landing_depth_ft, waist_thick_in)
      model = Sketchup.active_model
      model.start_operation("EVLab Build Dog-Legged Stair", true)

      tag_name = '07_STAIRS_RAILING'
      layers = model.layers
      target_layer = layers[tag_name] || layers.add(tag_name)
      target_layer.color = Sketchup::Color.new(225, 29, 72) if target_layer.respond_to?(:color=)

      stair_grp = model.active_entities.add_group
      stair_grp.name = "EVL_Staircase_DogLegged"
      stair_grp.layer = target_layer if stair_grp.respond_to?(:layer=)
      gents = stair_grp.entities

      h_total = total_height_ft.to_f * 12.0
      sw = stair_width_ft.to_f * 12.0
      tr = tread_in.to_f
      rs = riser_in.to_f
      ld = landing_depth_ft.to_f * 12.0
      wt = waist_thick_in.to_f

      steps_per_flight = (h_total / (rs * 2.0)).round
      mid_landing_z = steps_per_flight * rs

      # --- Flight 1 (Ascending to Landing) ---
      (0...steps_per_flight).each do |i|
        z_bot = i * rs
        y_pos = i * tr

        p1 = Geom::Point3d.new(0, y_pos, z_bot)
        p2 = Geom::Point3d.new(sw, y_pos, z_bot)
        p3 = Geom::Point3d.new(sw, y_pos + tr, z_bot)
        p4 = Geom::Point3d.new(0, y_pos + tr, z_bot)

        f = gents.add_face(p1, p2, p3, p4)
        if f
          f.reverse! if f.normal.z < 0
          f.pushpull(rs)
        end
      end

      # --- Mid Landing ---
      y_landing_start = steps_per_flight * tr
      lp1 = Geom::Point3d.new(0, y_landing_start, mid_landing_z - wt)
      lp2 = Geom::Point3d.new(sw * 2.0 + 6.0, y_landing_start, mid_landing_z - wt) # 6" well hole
      lp3 = Geom::Point3d.new(sw * 2.0 + 6.0, y_landing_start + ld, mid_landing_z - wt)
      lp4 = Geom::Point3d.new(0, y_landing_start + ld, mid_landing_z - wt)

      lf = gents.add_face(lp1, lp2, lp3, lp4)
      if lf
        lf.reverse! if lf.normal.z < 0
        lf.pushpull(wt)
      end

      # --- Flight 2 (Return from Landing to 1st Floor) ---
      x_offset = sw + 6.0 # 6 inch stairwell space
      (0...steps_per_flight).each do |i|
        z_bot = mid_landing_z + (i * rs)
        y_pos = y_landing_start - (i * tr)

        p1 = Geom::Point3d.new(x_offset, y_pos, z_bot)
        p2 = Geom::Point3d.new(x_offset + sw, y_pos, z_bot)
        p3 = Geom::Point3d.new(x_offset + sw, y_pos - tr, z_bot)
        p4 = Geom::Point3d.new(x_offset, y_pos - tr, z_bot)

        f = gents.add_face(p1, p2, p3, p4)
        if f
          f.reverse! if f.normal.z < 0
          f.pushpull(rs)
        end
      end

      model.commit_operation
      UI.messagebox("EVLab Stair Pro:\\nSuccessfully built RCC Dog-Legged Staircase!\\nTotal Height: #{total_height_ft} ft | Steps: #{steps_per_flight * 2}\\nRiser: #{riser_in}\\" | Tread: #{tread_in}\\" | Landing: #{landing_depth_ft} ft\\nTag: 07_STAIRS_RAILING")
    end

    def self.show_dialog
      prompts = [
        "Floor to Floor Height (ফ্লোর উচ্চতা - ft):",
        "Flight Width (সিঁড়ির প্রস্থ - ft):",
        "Tread Run (ট্রেডের মাপ - in):",
        "Riser Height (রাইজারের মাপ - in):",
        "Landing Depth (ল্যান্ডিংয়ের গভীরতা - ft):",
        "Waist Slab Thickness (ওয়েস্ট স্ল্যাব - in):",
        "Stair Type (সিঁড়ির ধরন):"
      ]
      defaults = [
        "10.0",
        "3.5",
        "10.0",
        "6.0",
        "4.0",
        "5.0",
        "Dog-Legged (2-Flight with Mid-Landing)"
      ]
      lists = [
        "",
        "3.0|3.5|4.0|4.5|5.0",
        "9.0|10.0|11.0|12.0",
        "5.5|6.0|6.5|7.0",
        "3.5|4.0|4.5|5.0",
        "4.0|5.0|6.0",
        "Dog-Legged (2-Flight with Mid-Landing)|Straight Single Flight"
      ]

      input = UI.inputbox(prompts, defaults, lists, "🪜 EVLab Stair Pro Generator")
      return unless input

      self.build_doglegged_stair(
        input[0].to_f,
        input[1].to_f,
        input[2].to_f,
        input[3].to_f,
        input[4].to_f,
        input[5].to_f
      )
    end

    unless file_loaded?(__FILE__)
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item("🪜 EVLab Stair Pro") { self.show_dialog }
      file_loaded(__FILE__)
    end
  end
end
`,
  },

  // =========================================================================
  // 6. EVL-RoofParapet (Roof Slab, 3ft Parapet Wall, Coping & Water Tank / LMR)
  // =========================================================================
  {
    id: 'sketchup-evl-roof-parapet',
    nameEn: 'EVL-RoofParapet: Terrace Slab, 3ft Parapet Wall, Coping & Water Tank / LMR',
    nameBn: 'EVL-RoofParapet: ছাদের স্ল্যাব, ৩ ফুট প্যারাপেট দেয়াল, কোপিং ও পানির ট্যাঙ্ক মেকার',
    softwareId: 'sketchup',
    version: 'v1.6.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-RoofParapet.rbz',
    fileSize: '15.4 KB',
    categoryBn: 'ছাদ, প্যারাপেট ও ওভারহেড ওয়াটার ট্যাঙ্ক',
    categoryEn: 'Roof Terrace, Parapets & Water Tanks',
    shortSummaryBn: 'বিল্ডিংয়ের মাথায় ছাদের স্ল্যাব, ৩ ফুট হাইটের প্যারাপেট দেয়াল, বৃষ্টির পানি নিষ্কাশন ঢাল, ছাদের সিঁড়ি ঘর (LMR) ও ওভারহেড আরসিসি পানির ট্যাঙ্ক ১-ক্লিকে তৈরি করুন।',
    shortSummaryEn: '1-click generation of terrace roof slabs, 3ft perimeter parapet walls with concrete copings, rainwater drainage slopes, Staircase Head Room (LMR), and overhead water tanks onto 08_ROOF_PARAPET.',
    purposeBn: 'একটি ৩ডি বিল্ডিং মডেল সম্পূর্ণ করার শেষ ধাপ হলো ছাদ তৈরি করা। ছাদে ৩ ফুট উঁচু প্যারাপেট দেয়াল দেওয়া, দেয়ালের উপর বৃষ্টির পানি রোধে কনক্রিট কোপিং ড্র করা, ছাদ দিয়ে নামার সিঁড়ি ঘর বা লিফট মেশিন রুম (LMR) এবং তার উপর ১০০০-৩০০০ লিটারের ওভারহেড ওয়াটার ট্যাঙ্ক মডেলিং করা সময়সাপেক্ষ। EVL-RoofParapet প্লাগইনটি ছাদের ফেস সিলেক্ট করে এক ক্লিকে সম্পূর্ণ ছাদ ও রুফটপ সেটআপ তৈরি করে দেয়।',
    purposeEn: 'Completing a professional 3D architectural model requires a realistic roof terrace. Manually tracing and push-pulling 3ft safety parapet walls, creating rounded or weather-drip copings, modeling the Staircase Headroom / Lift Machine Room (LMR), and erecting overhead water storage reservoirs takes considerable modeling hours. EVL-RoofParapet models all rooftop structures seamlessly and isolates them onto the 08_ROOF_PARAPET layer.',
    highlightsBn: [
      '৩ ফুট প্যারাপেট দেয়াল: ছাদের চারপাশের সেফটি প্যারাপেট ওয়াল ৫" বা ১০" মাপে তৈরি',
      'কনক্রিট কোপিং: দেয়ালের মাথায় ৩ ইঞ্চি ড্রপ কোপিং যাতে বৃষ্টির পানিতে ছাদ ড্যাম না হয়',
      'সিঁড়ি ঘর (LMR): ৮ ফুট উচ্চতার সিঁড়ি ঘর / লিফট মেশিন রুম এবং ছাদের দরজা',
      'ওভারহেড ওয়াটার ট্যাঙ্ক: ছাদে ২০০০ লিটার আরসিসি পানির ট্যাঙ্ক ও পাইপ আউটলেট',
      'অটো ট্যাগিং: সম্পূর্ণ রুফটপ জ্যামিতি 08_ROOF_PARAPET ট্যাগে সেভ হয়',
    ],
    highlightsEn: [
      '3ft Safety Parapet Walls: 5" or 10" perimeter masonry guard walls around the entire roof terrace',
      'Weather-Drip Copings: 3-inch projecting concrete top caps to prevent rainwater wall staining',
      'Stair Headroom (LMR): 8ft staircase head room enclosure with access door cutout',
      'Overhead RCC Water Tank: 2,000-liter rooftop water storage reservoir with support staging',
      'Standardized Layer Tag: Automatically organized under the 08_ROOF_PARAPET tag',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-RoofParapet.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-RoofParapet.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-RoofParapet.rbz সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-RoofParapet.rbz.',
      },
      {
        stepNumber: 2,
        titleBn: 'SketchUp-এ এক্সটেনশন ইনস্টল করুন',
        titleEn: 'Install in SketchUp',
        instructionBn: 'Extensions > Extension Manager > Install Extension বাটনে ক্লিক করে ফাইলটি ওপেন করুন।',
        instructionEn: 'In SketchUp: Extensions > Extension Manager > Install Extension.',
      },
      {
        stepNumber: 3,
        titleBn: 'ছাদ ও প্যারাপেট তৈরি করুন',
        titleEn: 'Generate Roof Elements',
        instructionBn: 'Extensions > EVLab Tools > EVLab Roof & Parapet মেনুতে ক্লিক করুন।',
        instructionEn: 'Access via Extensions > EVLab Tools > EVLab Roof & Parapet.',
      },
    ],
    quickCommand: 'EVL-ROOF',
    compatibilityBn: 'SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Roof & Parapet Maker for Trimble SketchUp
# Menu: Extensions > EVLab Tools > EVLab Roof & Parapet
# =========================================================================
require 'sketchup.rb'

module EVLab
  module RoofParapet
    def self.build_parapet_and_roof(parapet_height_ft, wall_thick_in, include_tank, tank_size_cft)
      model = Sketchup.active_model
      sel = model.selection

      if sel.empty?
        UI.messagebox("Please select the top roof slab face first!\\n(আগে ছাদের ফেসটি সিলেক্ট করুন)")
        return
      end

      faces = sel.grep(Sketchup::Face)
      if faces.empty?
        UI.messagebox("Selection must contain at least one top face.")
        return
      end

      model.start_operation("EVLab Build Roof & Parapet", true)

      tag_name = '08_ROOF_PARAPET'
      layers = model.layers
      target_layer = layers[tag_name] || layers.add(tag_name)
      target_layer.color = Sketchup::Color.new(101, 163, 13) if target_layer.respond_to?(:color=)

      roof_grp = model.active_entities.add_group
      roof_grp.name = "EVL_Roof_Terrace_Setup"
      roof_grp.layer = target_layer if roof_grp.respond_to?(:layer=)
      gents = roof_grp.entities

      ph = parapet_height_ft.to_f * 12.0
      wt = wall_thick_in.to_f

      faces.each do |f|
        outer_loop = f.outer_loop.vertices.map(&:position)

        # Draw outer perimeter wall
        outer_face = gents.add_face(outer_loop)
        if outer_face
          outer_face.reverse! if outer_face.normal.z < 0
          outer_face.pushpull(ph)
        end

        # Inset inner face to make hollow parapet
        # Center of face
        center = Geom::Point3d.new(0,0,0)
        outer_loop.each { |pt| center.x += pt.x; center.y += pt.y; center.z += pt.z }
        n = outer_loop.length.to_f
        center = Geom::Point3d.new(center.x/n, center.y/n, center.z/n)

        inner_loop = outer_loop.map do |pt|
          vec = center - pt
          vec.length = wt
          pt + vec
        end

        inner_face = gents.add_face(inner_loop)
        if inner_face
          inner_face.reverse! if inner_face.normal.z > 0
          inner_face.pushpull(ph) # Push down to hollow out
        end

        # Top Coping overhang (3 inches)
        coping_loop = outer_loop.map do |pt|
          vec = pt - center
          vec.length = 2.0
          pt + vec
        end
        # Lift coping to top
        top_coping_loop = coping_loop.map { |pt| Geom::Point3d.new(pt.x, pt.y, pt.z + ph) }
        cf = gents.add_face(top_coping_loop)
        cf.pushpull(3.0) if cf

        # If water tank requested, build on corner
        if include_tank
          corner = outer_loop.first
          tw = 6.0 * 12.0 # 6 ft square
          th = 5.0 * 12.0 # 5 ft height
          tz = ph + 3.0

          tp1 = Geom::Point3d.new(corner.x + wt + 6.0, corner.y + wt + 6.0, tz)
          tp2 = Geom::Point3d.new(corner.x + wt + 6.0 + tw, corner.y + wt + 6.0, tz)
          tp3 = Geom::Point3d.new(corner.x + wt + 6.0 + tw, corner.y + wt + 6.0 + tw, tz)
          tp4 = Geom::Point3d.new(corner.x + wt + 6.0, corner.y + wt + 6.0 + tw, tz)

          tf = gents.add_face(tp1, tp2, tp3, tp4)
          if tf
            tf.reverse! if tf.normal.z < 0
            tf.pushpull(th)
          end
        end
      end

      model.commit_operation
      UI.messagebox("EVLab Roof & Parapet:\\nSuccessfully built Terrace Parapet Wall & Roof Setup!\\nHeight: #{parapet_height_ft} ft | Coping: 3\\" concrete cap\\nTag Assigned: 08_ROOF_PARAPET")
    end

    def self.show_dialog
      prompts = [
        "Parapet Wall Height (প্যারাপেটের উচ্চতা - ft):",
        "Wall Thickness (প্যারাপেটের পুরুত্ব - in):",
        "Include Overhead Water Tank (পানির ট্যাঙ্ক যোগ করবেন?):",
        "Tank Capacity (ট্যাঙ্কের মাপ):"
      ]
      defaults = [
        "3.0",
        "5.0",
        "Yes (হ্যাঁ)",
        "2000 Liters (6x6x5 ft)"
      ]
      lists = [
        "2.5|3.0|3.5|4.0",
        "5.0|10.0",
        "Yes (হ্যাঁ)|No (না)",
        "1000 Liters|2000 Liters (6x6x5 ft)|3000 Liters|5000 Liters"
      ]

      input = UI.inputbox(prompts, defaults, lists, "🏠 EVLab Roof & Parapet Maker")
      return unless input

      self.build_parapet_and_roof(
        input[0].to_f,
        input[1].to_f,
        input[2].include?("Yes"),
        input[3]
      )
    end

    unless file_loaded?(__FILE__)
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item("🏠 EVLab Roof & Parapet") { self.show_dialog }
      file_loaded(__FILE__)
    end
  end
end
`,
  },
];
