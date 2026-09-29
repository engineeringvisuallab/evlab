import { SoftwareInfo, PluginItem } from '../types';
import { EXTRA_SKETCHUP_PLUGINS } from './pluginsExtra';
import { CIVIL_PLUGINS } from './pluginsCivil';
import { PLANT_AND_MEP_PLUGINS } from './pluginsPlantAndMeP';
import { AUTOCAD_PLUGINS } from './pluginsAutoCAD';
import { BUILDING_PLUGINS } from './pluginsBuilding';

export const SOFTWARE_LIST: SoftwareInfo[] = [
  {
    id: 'autocad',
    name: 'AutoCAD',
    shortName: 'AutoCAD',
    badge: 'Autodesk AutoCAD',
    descriptionBn: 'ড্রাফটিং, লাইন ও রডের মাপজোক এবং ড্রয়িং অটোমেশনের জন্য প্রয়োজনীয় টুলস।',
    descriptionEn: 'Drafting, linear measurements, rebar calculations, and drawing automation tools.',
    fileFormat: '.lsp',
    formatName: 'AutoLISP File',
    brandColor: '#E53E3E',
    accentBg: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  {
    id: 'sketchup',
    name: 'Trimble SketchUp',
    shortName: 'SketchUp',
    badge: 'Trimble SketchUp',
    descriptionBn: '২ডি প্ল্যান থেকে দ্রুত ৩ডি এক্সট্রুশন, আর্কিটেকচারাল মডেলিং ও এক্সটেনশন।',
    descriptionEn: 'Quick 2D-to-3D extrusions, architectural modeling, and workflow extensions.',
    fileFormat: '.rbz',
    formatName: 'Ruby Extension Zip',
    brandColor: '#0284C7',
    accentBg: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
  },
  {
    id: 'revit',
    name: 'Autodesk Revit',
    shortName: 'Revit',
    badge: 'Autodesk Revit BIM',
    descriptionBn: 'বিল্ডিং ইনফরমেশন মডেলিং (BIM), অটোমেটিক রুম ট্যাগিং ও শিডিউল তৈরির ডায়নামো স্ক্রিপ্ট।',
    descriptionEn: 'Building Information Modeling (BIM), automated room tagging, and Dynamo scripts.',
    fileFormat: '.dyn',
    formatName: 'Dynamo Script',
    brandColor: '#0D9488',
    accentBg: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
  },
  {
    id: 'civil3d',
    name: 'AutoCAD Civil 3D',
    shortName: 'Civil 3D',
    badge: 'Autodesk Civil 3D',
    descriptionBn: 'ভূমি উন্নয়ন, রাস্তার ক্রস-সেকশন, কাট-ফিল ও আর্থওয়ার্ক ক্যালকুলেশনের সিভিল টুলস।',
    descriptionEn: 'Land grading, cross-sections, cut-fill volumes, and civil infrastructure earthwork.',
    fileFormat: '.lsp',
    formatName: 'Civil LISP Tool',
    brandColor: '#D97706',
    accentBg: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
];

const CORE_PLUGINS_DATA: PluginItem[] = [
  {
    id: 'autocad-evl-tlen',
    nameEn: 'EVL-TLEN: Quick Length & Dimension Totalizer',
    nameBn: 'EVL-TLEN: এক ক্লিকে মোট দৈর্ঘ্য পরিমাপক (TLEN লিস্প)',
    softwareId: 'autocad',
    version: 'v2.5.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-TLEN.lsp',
    fileSize: '3.4 KB',
    categoryBn: 'ড্রাফটিং ও রড ক্যালকুলেশন',
    categoryEn: 'Drafting & Quantity Calculation',
    shortSummaryBn: 'ড্রয়িংয়ের শত শত লাইন, পলিলাইন ও রডের দৈর্ঘ্য এক এক করে মেপে যোগ করার ঝামেলা শেষ। এক ক্লিকেই সম্পূর্ণ মোট মাপ চলে আসবে।',
    shortSummaryEn: 'Select any number of lines, polylines, or rebars to calculate total cumulative length instantly in one click without manual addition.',
    purposeBn: 'ড্রয়িংয়ে বাউন্ডারি ওয়ালের মোট দৈর্ঘ্য, রিবার বা রডের কাট-লেংথ, ইলেকট্রিক্যাল বা প্লাম্বিং পাইপের মোট পরিমাণ ক্যালকুলেটরে এক এক করে যোগ করা বেশ সময়সাপেক্ষ ও ভুলের সম্ভাবনা থাকে। এই প্লাগিনটি ড্রয়িংয়ের সিলেক্ট করা লাইনের মোট দৈর্ঘ্য চোখের পলকে স্ক্রিনে হিসাব করে দেয়।',
    purposeEn: 'Measuring cumulative lengths of multiple lines, rebar cut-lengths, boundary walls, or piping networks in AutoCAD manually using calculators is slow and prone to errors. This plugin scans all selected linear entities and calculates their exact cumulative total distance in seconds.',
    highlightsBn: [
      'Line, Polyline, Arc, Spline সব ধরণের লিনিয়ার অবজেক্ট সাপোর্ট করে',
      'সিলেক্ট করা মোট অবজেক্ট সংখ্যা এবং মোট দৈর্ঘ্য স্ক্রিনে দেখায়',
      'কমান্ড বারে এবং পপআপ অ্যালার্ট ডায়ালগে ফলাফল প্রদর্শন',
      'অতিরিক্ত কোনো প্লাগিন বা লাইব্রেরির প্রয়োজন নেই',
    ],
    highlightsEn: [
      'Supports all linear CAD entities: Lines, Polylines, Arcs, Splines, and Circles',
      'Instant count of selected elements and exact sum of total length',
      'Dual display: command prompt history and visual alert dialog',
      'Standalone native AutoLISP code with zero external dependencies',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'ফাইল ডাউনলোড করুন',
        titleEn: 'Download EVL-TLEN.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-TLEN.lsp ফাইলটি সেভ করুন।',
        instructionEn: 'Click the Download button to save EVL-TLEN.lsp onto your PC.',
      },
      {
        stepNumber: 2,
        titleBn: 'AutoCAD-এ লোড কমান্ড দিন',
        titleEn: 'Open APPLOAD in AutoCAD',
        instructionBn: 'AutoCAD খুলে কমান্ড বক্সে APPLOAD লিখে Enter দিন।',
        instructionEn: 'Open AutoCAD, type APPLOAD in the command bar, and press Enter.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'ফাইলটি সিলেক্ট করে Load দিন',
        titleEn: 'Select and Load Script',
        instructionBn: 'উইন্ডো থেকে ডাউনলোড করা EVL-TLEN.lsp ফাইলটি সিলেক্ট করে Load বাটনে ক্লিক করুন।',
        instructionEn: 'Browse and select the downloaded EVL-TLEN.lsp file, then click the Load button.',
      },
      {
        stepNumber: 4,
        titleBn: 'EVL-TLEN কমান্ড রান করুন',
        titleEn: 'Run EVL-TLEN Command',
        instructionBn: 'ড্রয়িংয়ে EVL-TLEN (বা TLEN) টাইপ করে Enter দিন এবং যে যে লাইন মাপতে চান তা সিলেক্ট করুন।',
        instructionEn: 'Type EVL-TLEN (or TLEN) in the command bar, press Enter, and drag-select your objects.',
        command: 'EVL-TLEN',
      },
    ],
    quickCommand: 'EVL-TLEN',
    compatibilityBn: 'AutoCAD 2016 - 2026 (Full Version)',
    compatibilityEn: 'AutoCAD 2016 - 2026 (Full Desktop with LISP)',
    rawCodeSnippet: `;; =========================================================================
;; EVLab Plugin Hub - AutoCAD Total Length Calculator (EVL-TLEN.lsp)
;; Commands: EVL-TLEN or TLEN
;; =========================================================================
(vl-load-com)
(defun c:evl-tlen (/ ss ent len total i)
  (princ "\\n[EVLab Hub] Select Lines, Polylines, Arcs, or Splines to total: ")
  (if (setq ss (ssget '((0 . "LINE,LWPOLYLINE,POLYLINE,ARC,SPLINE,CIRCLE"))))
    (progn
      (setq total 0.0)
      (setq i 0)
      (while (< i (sslength ss))
        (setq ent (vlax-ename->vla-object (ssname ss i)))
        (setq len (vlax-curve-getDistAtParam ent (vlax-curve-getEndParam ent)))
        (setq total (+ total len))
        (setq i (1+ i))
      )
      (princ (strcat "\\n>>> [EVLab TLEN] Total Items: " (itoa (sslength ss))))
      (princ (strcat "\\n>>> [EVLab TLEN] TOTAL CUMULATIVE LENGTH: " (rtos total 2 4) " units."))
      (alert (strcat "EVLab AutoCAD Totalizer (EVL-TLEN)\\n"
                     "--------------------------------\\n"
                     "Total Items Selected: " (itoa (sslength ss)) "\\n"
                     "Total Length: " (rtos total 2 4) " units\\n\\n"
                     "Thank you for using EVLab Plugin Hub!"))
    )
    (princ "\\n[EVLab Hub] No valid linear objects selected.")
  )
  (princ)
)
(defun c:tlen () (c:evl-tlen))
(princ "\\n>>> EVLab EVL-TLEN Loaded! Type 'EVL-TLEN' or 'TLEN' to run. <<<")
(princ)`,
  },
  {
    id: 'sketchup-evl-facemaker',
    nameEn: 'EVL-FaceMaker: CAD Import Line Closer & Auto-Orient',
    nameBn: 'EVL-FaceMaker: ক্যাড লাইনে ১-ক্লিকে ফেস তৈরি ও অটো রিভার্স',
    softwareId: 'sketchup',
    version: 'v1.4.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-FaceMaker.rbz',
    fileSize: '6.8 KB',
    categoryBn: '৩ডি ফেস জেনারেটর ও ক্যাড অপটিমাইজেশন',
    categoryEn: '3D Face Generator & CAD Optimization',
    shortSummaryBn: 'অটোক্যাড থেকে স্কেচআপে ড্রয়িং আনলে কোনো ফেস থাকে না। EVL-FaceMaker ১-ক্লিকে সিলেক্টেড সমস্ত ক্যাড লাইনে নিখুঁত ফেস তৈরি করে এবং উল্টো (নীল) ফেসকে স্বয়ংক্রিয়ভাবে সাদা ফ্রন্ট ফেসে ঘুরিয়ে দেয়।',
    shortSummaryEn: 'CAD floor plans imported into SketchUp lack closed faces. Instead of manually retracing lines with the Pencil tool, EVL-FaceMaker generates solid faces in 1-click and auto-orients reversed blue faces.',
    purposeBn: 'ক্যাড ফাইল স্কেচআপে ইমপোর্ট করলে হাজার হাজার ২ডি লাইন আসে কিন্তু কোনো সারফেস বা ফেস তৈরি হয় না। ডিজাইনারদের ঘণ্টার পর ঘণ্টা পেনসিল টুল দিয়ে প্রতিটি লাইনের উপর ক্লিক করে ফেস বানাতে হয় এবং অনেক ফেস উল্টো নীল হয়ে থাকে। EVL-FaceMaker স্বয়ংক্রিয়ভাবে সব ক্লোজড লুপে সঠিক সাদা ফ্রন্ট ফেস তৈরি করে দেয়।',
    purposeEn: 'Imported CAD plans into SketchUp consist only of raw wireframe edges with zero faces. Designers spend tedious hours tracing each boundary with the line tool. Moreover, back-facing blue faces cause texture and rendering issues. EVL-FaceMaker finds edge loops, calls find_faces, and auto-reverses normals to pure white front faces.',
    highlightsBn: [
      'সিলেক্টেড ক্যাড ড্রয়িংয়ের সমস্ত বদ্ধ লাইনে ১-ক্লিকে ফেস (Surface) তৈরি',
      'সব উল্টো নীল ফেস (Reversed Blue Faces) স্বয়ংক্রিয়ভাবে সোজা সাদা ফ্রন্ট ফেসে রূপান্তর',
      'হাতে পেনসিল টুল দিয়ে ক্যাড লাইনে ক্লিক করার দীর্ঘ পরিশ্রম থেকে সম্পূর্ণ মুক্তি',
      'সহজ .rbz এক্সটেনশন ফরম্যাট, SketchUp Extension Manager দিয়ে ১-ক্লিকে ইনস্টল',
    ],
    highlightsEn: [
      'Generates clean faces for all closed boundary wireframes in 1-click',
      'Auto-fixes reversed blue faces to correct white front-facing normals',
      'Eliminates hours of manual line-retracing with the Pencil tool',
      'Native .rbz package installed instantly via SketchUp Extension Manager',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'ফাইল ডাউনলোড করুন',
        titleEn: 'Download EVL-FaceMaker.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-FaceMaker.rbz ফাইলটি সেভ করুন।',
        instructionEn: 'Click Download to save the EVL-FaceMaker.rbz file to your computer.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager খুলুন',
        titleEn: 'Open Extension Manager',
        instructionBn: 'SketchUp-এর মেনুবার থেকে Extensions > Extension Manager-এ যান।',
        instructionEn: 'In Trimble SketchUp, click Extensions > Extension Manager from top menu.',
      },
      {
        stepNumber: 3,
        titleBn: 'Install Extension দিন',
        titleEn: 'Click Install Extension',
        instructionBn: 'নিচের "Install Extension" বাটনে ক্লিক করে ডাউনলোড করা EVL-FaceMaker.rbz ফাইলটি দেখিয়ে দিন।',
        instructionEn: 'Click the "Install Extension" button at the bottom and pick the EVL-FaceMaker.rbz file.',
      },
      {
        stepNumber: 4,
        titleBn: 'টুলবার থেকে ফেস বানান',
        titleEn: 'Run EVL-FaceMaker',
        instructionBn: 'ক্যাড লাইন সিলেক্ট করে Extensions > EVLab Tools > EVL-FaceMaker-এ ক্লিক করলেই সব ফেস তৈরি হয়ে যাবে।',
        instructionEn: 'Select CAD line edges and click Extensions > EVLab Tools > EVL-FaceMaker to generate all faces.',
      },
    ],
    quickCommand: 'Extensions > EVLab Tools > EVL-FaceMaker',
    compatibilityBn: 'Trimble SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Plugin Hub - SketchUp CAD Face Maker & Auto-Orient (EVL-FaceMaker)
# Works on RAW Edges, Imported CAD Groups, and Component Blocks
# File: evlab_facemaker.rb
# =========================================================================
require 'sketchup.rb'

module EVLab
  module FaceMaker
    def self.collect_edges_from_entities(entities_collector, max_depth = 3)
      edges = []
      entities_collector.each do |ent|
        if ent.is_a?(Sketchup::Edge)
          edges << ent
        elsif ent.is_a?(Sketchup::Group) && max_depth > 0
          edges.concat(collect_edges_from_entities(ent.entities, max_depth - 1))
        elsif ent.is_a?(Sketchup::ComponentInstance) && max_depth > 0
          edges.concat(collect_edges_from_entities(ent.definition.entities, max_depth - 1))
        end
      end
      edges.uniq
    end

    def self.make_faces
      model = Sketchup.active_model
      selection = model.selection
      
      edges = []
      if selection.empty?
        ans = UI.messagebox("EVL-FaceMaker:\\nNo objects currently selected.\\n\\nDo you want to search and generate faces for ALL CAD wireframe edges in the active model?", MB_YESNO)
        if ans == IDYES
          edges = collect_edges_from_entities(model.active_entities)
        else
          return
        end
      else
        edges = collect_edges_from_entities(selection)
      end

      if edges.empty?
        UI.messagebox("EVL-FaceMaker:\\nNo valid CAD edges found in your selection or active drawing.\\nPlease import or select your CAD floor plan lines!")
        return
      end

      model.start_operation('EVL-FaceMaker: Create & Orient Faces', true)
      
      # Group edges by parent entities collection so find_faces is called correctly in groups
      entities_groups = edges.group_by(&:parent)
      total_new_faces = 0
      total_fixed_faces = 0

      entities_groups.each do |parent_entities_def, grp_edges|
        target_entities = parent_entities_def.is_a?(Sketchup::ComponentDefinition) ? parent_entities_def.entities : model.active_entities
        faces_before = target_entities.grep(Sketchup::Face).length

        # 1. Generate faces for all closed coplanar boundary loops
        grp_edges.each do |edge|
          edge.find_faces if edge.valid?
        end

        # 2. Auto-reverse back (blue) faces so normals point upright (Z >= 0)
        faces_now = target_entities.grep(Sketchup::Face)
        faces_now.each do |face|
          if face.valid? && face.normal.z < 0
            face.reverse!
            total_fixed_faces += 1
          end
        end

        total_new_faces += (faces_now.length - faces_before)
      end

      model.commit_operation
      UI.messagebox("EVL-FaceMaker Completed Successfully!\\n----------------------------------------\\nCAD Edges Processed: #{edges.length}\\nNew 3D Faces Created: #{total_new_faces}\\nReversed (Blue) Faces Fixed to White: #{total_fixed_faces}\\n\\nAll surfaces are now closed and ready for Push/Pull!")
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-FaceMaker (Create & Orient Faces)") { self.make_faces }
      cmd.tooltip = "EVL-FaceMaker: Generate solid front faces from CAD wireframe edges & groups"
      cmd.status_bar_text = "Generate solid front faces from CAD wireframe edges and groups"
      
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      
      file_loaded(__FILE__)
    end
  end
end`,
  },
  {
    id: 'sketchup-evl-railing',
    nameEn: 'EVL-Railing: 10 Styles 3D Architectural Railing Generator',
    nameBn: 'EVL-Railing: ১০টি স্টাইলের ৩ডি ব্যালকনি ও সিঁড়ি রেলিং জেনারেটর',
    softwareId: 'sketchup',
    version: 'v2.1.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Railing.rbz',
    fileSize: '9.8 KB',
    categoryBn: '৩ডি রেলিং, সিঁড়ি ও ব্যালকনি ডিজাইন',
    categoryEn: '3D Railing, Stairs & Balcony Design',
    shortSummaryBn: 'সিঁড়ি, ব্যালকনি ও ছাদে ২ভাবে রেলিং ড্র করুন: ক্লিক করে করে পয়েন্ট বসিয়ে অথবা লাইন সিলেক্ট করে। ১০ ধরণের আধুনিক রেলিংয়ের বাস্তব ইমেজ প্রিভিউ দেখে কাস্টমাইজ করুন।',
    shortSummaryEn: 'Draw 10 architectural railing styles with 2 drawing modes: interactive click-by-click point placement or selecting an existing line, backed by photorealistic image previews.',
    purposeBn: 'স্কেচআপে ব্যালকনি, ছাদ বা সিঁড়ির জন্য কাস্টম রেলিং বানাতে ২টি সহজ অপশন রয়েছে: (১) ক্লিক করে করে পয়েন্ট দিয়ে সরাসরি রেলিং ড্র করা অথবা (২) পূর্বে আঁকা লাইন সিলেক্ট করে ১-ক্লিকে ৩ডি রেলিং এক্সট্রুড করা। এতে রয়েছে ১০টি আধুনিক স্টাইলের বাস্তবসম্মত ইমেজ প্রিভিউ (যেমন: ফ্রেমলেস গ্লাস, এসএস কেবল, রট আয়রন স্ক্রোল, ভার্টিক্যাল স্ল্যাট, পাইপ হ্যান্ডরেল, ফার্মহাউস এক্স-ব্রেইস ইত্যাদি) এবং হাইট ও পোস্ট স্পেসিং নিয়ন্ত্রণ।',
    purposeEn: 'EVL-Railing provides two versatile drawing workflows in SketchUp: (1) Interactive Click-by-Click point placement, and (2) Select Existing Line edge path for instant 3D extrusion. Features 10 architectural railing styles with photorealistic image previews, custom heights (36"-48"), and post spacing.',
    highlightsBn: [
      '২টি সহজ ড্রয়িং অপশন: (১) ক্যানভাসে ক্লিক করে করে পয়েন্ট বসিয়ে ড্র, (২) পূর্বে আঁকা লাইন সিলেক্ট করে ড্র',
      '১০ ধরণের আধুনিক আর্কিটেকচারাল স্টাইলের বাস্তবসম্মত হাই-রেজ্যুলেশন ইমেজ প্রিভিউ (Photorealistic Render Preview)',
      'ফ্রেমলেস গ্লাস ও স্পিগট, এসএস ওয়্যার ক্যাবল, ক্লাসিক্যাল রট আয়রন, মেটাল স্ল্যাট, ইন্ডাস্ট্রিয়াল পাইপ, ফার্মহাউস X-ব্রেইস ইত্যাদি',
      'উচ্চতা (Height 36"-48"), পোস্টের দূরত্ব (Post Spacing) ও হ্যান্ডরেল প্রফাইল কাস্টমাইজেশন',
      'স্কেচআপের ভেতরে লাইভ ইমেজ প্রিভিউ ডায়ালগ ও স্ট্যান্ডার্ড .rbz ফরম্যাট',
    ],
    highlightsEn: [
      'Dual Drawing Options: (1) Interactive Click-by-Click point placement, and (2) Select Existing Line for instant 3D generation',
      'Photorealistic Image Previews for all 10 architectural railing styles directly in the extension dialog',
      'Frameless Glass, SS Tension Cable, Classical Iron, Vertical Slats, Industrial Pipe, CNC Mesh, Farmhouse X, etc.',
      'Full customization of rail height (36"-48"), post spacing, and top handrail profiles',
      'Clean native .rbz extension installable via SketchUp Extension Manager',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Railing.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Railing.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Railing.rbz ফাইলটি আপনার কম্পিউটারে সেভ করুন।',
        instructionEn: 'Click the Download button to save EVL-Railing.rbz to your PC.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager খুলুন',
        titleEn: 'Open Extension Manager',
        instructionBn: 'SketchUp-এর মেনু থেকে Extensions > Extension Manager-এ ক্লিক করুন।',
        instructionEn: 'In Trimble SketchUp, open Extensions > Extension Manager from the top menu.',
      },
      {
        stepNumber: 3,
        titleBn: 'Install Extension দিন',
        titleEn: 'Install Extension',
        instructionBn: 'উইন্ডোর নিচে Install Extension বাটনে ক্লিক করে EVL-Railing.rbz সিলেক্ট করুন।',
        instructionEn: 'Click the Install Extension button at the bottom and choose EVL-Railing.rbz.',
      },
      {
        stepNumber: 4,
        titleBn: 'পাথ সিলেক্ট করে রেলিং ড্র করুন',
        titleEn: 'Select Path & Draw Railing',
        instructionBn: 'ড্রয়িংয়ের লাইন বা কার্ভ পাথ সিলেক্ট করে Extensions > EVLab Tools > EVL-Railing রান করুন। ১০টি স্টাইলের প্রিভিউ দেখে আপনার পছন্দের রেলিং তৈরি করুন।',
        instructionEn: 'Select any boundary line or edge path, click Extensions > EVLab Tools > EVL-Railing, select your railing style with preview, and generate 3D geometry.',
      },
    ],
    quickCommand: 'Extensions > EVLab Tools > EVL-Railing',
    compatibilityBn: 'Trimble SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Plugin Hub - EVL-Railing: True 3D Architectural Railing Generator
# All 10 Styles with Genuine 3D Solid Geometry & Interactive Live Preview
# File: evlab_railing.rb
# =========================================================================
require 'sketchup.rb'

module EVLab
  module Railing
    STYLES = [
      { id: 0, name: "1. Modern Frameless Glass & SS Spigots", infill: :glass, h: 42.0, sp: 48.0 },
      { id: 1, name: "2. Stainless Steel Cable (5-Row Wire)", infill: :cable, h: 36.0, sp: 48.0 },
      { id: 2, name: "3. Classical Wrought Iron Scrolls", infill: :scroll, h: 36.0, sp: 48.0 },
      { id: 3, name: "4. Contemporary Vertical Slats (100mm C/C)", infill: :slats, h: 42.0, sp: 48.0 },
      { id: 4, name: "5. Industrial Pipe & Floor Flanges", infill: :pipe, h: 42.0, sp: 48.0 },
      { id: 5, name: "6. Traditional Timber Turned Balusters", infill: :timber, h: 36.0, sp: 48.0 },
      { id: 6, name: "7. Perforated CNC Laser-Cut Sheet", infill: :mesh, h: 42.0, sp: 48.0 },
      { id: 7, name: "8. Balcony Glass with Timber Cap Rail", infill: :glass_wood, h: 42.0, sp: 48.0 },
      { id: 8, name: "9. Modern Farmhouse X-Brace (Crossbuck)", infill: :x_brace, h: 36.0, sp: 48.0 },
      { id: 9, name: "10. Commercial Safety Rail & Kickplate", infill: :safety, h: 42.0, sp: 48.0 }
    ]

    def self.get_or_create_mat(model, name, r, g, b, alpha = 1.0)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
        mat.alpha = alpha if alpha < 1.0
      end
      mat
    end

    # --- TRUE 3D SOLID GEOMETRY BUILDERS ---
    def self.add_3d_box_beam(entities, p1, p2, width, depth, z_offset = 0)
      vec = p2 - p1
      len = vec.length
      return if len < 0.1
      dir = vec.normalize
      up = Geom::Vector3d.new(0, 0, 1)
      cp = dir.cross(up)
      side = cp.length > 0.001 ? cp.normalize : Geom::Vector3d.new(1, 0, 0)

      beam_grp = entities.add_group
      hw = width / 2.0
      base_z = z_offset

      c1 = Geom::Point3d.new(p1.x + side.x * hw, p1.y + side.y * hw, p1.z + side.z * hw + base_z)
      c2 = Geom::Point3d.new(p1.x - side.x * hw, p1.y - side.y * hw, p1.z - side.z * hw + base_z)
      c3 = Geom::Point3d.new(p2.x - side.x * hw, p2.y - side.y * hw, p2.z - side.z * hw + base_z)
      c4 = Geom::Point3d.new(p2.x + side.x * hw, p2.y + side.y * hw, p2.z + side.z * hw + base_z)

      face = beam_grp.entities.add_face(c1, c2, c3, c4)
      if face && face.valid?
        face.reverse! if face.normal.z < 0
        face.pushpull(depth)
      end
      beam_grp.material = get_or_create_mat(Sketchup.active_model, "EVL_SS_Brushed", 215, 218, 222)
    end

    def self.add_3d_post(entities, pt, width, height, dir = nil, perp = nil)
      post_grp = entities.add_group
      hw = width / 2.0
      vx = (dir && perp) ? dir : Geom::Vector3d.new(1, 0, 0)
      vy = (dir && perp) ? perp : Geom::Vector3d.new(0, 1, 0)

      c1 = Geom::Point3d.new(pt.x + vx.x * hw + vy.x * hw, pt.y + vx.y * hw + vy.y * hw, pt.z)
      c2 = Geom::Point3d.new(pt.x - vx.x * hw + vy.x * hw, pt.y - vx.y * hw + vy.y * hw, pt.z)
      c3 = Geom::Point3d.new(pt.x - vx.x * hw - vy.x * hw, pt.y - vx.y * hw - vy.y * hw, pt.z)
      c4 = Geom::Point3d.new(pt.x + vx.x * hw - vy.x * hw, pt.y + vx.y * hw - vy.y * hw, pt.z)
      face = post_grp.entities.add_face(c1, c2, c3, c4)
      if face && face.valid?
        face.reverse! if face.normal.z < 0
        face.pushpull(height)
      end
      mat_metal = get_or_create_mat(Sketchup.active_model, "EVL_SS_Brushed", 215, 218, 222)
      post_grp.material = mat_metal

      # Base floor mounting flange plate (in dedicated sub-group to prevent face collision)
      flange_grp = entities.add_group
      fw = width * 1.6
      hfw = fw / 2.0
      f1 = Geom::Point3d.new(pt.x + vx.x * hfw + vy.x * hfw, pt.y + vx.y * hfw + vy.y * hfw, pt.z)
      f2 = Geom::Point3d.new(pt.x - vx.x * hfw + vy.x * hfw, pt.y - vx.y * hfw + vy.y * hfw, pt.z)
      f3 = Geom::Point3d.new(pt.x - vx.x * hfw - vy.x * hfw, pt.y - vx.y * hfw - vy.y * hfw, pt.z)
      f4 = Geom::Point3d.new(pt.x + vx.x * hfw - vy.x * hfw, pt.y + vx.y * hfw - vy.y * hfw, pt.z)
      f_face = flange_grp.entities.add_face(f1, f2, f3, f4)
      if f_face && f_face.valid?
        f_face.reverse! if f_face.normal.z < 0
        f_face.pushpull(0.375.inch)
      end
      flange_grp.material = mat_metal
    end

    def self.add_3d_balusters(entities, p1, p2, count, size, bottom_z, top_z)
      return if count <= 0
      vec = p2 - p1
      return if vec.length < 0.1
      dir = vec.normalize
      up = Geom::Vector3d.new(0, 0, 1)
      cp = dir.cross(up)
      perp = cp.length > 0.001 ? cp.normalize : Geom::Vector3d.new(0, 1, 0)

      bal_grp = entities.add_group
      hw = size / 2.0
      (1..count).each do |i|
        t = i.to_f / (count + 1)
        bx = p1.x + (p2.x - p1.x) * t
        by = p1.y + (p2.y - p1.y) * t
        bz = p1.z + (p2.z - p1.z) * t + bottom_z

        c1 = Geom::Point3d.new(bx + dir.x * hw + perp.x * hw, by + dir.y * hw + perp.y * hw, bz)
        c2 = Geom::Point3d.new(bx - dir.x * hw + perp.x * hw, by - dir.y * hw + perp.y * hw, bz)
        c3 = Geom::Point3d.new(bx - dir.x * hw - perp.x * hw, by - dir.y * hw - perp.y * hw, bz)
        c4 = Geom::Point3d.new(bx + dir.x * hw - perp.x * hw, by + dir.y * hw - perp.y * hw, bz)
        face = bal_grp.entities.add_face(c1, c2, c3, c4)
        if face && face.valid?
          face.reverse! if face.normal.z < 0
          face.pushpull(top_z - bottom_z)
        end
      end
      bal_grp.material = get_or_create_mat(Sketchup.active_model, "EVL_SS_Brushed", 215, 218, 222)
    end

    def self.add_3d_glass_panel(entities, p1, p2, bottom_z, top_z, thickness = 0.5.inch)
      vec = p2 - p1
      len = vec.length
      return if len < 0.1
      dir = vec.normalize
      up = Geom::Vector3d.new(0, 0, 1)
      cp = dir.cross(up)
      side = cp.length > 0.001 ? cp.normalize : Geom::Vector3d.new(1, 0, 0)
      ht = thickness / 2.0

      # 3D solid glass panel in dedicated sub-group
      glass_grp = entities.add_group
      b1 = Geom::Point3d.new(p1.x + side.x * ht, p1.y + side.y * ht, p1.z + bottom_z)
      b2 = Geom::Point3d.new(p1.x - side.x * ht, p1.y - side.y * ht, p1.z + bottom_z)
      b3 = Geom::Point3d.new(p2.x - side.x * ht, p2.y - side.y * ht, p2.z + bottom_z)
      b4 = Geom::Point3d.new(p2.x + side.x * ht, p2.y + side.y * ht, p2.z + bottom_z)

      face = glass_grp.entities.add_face(b1, b2, b3, b4)
      if face && face.valid?
        face.reverse! if face.normal.z < 0
        face.pushpull(top_z - bottom_z)
      end
      # Programmatic translucent glass material creation
      glass_grp.material = get_or_create_mat(Sketchup.active_model, "EVL_Glass_Tint", 180, 220, 245, 0.35)

      # 3D Spigot clamps at 20% and 80% along panel
      [0.2, 0.8].each do |ratio|
        sp_x = p1.x + (p2.x - p1.x) * ratio
        sp_y = p1.y + (p2.y - p1.y) * ratio
        sp_z = p1.z + (p2.z - p1.z) * ratio
        sp_pt = Geom::Point3d.new(sp_x, sp_y, sp_z)
        add_3d_post(entities, sp_pt, 2.0.inch, bottom_z + 4.0.inch)
      end
    end

    # --- HELPER: SMOOTH CORNER BEND FILLET GENERATOR ---
    def self.generate_fillet_path(raw_points, radius = 4.0.inch, num_segments = 6)
      return raw_points if raw_points.length < 3 || radius <= 0.01

      smoothed = [raw_points.first]
      (1...(raw_points.length - 1)).each do |i|
        p_prev = raw_points[i - 1]
        p_curr = raw_points[i]
        p_next = raw_points[i + 1]

        v1 = p_prev - p_curr
        v2 = p_next - p_curr
        l1 = v1.length
        l2 = v2.length
        if l1 < 0.5 || l2 < 0.5
          smoothed << p_curr
          next
        end

        u1 = v1.normalize
        u2 = v2.normalize
        dot = u1.dot(u2)

        # Nearly straight or reverse
        if dot < -0.999 || dot > 0.999
          smoothed << p_curr
          next
        end

        half_ang = Math.acos([[dot, -1.0].max, 1.0].min) / 2.0
        tan_len = radius / Math.tan(half_ang)

        # Clamp tangent length so it does not exceed 45% of segment
        max_t = [l1 * 0.45, l2 * 0.45].min
        if tan_len > max_t
          tan_len = max_t
          eff_r = tan_len * Math.tan(half_ang)
        else
          eff_r = radius
        end

        t1 = Geom::Point3d.new(p_curr.x + u1.x * tan_len, p_curr.y + u1.y * tan_len, p_curr.z + u1.z * tan_len)
        t2 = Geom::Point3d.new(p_curr.x + u2.x * tan_len, p_curr.y + u2.y * tan_len, p_curr.z + u2.z * tan_len)

        # Center of fillet circle
        bisector = (u1 + u2).normalize
        dist_to_center = eff_r / Math.sin(half_ang)
        center = Geom::Point3d.new(p_curr.x + bisector.x * dist_to_center, p_curr.y + bisector.y * dist_to_center, p_curr.z + bisector.z * dist_to_center)

        axis = u1.cross(u2).normalize

        smoothed << t1
        # Interpolate arc between t1 and t2 around center
        v_start = t1 - center
        v_end = t2 - center
        total_angle = v_start.angle_between(v_end)

        (1...num_segments).each do |s_i|
          fraction = s_i.to_f / num_segments
          rot_trans = Geom::Transformation.rotation(center, axis, -total_angle * fraction)
          arc_pt = t1.transform(rot_trans)
          smoothed << arc_pt
        end
        smoothed << t2
      end
      smoothed << raw_points.last
      smoothed
    end

    # --- BUILD SOLID 3D RAILING ALONG POINTS WITH DESIGN BEND RADIUS ---
    def self.build_solid_railing_from_points(raw_points, style_idx = 0, height = 42.0, post_spacing = 48.0, profile = "Round Tube", bend_radius_in = 4.0, wall_return = true)
      return if raw_points.nil? || raw_points.length < 2
      model = Sketchup.active_model
      model.start_operation("EVL-Railing: Build 3D Railing with Smooth Radius", true)
      begin
        main_group = model.active_entities.add_group
        main_group.name = "EVL_3D_Railing"
        entities = main_group.entities

        style = STYLES[style_idx] || STYLES[0]
        h_inch = height.to_f.inch
        sp_inch = post_spacing.to_f.inch
        r_bend = bend_radius_in.to_f.inch
        rail_thick = profile == "Square Bar" ? 2.0.inch : 2.25.inch

        # 1. Smooth the path using design fillet radius
        points = generate_fillet_path(raw_points, r_bend)

        # 2. Continuous Top Handrail along the smooth path
        (0...(points.length - 1)).each do |seg_i|
          p1 = points[seg_i]
          p2 = points[seg_i + 1]
          next if p1.distance(p2) < 0.05
          add_3d_box_beam(entities, p1, p2, rail_thick, rail_thick, h_inch - rail_thick)
        end

        # Optional Wall Returns at start & end
        if wall_return && points.length >= 2
          # Start wall return (downward 90 deg)
          p_start = points.first
          v_start = (points[0] - points[1]).normalize
          p_ret_start = Geom::Point3d.new(p_start.x + v_start.x * 3.0.inch, p_start.y + v_start.y * 3.0.inch, p_start.z)
          add_3d_box_beam(entities, p_start, p_ret_start, rail_thick, rail_thick, h_inch - rail_thick)
          p_ret_down = Geom::Point3d.new(p_ret_start.x, p_ret_start.y, p_ret_start.z - 6.0.inch)
          add_3d_box_beam(entities, p_ret_start, p_ret_down, rail_thick, rail_thick, h_inch - rail_thick - 6.0.inch)

          # End wall return
          p_end = points.last
          v_end = (points[-1] - points[-2]).normalize
          p_ret_end = Geom::Point3d.new(p_end.x + v_end.x * 3.0.inch, p_end.y + v_end.y * 3.0.inch, p_end.z)
          add_3d_box_beam(entities, p_end, p_ret_end, rail_thick, rail_thick, h_inch - rail_thick)
          p_ret_end_down = Geom::Point3d.new(p_ret_end.x, p_ret_end.y, p_ret_end.z - 6.0.inch)
          add_3d_box_beam(entities, p_ret_end, p_ret_end_down, rail_thick, rail_thick, h_inch - rail_thick - 6.0.inch)
        end

        # 3. Structural 3D Posts at key vertices + regular intervals
        # Add post at start and end
        dir0 = (points[1] - points[0]).normalize
        perp0 = dir0.cross(Geom::Vector3d.new(0, 0, 1)).normalize rescue Geom::Vector3d.new(0, 1, 0)
        add_3d_post(entities, points.first, 2.0.inch, h_inch - rail_thick, dir0, perp0)

        # Place posts along major straight stretches between original corner points
        (0...(raw_points.length - 1)).each do |r_i|
          rp1 = raw_points[r_i]
          rp2 = raw_points[r_i + 1]
          r_vec = rp2 - rp1
          r_len = r_vec.length
          next if r_len < 2.0.inch
          r_dir = r_vec.normalize
          r_perp = r_dir.cross(Geom::Vector3d.new(0, 0, 1)).normalize rescue Geom::Vector3d.new(0, 1, 0)

          num_p = [(r_len / sp_inch).floor, 1].max
          (1..num_p).each do |pi|
            p_dist = pi * (r_len / (num_p + 1))
            post_pt = Geom::Point3d.new(rp1.x + r_dir.x * p_dist, rp1.y + r_dir.y * p_dist, rp1.z + r_dir.z * p_dist)
            add_3d_post(entities, post_pt, 2.0.inch, h_inch - rail_thick, r_dir, r_perp)
          end
        end

        # Corner posts at bends
        if raw_points.length > 2
          (1...(raw_points.length - 1)).each do |ci|
            c_pt = raw_points[ci]
            c_dir = (raw_points[ci + 1] - raw_points[ci - 1]).normalize rescue Geom::Vector3d.new(1, 0, 0)
            c_perp = c_dir.cross(Geom::Vector3d.new(0, 0, 1)).normalize rescue Geom::Vector3d.new(0, 1, 0)
            add_3d_post(entities, c_pt, 2.25.inch, h_inch - rail_thick, c_dir, c_perp)
          end
        end

        dir_last = (points[-1] - points[-2]).normalize
        perp_last = dir_last.cross(Geom::Vector3d.new(0, 0, 1)).normalize rescue Geom::Vector3d.new(0, 1, 0)
        add_3d_post(entities, points.last, 2.0.inch, h_inch - rail_thick, dir_last, perp_last)

        # 4. Infill according to selected style
        case style[:infill]
        when :glass # 1. Frameless Glass & Spigots
          (0...(raw_points.length - 1)).each do |si|
            add_3d_glass_panel(entities, raw_points[si], raw_points[si + 1], 4.0.inch, h_inch - 2.0.inch, 0.5.inch)
          end

        when :cable # 2. SS Cables (Continuous along smooth smoothed points)
          5.times do |c_i|
            cz = 6.0.inch + (c_i * (h_inch - 10.0.inch) / 4.0)
            (0...(points.length - 1)).each do |seg_i|
              next if points[seg_i].distance(points[seg_i + 1]) < 0.05
              add_3d_box_beam(entities, points[seg_i], points[seg_i + 1], 0.375.inch, 0.375.inch, cz)
            end
          end

        when :scroll # 3. Classical Wrought Iron
          (0...(raw_points.length - 1)).each do |si|
            p1 = raw_points[si]
            p2 = raw_points[si + 1]
            seg_l = p1.distance(p2)
            next if seg_l < 2.0
            add_3d_box_beam(entities, p1, p2, 1.5.inch, 0.75.inch, 3.5.inch)
            num_pickets = [(seg_l / 5.0.inch).floor, 2].max
            add_3d_balusters(entities, p1, p2, num_pickets, 0.75.inch, 3.5.inch, h_inch - rail_thick)
          end

        when :slats # 4. Contemporary Vertical Slats
          (0...(raw_points.length - 1)).each do |si|
            p1 = raw_points[si]
            p2 = raw_points[si + 1]
            seg_l = p1.distance(p2)
            next if seg_l < 2.0
            add_3d_box_beam(entities, p1, p2, 1.5.inch, 0.75.inch, 3.0.inch)
            num_slats = [(seg_l / 4.0.inch).floor, 2].max
            add_3d_balusters(entities, p1, p2, num_slats, 0.8.inch, 3.0.inch, h_inch - rail_thick)
          end

        when :pipe # 5. Industrial Pipe & Fittings
          (0...(points.length - 1)).each do |seg_i|
            next if points[seg_i].distance(points[seg_i + 1]) < 0.05
            add_3d_box_beam(entities, points[seg_i], points[seg_i + 1], 1.75.inch, 1.75.inch, h_inch * 0.5)
          end

        when :timber # 6. Traditional Timber Turned Balusters
          (0...(raw_points.length - 1)).each do |si|
            p1 = raw_points[si]
            p2 = raw_points[si + 1]
            seg_l = p1.distance(p2)
            next if seg_l < 2.0
            add_3d_box_beam(entities, p1, p2, 2.5.inch, 1.0.inch, 3.0.inch)
            num_timber = [(seg_l / 5.0.inch).floor, 2].max
            add_3d_balusters(entities, p1, p2, num_timber, 1.5.inch, 3.0.inch, h_inch - rail_thick)
          end

        when :mesh # 7. Perforated CNC Laser Sheet
          (0...(raw_points.length - 1)).each do |si|
            add_3d_box_beam(entities, raw_points[si], raw_points[si + 1], 1.5.inch, 1.0.inch, 3.5.inch)
            add_3d_glass_panel(entities, raw_points[si], raw_points[si + 1], 3.5.inch, h_inch - rail_thick, 0.25.inch)
          end

        when :glass_wood # 8. Balcony Glass + Timber Cap
          (0...(raw_points.length - 1)).each do |si|
            add_3d_box_beam(entities, raw_points[si], raw_points[si + 1], 2.75.inch, 1.5.inch, h_inch - 1.5.inch)
            add_3d_glass_panel(entities, raw_points[si], raw_points[si + 1], 3.5.inch, h_inch - 2.0.inch, 0.4.inch)
          end

        when :x_brace # 9. Farmhouse X-Brace
          (0...(raw_points.length - 1)).each do |si|
            p1 = raw_points[si]
            p2 = raw_points[si + 1]
            add_3d_box_beam(entities, p1, p2, 2.0.inch, 1.0.inch, 3.5.inch)
            add_3d_box_beam(entities, p1, p2, 1.75.inch, 1.0.inch, (h_inch - rail_thick) * 0.5)
          end

        when :safety # 10. Commercial Safety + Kickplate
          (0...(points.length - 1)).each do |seg_i|
            next if points[seg_i].distance(points[seg_i + 1]) < 0.05
            add_3d_box_beam(entities, points[seg_i], points[seg_i + 1], 1.75.inch, 1.75.inch, 21.0.inch)
            add_3d_box_beam(entities, points[seg_i], points[seg_i + 1], 0.25.inch, 4.0.inch, 0.0)
          end
        end

        model.commit_operation
        UI.messagebox("EVL-Railing: True 3D Solid Railing created successfully!\\nStyle: #{style[:name]}\\nHeight: #{height} in | Corner Radius: #{bend_radius_in} in\\nSmooth Tangent Curve Extrusion Active")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Railing Error: #{e.message}")
      end
    end

    # --- INTERACTIVE CLICK-BY-CLICK DRAWING TOOL (Sketchup::Tool) ---
    class RailingDrawTool
      def initialize(style_idx = 0, height = 42.0, spacing = 48.0, profile = "Round Tube", bend_radius = 4.0, wall_return = true)
        @style_idx = style_idx
        @height = height
        @spacing = spacing
        @profile = profile
        @bend_radius = bend_radius
        @wall_return = wall_return
        @points = []
        @ip = Sketchup::InputPoint.new
        @ip_prev = Sketchup::InputPoint.new
      end

      def activate
        @points = []
        Sketchup.set_status_text("EVL-Railing: Click in 3D viewport to place path points. Double-click or Press Enter to finish. Esc to cancel.")
      end

      def onMouseMove(flags, x, y, view)
        @ip.pick(view, x, y, @ip_prev)
        view.invalidate
      end

      def onLButtonDown(flags, x, y, view)
        @ip.pick(view, x, y, @ip_prev)
        if @ip.valid?
          pt = @ip.position
          @points << pt
          @ip_prev.copy!(@ip)
          Sketchup.set_status_text("Point #{@points.length} placed at #{pt}. Click next point, or double-click / Press Enter to build 3D railing.")
          view.invalidate
        end
      end

      def onLButtonDoubleClick(flags, x, y, view)
        finish_drawing
      end

      def onKeyDown(key, repeat, flags, view)
        if key == 13 # Enter
          finish_drawing
        elsif key == 27 # Esc
          @points.clear
          view.invalidate
          Sketchup.set_status_text("EVL-Railing: Drawing cancelled.")
          Sketchup.active_model.select_tool(nil)
        end
      end

      def draw(view)
        if @points.length > 0
          view.line_width = 4
          view.drawing_color = "red"
          view.draw(GL_LINE_STRIP, @points) if @points.length > 1
          if @ip && @ip.valid?
            view.drawing_color = "blue"
            view.draw(GL_LINES, [@points.last, @ip.position])
          end
          view.draw_points(@points, 8, 1, "green")
        end
      end

      def finish_drawing
        if @points.length < 2
          UI.messagebox("Please click at least 2 points to define the railing path!")
          return
        end
        pts = @points.dup
        @points.clear
        EVLab::Railing.build_solid_railing_from_points(pts, @style_idx, @height, @spacing, @profile, @bend_radius, @wall_return)
        Sketchup.active_model.select_tool(nil)
      end
    end

    def self.order_edges_into_path(edges)
      return [] if edges.empty?
      pts = []
      remaining = edges.map { |e| [e.start.position, e.end.position] }
      first_pair = remaining.shift
      pts << first_pair[0] << first_pair[1]

      while !remaining.empty?
        head = pts.first
        tail = pts.last
        found = false

        remaining.each_with_index do |(p1, p2), idx|
          if (tail - p1).length < 0.1
            pts << p2
            remaining.delete_at(idx)
            found = true
            break
          elsif (tail - p2).length < 0.1
            pts << p1
            remaining.delete_at(idx)
            found = true
            break
          elsif (head - p1).length < 0.1
            pts.unshift(p2)
            remaining.delete_at(idx)
            found = true
            break
          elsif (head - p2).length < 0.1
            pts.unshift(p1)
            remaining.delete_at(idx)
            found = true
            break
          end
        end

        unless found
          next_pair = remaining.shift
          pts << next_pair[0] << next_pair[1]
        end
      end
      pts
    end

    # --- SHOW PREVIEW & SELECTION DIALOG FIRST ---
    def self.show_main_dialog
      dialog = UI::HtmlDialog.new({
        :dialog_title => "EVL-Railing: 10 Styles 3D Railing Generator & Preview",
        :preferences_key => "com.evlab.railing_main",
        :width => 880, :height => 720,
        :resizable => true
      })

      # Style options HTML cards
      cards = []
      STYLES.each do |s|
        cards << "<div class='card' onclick='selectStyle(" + s[:id].to_s + ")' id='card-" + s[:id].to_s + "'><h4>" + s[:name] + "</h4><span class='badge'>Height: " + s[:h].to_s + " in | Post: " + s[:sp].to_s + " in</span></div>"
      end
      style_cards_html = cards.join("\n")

      html_content = "<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0b1120; color: #f1f5f9; padding: 20px; margin: 0; }
    h2 { color: #38bdf8; margin-top: 0; }
    p { color: #94a3b8; font-size: 13px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 5px; }
    .card { background: #1e293b; border: 2px solid #334155; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; }
    .card:hover { border-color: #38bdf8; background: #0f2444; }
    .card.active { border-color: #0284c7; background: #0369a1; }
    .card h4 { margin: 0 0 6px 0; font-size: 14px; color: #fff; }
    .badge { font-size: 11px; background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }
    .controls { display: flex; gap: 15px; margin: 15px 0; background: #1e293b; padding: 12px; border-radius: 8px; font-size: 13px; }
    .controls label { display: flex; flex-direction: column; gap: 4px; color: #cbd5e1; font-weight: bold; }
    .controls select, .controls input { background: #0f172a; border: 1px solid #475569; color: #fff; padding: 6px; border-radius: 4px; }
    .actions { display: flex; gap: 12px; margin-top: 15px; }
    .btn-primary { flex: 1; padding: 12px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; }
    .btn-primary:hover { background: #059669; }
    .btn-secondary { flex: 1; padding: 12px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; }
    .btn-secondary:hover { background: #0369a1; }
  </style>
</head>
<body>
  <h2>EVL-Railing: 3D Railing Generator (10 Architectural Styles)</h2>
  <p>Choose your railing style below, adjust height and spacing, then choose whether to click points interactively in SketchUp or generate along a pre-selected line:</p>
  
  <div class='grid'>" + style_cards_html + "</div>

  <div class='controls'>
    <label>Railing Height:
      <select id='height'>
        <option value='36'>36 inches (Low / Residential)</option>
        <option value='42' selected>42 inches (Standard Safety Code)</option>
        <option value='48'>48 inches (High / Parapet)</option>
      </select>
    </label>
    <label>Post Spacing:
      <select id='spacing'>
        <option value='36'>36 inches (Dense)</option>
        <option value='48' selected>48 inches (Standard)</option>
        <option value='60'>60 inches (Wide)</option>
      </select>
    </label>
    <label>Top Rail Profile:
      <select id='profile'>
        <option value='Round Tube' selected>Round Steel Tube (2 in Dia)</option>
        <option value='Square Bar'>Square Box Section (2x2 in)</option>
        <option value='Molded Timber'>Contoured Wood Cap</option>
      </select>
    </label>
    <label>Corner Bend Radius:
      <select id='bend_radius'>
        <option value='4.0' selected>Smooth Fillet Bend (4 in / 100mm)</option>
        <option value='6.0'>Sweeping Curve (6 in / 150mm)</option>
        <option value='2.5'>Tight Elbow Bend (2.5 in / 65mm)</option>
        <option value='8.0'>Large Radial Curve (8 in / 200mm)</option>
        <option value='0.0'>Sharp Miter Corner (0 in)</option>
      </select>
    </label>
    <label>Wall Return:
      <select id='wall_return'>
        <option value='1' selected>Yes (Smooth 90° Down to Wall/Floor)</option>
        <option value='0'>No (Flush Terminal Cap)</option>
      </select>
    </label>
  </div>

  <div class='actions'>
    <button class='btn-primary' onclick='startClickTool()'>Option 1: Interactive Click Tool</button>
    <button class='btn-secondary' onclick='buildOnSelection()'>Option 2: Build on Selected Path</button>
  </div>

  <script>
    var currentStyle = 0;
    function selectStyle(id) {
      currentStyle = id;
      document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('active'); });
      var el = document.getElementById('card-' + id);
      if (el) el.classList.add('active');
    }
    selectStyle(0);

    function startClickTool() {
      var h = document.getElementById('height').value;
      var sp = document.getElementById('spacing').value;
      var prof = document.getElementById('profile').value;
      var r = document.getElementById('bend_radius').value;
      var wr = document.getElementById('wall_return').value;
      sketchup.activate_tool(currentStyle, h, sp, prof, r, wr);
    }

    function buildOnSelection() {
      var h = document.getElementById('height').value;
      var sp = document.getElementById('spacing').value;
      var prof = document.getElementById('profile').value;
      var r = document.getElementById('bend_radius').value;
      var wr = document.getElementById('wall_return').value;
      sketchup.build_selected(currentStyle, h, sp, prof, r, wr);
    }
  </script>
</body>
</html>"

      dialog.set_html(html_content)

      # Ruby Callbacks from HTML Dialog
      dialog.add_action_callback("activate_tool") do |_action_context, style_id, height, spacing, profile, bend_radius, wall_return|
        dialog.close
        tool = RailingDrawTool.new(style_id.to_i, height.to_f, spacing.to_f, profile.to_s, bend_radius.to_f, wall_return.to_i == 1)
        Sketchup.active_model.select_tool(tool)
      end

      dialog.add_action_callback("build_selected") do |_action_context, style_id, height, spacing, profile, bend_radius, wall_return|
        model = Sketchup.active_model
        edges = []
        model.selection.each do |ent|
          if ent.is_a?(Sketchup::Edge)
            edges << ent
          elsif ent.is_a?(Sketchup::Face)
            edges.concat(ent.outer_loop.edges)
          elsif ent.is_a?(Sketchup::Group)
            edges.concat(ent.entities.grep(Sketchup::Edge))
          elsif ent.is_a?(Sketchup::ComponentInstance)
            edges.concat(ent.definition.entities.grep(Sketchup::Edge))
          end
        end
        edges.uniq!

        if edges.empty?
          UI.messagebox("No path line or face selected! Please select an edge line or face in SketchUp first, OR choose 'Option 1: Interactive Click Tool' to click-to-draw.")
        else
          dialog.close
          points = order_edges_into_path(edges)

          if points.length >= 2
            build_solid_railing_from_points(points, style_id.to_i, height.to_f, spacing.to_f, profile.to_s, bend_radius.to_f, wall_return.to_i == 1)
          else
            UI.messagebox("Could not extract a valid path of at least 2 points from the current selection.")
          end
        end
      end

      dialog.show
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Railing (10 Styles with Preview & 3D Extrusion)") { self.show_main_dialog }
      cmd.tooltip = "EVL-Railing: 3D Solid Railing Generator with Live Preview & Interactive Click Tool"
      cmd.status_bar_text = "Generate true 3D solid railings along path or by manual clicking"
      
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      menu.add_item("EVL-Railing: Interactive Click-to-Draw Tool") {
        tool = RailingDrawTool.new(0, 42.0, 48.0, "Round Tube")
        Sketchup.active_model.select_tool(tool)
      }
      
      file_loaded(__FILE__)
    end
  end
end`,
  },
  {
    id: 'sketchup-evl-rail',
    nameEn: 'EVL-Rail: 3D Railway Track & Sleeper Generator (BG, SG, MG, Dual Gauge)',
    nameBn: 'EVL-Rail: ৩ডি রেলওয়ে ট্র্যাক, স্লিপার ও ব্যালাস্ট জেনারেটর (রেললাইন মেকার)',
    softwareId: 'sketchup',
    version: 'v2.4.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.rbz',
    fileName: 'EVL-Rail.rbz',
    fileSize: '11.8 KB',
    categoryBn: 'রেলওয়ে ইঞ্জিনিয়ারিং ও ৩ডি ট্র্যাক মডেলিং',
    categoryEn: 'Railway Engineering & 3D Track Modeling',
    shortSummaryBn: 'স্কেচআপে ২ভাবে রেল ট্র্যাক তৈরি করুন: ক্লিক করে করে পয়েন্ট বসিয়ে অথবা লাইন সিলেক্ট করে। বাস্তব ইমেজ প্রিভিউসহ ব্রডগেজ (BG), ডুয়েলগেজ, স্ট্যান্ডার্ডগেজ (SG) ও মিটারগেজ (MG) ট্র্যাক এবং স্লিপার তৈরি করুন।',
    shortSummaryEn: 'Build 3D railway tracks in SketchUp with 2 drawing modes: interactive click-by-click survey point layout or selecting an existing alignment line, backed by photorealistic render previews.',
    purposeBn: 'রেলওয়ে ইনফ্রাস্ট্রাকচার, স্টেশন ইয়ার্ড, ব্রিজ সংযোগ এবং মেট্রোরেল প্রকল্পে নিখুঁত ৩ডি ট্র্যাক তৈরি করতে ২টি অপশন রয়েছে: (১) ক্যানভাসে ক্লিক করে করে পয়েন্ট বসিয়ে সরাসরি ট্র্যাকের বাঁক ও পথ তৈরি করা অথবা (২) পূর্বে আঁকা লাইন বা কার্ভ পাথ সিলেক্ট করে ১-ক্লিকে ৩ডি রেল ট্র্যাক তৈরি করা। এতে রয়েছে প্রতিটি গেজের বাস্তবসম্মত ইমেজ প্রিভিউ, স্ট্যান্ডার্ড ব্রডগেজ (১৬৭৬ মিমি), ডুয়েলগেজ (৩-রেল), স্ট্যান্ডার্ডগেজ (১৪৩৫ মিমি) ও মিটারগেজ (১০০০ মিমি) এবং কংক্রিট স্লিপার ও ব্যালাস্ট বেড।',
    purposeEn: 'EVL-Rail provides two powerful railway layout workflows in SketchUp: (1) Interactive Click-by-Click survey point alignment, and (2) Select Existing Line edge path for instant 3D track extrusion. Features photorealistic image previews across all 4 gauge systems (Broad Gauge 1676mm, Dual Gauge, Standard Gauge 1435mm, and Meter Gauge 1000mm) with authentic UIC-60 rail profiles and PSC concrete sleepers.',
    highlightsBn: [
      '২টি ড্রয়িং অপশন: (১) ক্লিক করে করে ট্র্যাকের বাঁক ও পয়েন্ট ড্র (Click-by-Click Layout), (২) পূর্বে আঁকা লাইন সিলেক্ট করে ড্র (Select Alignment Line)',
      '৪টি প্রধান রেলওয়ে গেজের বাস্তবসম্মত হাই-রেজ্যুলেশন ইমেজ প্রিভিউ (Photorealistic Render Preview)',
      'ব্রডগেজ (BG ১৬৭৬ মিমি), ডুয়েলগেজ (৩-রেল ব্যবস্থা), স্ট্যান্ডার্ডগেজ (SG ১৪৩৫ মিমি মেট্রোরেল) ও মিটারগেজ (MG ১০০০ মিমি)',
      'প্রকৃত UIC-60 ও 52kg Vignoles স্টিল রেল প্রফাইল (Head, Web, Foot ও মসৃণ রানিং ক্রাউন)',
      'প্রিস্ট্রেসড কংক্রিট (PSC) বা টিম্বার স্লিপার এবং প্যানড্রোল ইলাস্টিক ক্লিপ অটো অ্যারে',
      '১:১.৫ স্লোপ বিশিষ্ট ট্রাপিজয়েডাল ক্রাশড স্টোন ব্যালাস্ট এমব্যাঙ্কমেন্ট (Ballast Bed)',
      'স্ট্যান্ডার্ড .rbz ফরম্যাট, SketchUp Extension Manager দিয়ে সরাসরি ১-ক্লিকে ইনস্টলযোগ্য',
    ],
    highlightsEn: [
      'Dual Drawing Options: (1) Interactive Click-by-Click survey point layout, and (2) Select Existing Line for instant 3D extrusion',
      'Photorealistic Image Previews for all 4 railway gauge systems directly inside the extension',
      '4 Standard Gauge Systems: Broad Gauge (1676mm), Dual Gauge (3-rail), Standard Gauge (1435mm Metro), and Meter Gauge (1000mm)',
      'Authentic UIC-60 / 52kg Vignoles steel rail 3D profiles with extruded head, web, and foot',
      'Prestressed concrete (PSC) or hardwood timber sleepers with Pandrol elastic rail fasteners',
      'Trapezoidal crushed-stone ballast bed option with 1:1.5 shoulder slope',
      'Clean native .rbz extension installable via SketchUp Extension Manager',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Rail.rbz ডাউনলোড করুন',
        titleEn: 'Download EVL-Rail.rbz',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Rail.rbz ফাইলটি আপনার কম্পিউটারে সেভ করুন।',
        instructionEn: 'Click the Download button to save EVL-Rail.rbz to your PC.',
      },
      {
        stepNumber: 2,
        titleBn: 'Extension Manager খুলুন',
        titleEn: 'Open Extension Manager',
        instructionBn: 'SketchUp-এর মেনু থেকে Extensions > Extension Manager-এ ক্লিক করুন।',
        instructionEn: 'In Trimble SketchUp, open Extensions > Extension Manager from the top menu.',
      },
      {
        stepNumber: 3,
        titleBn: 'Install Extension দিন',
        titleEn: 'Install Extension',
        instructionBn: 'উইন্ডোর নিচে Install Extension বাটনে ক্লিক করে EVL-Rail.rbz সিলেক্ট করুন।',
        instructionEn: 'Click the Install Extension button at the bottom and choose EVL-Rail.rbz.',
      },
      {
        stepNumber: 4,
        titleBn: 'পাথ সিলেক্ট করে রেল ট্র্যাক ড্র করুন',
        titleEn: 'Select Alignment & Generate Track',
        instructionBn: 'যেকোনো রেলওয়ে অ্যালাইনমেন্ট লাইন সিলেক্ট করে Extensions > EVLab Tools > EVL-Rail (Rail Track) রান করুন। গেজ, স্লিপার ও ব্যালাস্ট পছন্দ করে ৩ডি ট্র্যাক তৈরি করুন।',
        instructionEn: 'Select any track alignment curve or edge, click Extensions > EVLab Tools > EVL-Rail (Rail Track), choose gauge and sleeper parameters, and generate 3D track.',
      },
    ],
    quickCommand: 'Extensions > EVLab Tools > EVL-Rail (Rail Track)',
    compatibilityBn: 'Trimble SketchUp 2019 - 2026',
    compatibilityEn: 'Trimble SketchUp 2019 - 2026',
    rawCodeSnippet: `# =========================================================================
# EVLab Plugin Hub - EVL-Rail: 3D Railway Track & Sleeper Generator
# Broad Gauge (1676mm), Standard Gauge (1435mm), Meter Gauge (1000mm), Dual Gauge
# File: evlab_rail.rb
# =========================================================================
require 'sketchup.rb'

module EVLab
  module RailTrack
    GAUGES = [
      { id: 0, name: "Broad Gauge (1676 mm / 5 ft 6 in - Bangladesh/India)", mm: 1676.0 },
      { id: 1, name: "Dual Gauge (BG + MG 3-Rail System)", mm: 1676.0, dual: true },
      { id: 2, name: "Standard Gauge (1435 mm / 4 ft 8.5 in - Metro/HSR)", mm: 1435.0 },
      { id: 3, name: "Meter Gauge (1000 mm / 3 ft 3.37 in - Regional)", mm: 1000.0 }
    ]

    SLEEPER_TYPES = [
      "Prestressed Concrete (PSC - 2.75m)",
      "Treated Hardwood Tie (Timber)",
      "Steel Trough Sleeper"
    ]

    def self.get_or_create_mat(model, name, r, g, b, alpha = 1.0)
      mat = model.materials[name]
      unless mat
        mat = model.materials.add(name)
        mat.color = Sketchup::Color.new(r, g, b)
        mat.alpha = alpha if alpha < 1.0
      end
      mat
    end

    def self.build_track_from_points(points, gauge_idx = 0, sleeper_choice = SLEEPER_TYPES[0], spacing_mm = 600, include_ballast = true)
      return if points.nil? || points.length < 2
      model = Sketchup.active_model
      model.start_operation("EVL-Rail: Generate Railway Track", true)
      begin
        main_group = model.active_entities.add_group
        main_group.name = "EVL_Railway_Track"

        gauge_info = GAUGES[gauge_idx] || GAUGES[0]
        gauge_width = (gauge_info[:mm] / 25.4).inch
        is_dual_gauge = gauge_info[:dual] == true
        mg_offset = (1000.0 / 25.4).inch
        sleeper_spacing = (spacing_mm.to_f / 25.4).inch

        (0...(points.length - 1)).each do |seg_i|
          p1 = points[seg_i]
          p2 = points[seg_i + 1]
          vec = p2 - p1
          len = vec.length
          next if len < 2.0
          dir = vec.normalize
          raw_perp = Geom::Vector3d.new(-dir.y, dir.x, 0)
          perp = raw_perp.length > 0.001 ? raw_perp.normalize : Geom::Vector3d.new(1, 0, 0)

          # 1. Ballast Bed (True 3D Solid Trapezoidal Prism)
          if include_ballast
            ballast_grp = main_group.entities.add_group
            ballast_grp.name = "Ballast_Bed"
            top_width = gauge_width + 48.inch
            bot_width = top_width + 36.inch
            ballast_h = 12.inch
            htw = top_width / 2.0
            hbw = bot_width / 2.0

            # Cross-section at p1
            t1_l = Geom::Point3d.new(p1.x + perp.x * htw, p1.y + perp.y * htw, p1.z)
            t1_r = Geom::Point3d.new(p1.x - perp.x * htw, p1.y - perp.y * htw, p1.z)
            b1_r = Geom::Point3d.new(p1.x - perp.x * hbw, p1.y - perp.y * hbw, p1.z - ballast_h)
            b1_l = Geom::Point3d.new(p1.x + perp.x * hbw, p1.y + perp.y * hbw, p1.z - ballast_h)

            # Cross-section at p2
            t2_l = Geom::Point3d.new(p2.x + perp.x * htw, p2.y + perp.y * htw, p2.z)
            t2_r = Geom::Point3d.new(p2.x - perp.x * htw, p2.y - perp.y * htw, p2.z)
            b2_r = Geom::Point3d.new(p2.x - perp.x * hbw, p2.y - perp.y * hbw, p2.z - ballast_h)
            b2_l = Geom::Point3d.new(p2.x + perp.x * hbw, p2.y + perp.y * hbw, p2.z - ballast_h)

            # Create 6 faces of the 3D solid ballast prism
            ballast_grp.entities.add_face(t1_l, t1_r, t2_r, t2_l) # top
            ballast_grp.entities.add_face(b1_l, b2_l, b2_r, b1_r) # bottom
            ballast_grp.entities.add_face(t1_l, t2_l, b2_l, b1_l) # left slope
            ballast_grp.entities.add_face(t1_r, b1_r, b2_r, t2_r) # right slope
            ballast_grp.entities.add_face(t1_l, b1_l, b1_r, t1_r) # start cap
            ballast_grp.entities.add_face(t2_l, t2_r, b2_r, b2_l) # end cap

            ballast_grp.material = get_or_create_mat(model, "EVL_Ballast_Stone", 120, 120, 125)
          end

          # 2. Sleepers (Seated directly on top of ballast bed, zero vertical gap)
          sleepers_grp = main_group.entities.add_group
          sleepers_grp.name = "Track_Sleepers"
          sleeper_len = gauge_width + 24.inch
          sleeper_w = 10.inch
          sleeper_h = 8.inch
          hsl = sleeper_len / 2.0
          hsw = sleeper_w / 2.0
          count = [(len / sleeper_spacing).floor, 1].max
          (0..count).each do |s_idx|
            ratio = s_idx.to_f / count
            cx = p1.x + (p2.x - p1.x) * ratio
            cy = p1.y + (p2.y - p1.y) * ratio
            cz = p1.z + (p2.z - p1.z) * ratio
            s_p1 = Geom::Point3d.new(cx + perp.x * hsl - dir.x * hsw, cy + perp.y * hsl - dir.y * hsw, cz)
            s_p2 = Geom::Point3d.new(cx - perp.x * hsl - dir.x * hsw, cy - perp.y * hsl - dir.y * hsw, cz)
            s_p3 = Geom::Point3d.new(cx - perp.x * hsl + dir.x * hsw, cy - perp.y * hsl + dir.y * hsw, cz)
            s_p4 = Geom::Point3d.new(cx + perp.x * hsl + dir.x * hsw, cy + perp.y * hsl + dir.y * hsw, cz)
            s_face = sleepers_grp.entities.add_face(s_p1, s_p2, s_p3, s_p4)
            if s_face && s_face.valid?
              s_face.reverse! if s_face.normal.z < 0
              s_face.pushpull(sleeper_h)
            end
          end
          sleeper_mat = (sleeper_choice.include?("Timber")) ? get_or_create_mat(model, "EVL_Timber_Sleeper", 85, 50, 30) : get_or_create_mat(model, "EVL_Concrete_Sleeper", 185, 185, 190)
          sleepers_grp.material = sleeper_mat

          # 3. Rails (Seated on top of sleeper height)
          rails_grp = main_group.entities.add_group
          rails_grp.name = "Track_Rails"
          rail_base_z = sleeper_h
          rail_h = 6.0.inch
          rail_w = 2.5.inch
          hw = rail_w / 2.0
          offsets = [-(gauge_width / 2.0), (gauge_width / 2.0)]
          offsets << (-(gauge_width / 2.0) + mg_offset) if is_dual_gauge

          offsets.each do |off|
            rc1 = Geom::Point3d.new(p1.x + perp.x * (off + hw), p1.y + perp.y * (off + hw), p1.z + rail_base_z)
            rc2 = Geom::Point3d.new(p1.x + perp.x * (off - hw), p1.y + perp.y * (off - hw), p1.z + rail_base_z)
            rc3 = Geom::Point3d.new(p2.x + perp.x * (off - hw), p2.y + perp.y * (off - hw), p2.z + rail_base_z)
            rc4 = Geom::Point3d.new(p2.x + perp.x * (off + hw), p2.y + perp.y * (off + hw), p2.z + rail_base_z)
            rf = rails_grp.entities.add_face(rc1, rc2, rc3, rc4)
            if rf && rf.valid?
              rf.reverse! if rf.normal.z < 0
              rf.pushpull(rail_h)
            end
          end
          rails_grp.material = get_or_create_mat(model, "EVL_Steel_Rail", 60, 65, 75)
        end

        model.commit_operation
        UI.messagebox("EVL-Rail: 3D Railway Track created successfully!\\nGauge: #{gauge_info[:name]}")
      rescue => e
        model.abort_operation
        UI.messagebox("EVL-Rail Error: #{e.message}")
      end
    end

    # --- INTERACTIVE CLICK-BY-CLICK TRACK DRAW TOOL ---
    class RailTrackDrawTool
      def initialize(gauge_idx = 0)
        @gauge_idx = gauge_idx
        @points = []
        @ip = Sketchup::InputPoint.new
        @ip_prev = Sketchup::InputPoint.new
      end

      def activate
        @points = []
        Sketchup.set_status_text("EVL-Rail: Click on terrain to place alignment points. Double-click or Press Enter to build 3D Railway Track.")
      end

      def onMouseMove(flags, x, y, view)
        @ip.pick(view, x, y, @ip_prev)
        view.invalidate
      end

      def onLButtonDown(flags, x, y, view)
        @ip.pick(view, x, y, @ip_prev)
        if @ip.valid?
          pt = @ip.position
          @points << pt
          @ip_prev.copy!(@ip)
          Sketchup.set_status_text("Track Point #{@points.length} placed. Click next point or Press Enter to finish.")
          view.invalidate
        end
      end

      def onLButtonDoubleClick(flags, x, y, view)
        finish_track
      end

      def onKeyDown(key, repeat, flags, view)
        if key == 13 # Enter
          finish_track
        elsif key == 27 # Esc
          @points.clear
          view.invalidate
          Sketchup.set_status_text("Cancelled track drawing.")
          Sketchup.active_model.select_tool(nil)
        end
      end

      def draw(view)
        if @points.length > 0
          view.line_width = 4
          view.drawing_color = "orange"
          view.draw(GL_LINE_STRIP, @points) if @points.length > 1
          if @ip && @ip.valid?
            view.drawing_color = "yellow"
            view.draw(GL_LINES, [@points.last, @ip.position])
          end
          view.draw_points(@points, 8, 1, "red")
        end
      end

      def finish_track
        if @points.length < 2
          UI.messagebox("Please click at least 2 points to define the track alignment!")
          return
        end
        pts = @points.dup
        @points.clear
        EVLab::RailTrack.build_track_from_points(pts, @gauge_idx)
        Sketchup.active_model.select_tool(nil)
      end
    end

    def self.order_track_edges(edges)
      return [] if edges.empty?
      pts = []
      remaining = edges.map { |e| [e.start.position, e.end.position] }
      first_pair = remaining.shift
      pts << first_pair[0] << first_pair[1]

      while !remaining.empty?
        head = pts.first
        tail = pts.last
        found = false

        remaining.each_with_index do |(p1, p2), idx|
          if (tail - p1).length < 0.1
            pts << p2
            remaining.delete_at(idx)
            found = true
            break
          elsif (tail - p2).length < 0.1
            pts << p1
            remaining.delete_at(idx)
            found = true
            break
          elsif (head - p1).length < 0.1
            pts.unshift(p2)
            remaining.delete_at(idx)
            found = true
            break
          elsif (head - p2).length < 0.1
            pts.unshift(p1)
            remaining.delete_at(idx)
            found = true
            break
          end
        end

        unless found
          next_pair = remaining.shift
          pts << next_pair[0] << next_pair[1]
        end
      end
      pts
    end

    def self.show_track_dialog
      dialog = UI::HtmlDialog.new({
        :dialog_title => "EVL-Rail: 3D Railway Track Generator",
        :preferences_key => "com.evlab.rail_track",
        :width => 780, :height => 620
      })
      html = <<-HTML_TRACK
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0b1120; color: #fff; padding: 20px; margin: 0; }
    h2 { color: #f59e0b; margin-top: 0; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; }
    .card.active { border-color: #f59e0b; background: #3b2a0c; }
    .btn { padding: 12px 18px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-right: 10px; }
    .btn-primary { background: #10b981; color: #fff; }
    .btn-secondary { background: #f59e0b; color: #000; }
  </style>
</head>
<body>
  <h2>EVL-Rail: 3D Track & Sleeper Generator</h2>
  <p>Select Gauge & Drawing Mode:</p>
  <div class='card active' onclick='setGauge(0)' id='g-0'>Broad Gauge (1676 mm / 5 ft 6 in - BG)</div>
  <div class='card' onclick='setGauge(1)' id='g-1'>Dual Gauge (BG + MG 3-Rail System)</div>
  <div class='card' onclick='setGauge(2)' id='g-2'>Standard Gauge (1435 mm / 4 ft 8.5 in - Metro/HSR)</div>
  <div class='card' onclick='setGauge(3)' id='g-3'>Meter Gauge (1000 mm / 3 ft 3.37 in - Regional)</div>

  <div style='margin-top: 20px;'>
    <button class='btn btn-primary' onclick='startClick()'>Option 1: Click-by-Click Tool</button>
    <button class='btn btn-secondary' onclick='buildSelected()'>Option 2: Build on Selected Line</button>
  </div>

  <script>
    var curG = 0;
    function setGauge(idx) {
      curG = idx;
      document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('active'); });
      document.getElementById('g-' + idx).classList.add('active');
    }
    function startClick() { sketchup.click_tool(curG); }
    function buildSelected() { sketchup.build_line(curG); }
  </script>
</body>
</html>
HTML_TRACK
      dialog.set_html(html)

      dialog.add_action_callback("click_tool") do |_ctx, g_idx|
        dialog.close
        tool = RailTrackDrawTool.new(g_idx.to_i)
        Sketchup.active_model.select_tool(tool)
      end

      dialog.add_action_callback("build_line") do |_ctx, g_idx|
        model = Sketchup.active_model
        edges = []
        model.selection.each do |ent|
          if ent.is_a?(Sketchup::Edge)
            edges << ent
          elsif ent.is_a?(Sketchup::Face)
            edges.concat(ent.outer_loop.edges)
          elsif ent.is_a?(Sketchup::Group)
            edges.concat(ent.entities.grep(Sketchup::Edge))
          elsif ent.is_a?(Sketchup::ComponentInstance)
            edges.concat(ent.definition.entities.grep(Sketchup::Edge))
          end
        end
        edges.uniq!

        if edges.empty?
          UI.messagebox("No line or path selected! Please select an alignment edge or face in SketchUp, OR choose 'Option 1: Click-by-Click Tool'.")
        else
          dialog.close
          pts = order_track_edges(edges)
          if pts.length >= 2
            build_track_from_points(pts, g_idx.to_i)
          else
            UI.messagebox("Could not extract a valid path of at least 2 points from the selected geometry.")
          end
        end
      end

      dialog.show
    end

    unless file_loaded?(__FILE__)
      cmd = UI::Command.new("EVL-Rail (Rail Track & Sleepers)") { self.show_track_dialog }
      cmd.tooltip = "EVL-Rail: 3D Railway Track Generator (BG, SG, MG, Dual Gauge)"
      cmd.status_bar_text = "Extrude 3D railway lines with sleepers, ballast, and UIC-60 rails"
      
      menu = UI.menu("Extensions").add_submenu("EVLab Tools")
      menu.add_item(cmd)
      menu.add_item("EVL-Rail: Interactive Survey Click Tool") {
        tool = RailTrackDrawTool.new(0)
        Sketchup.active_model.select_tool(tool)
      }
      
      file_loaded(__FILE__)
    end
  end
end`,
  },
  {
    id: 'revit-evl-roomtagger',
    nameEn: 'EVL-RoomTagger: Auto Room Detector & Area Scheduler',
    nameBn: 'EVL-RoomTagger: স্বয়ংক্রিয় রুম ট্যাগিং ও ক্ষেত্রফল শিডিউলার',
    softwareId: 'revit',
    version: 'v3.2.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.dyn',
    fileName: 'EVL-RoomTagger.dyn',
    fileSize: '14.8 KB',
    categoryBn: 'BIM ও অটোমেশন',
    categoryEn: 'BIM & Automation Script',
    shortSummaryBn: 'প্রজেক্টের শত শত রুমের নাম ও স্কয়ারফিট মাপ ম্যানুয়ালি বসানোর দিন শেষ। ১ ক্লিকেই পুরো ফ্লোরের সব রুমে সঠিক ট্যাগ ও হিসাব বসে যাবে।',
    shortSummaryEn: 'Automate room boundary detection, tag placements, and square-footage schedules across entire Revit floor plans via Dynamo Player.',
    purposeBn: 'রেভিট আর্কিটেকচারাল প্রজেক্টে প্রতিটি রুমে আলাদাভাবে ক্লিক করে নাম দেওয়া এবং এরিয়া হিসাব করা অনেক সময় অপচয় করে। এই স্ক্রিপ্টটি স্বয়ংক্রিয়ভাবে রুম বাউন্ডারি শনাক্ত করে সেন্টারে ট্যাগ ও সঠিক মাপ বসিয়ে দেয়।',
    purposeEn: 'Manually placing room elements and area tags room-by-room on large multi-story Revit BIM projects is redundant and slow. This Dynamo script scans architectural wall boundaries and automatically places centered room names, numbers, and live area tags.',
    highlightsBn: [
      'এক রানে পুরো ফ্লোর প্ল্যানে স্বয়ংক্রিয় রুম এলিমেন্ট তৈরি ও ট্যাগ প্লেসমেন্ট',
      'রুমের বর্গফুট (sqft) বা বর্গমিটার (sqm) স্বয়ংক্রিয় হিসাব ও ট্যাগ প্রদর্শন',
      'Revit Dynamo Player থেকে কোনো কোডিং ছাড়া সরাসরি এক ক্লিকে চালানো যায়',
      'মিসিং বাউন্ডারি বা ডুপ্লিকেট রুম ওয়ার্নিং স্বয়ংক্রিয়ভাবে চিহ্নিত করে',
    ],
    highlightsEn: [
      'Detects all enclosed spaces and places Room elements and tags in a single batch',
      'Live dynamic area recalculations in square-feet or square-meters',
      'Runs directly inside native Revit Dynamo Player with zero scripting required',
      'Flags unclosed boundaries or duplicate room tags automatically',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'ডায়নামো স্ক্রিপ্টটি ডাউনলোড করুন',
        titleEn: 'Download EVL-RoomTagger.dyn',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-RoomTagger.dyn ফাইলটি সেভ করুন।',
        instructionEn: 'Click Download to save EVL-RoomTagger.dyn to your computer.',
      },
      {
        stepNumber: 2,
        titleBn: 'Revit-এ Dynamo Player খুলুন',
        titleEn: 'Open Dynamo Player in Revit',
        instructionBn: 'Revit-এর Manage মেনুতে গিয়ে ডানপাশে Dynamo Player আইকনে ক্লিক করুন।',
        instructionEn: 'In Autodesk Revit, go to the Manage tab and click Dynamo Player.',
      },
      {
        stepNumber: 3,
        titleBn: 'ফোল্ডারটি ব্রাউজ করুন',
        titleEn: 'Browse Folder',
        instructionBn: 'ডায়নামো প্লেয়ারের ফোল্ডার আইকন চাপ দিয়ে যেখানে ফাইলটি রেখেছেন তা সিলেক্ট করুন।',
        instructionEn: 'Click the browse folder icon in Dynamo Player and select your download directory.',
      },
      {
        stepNumber: 4,
        titleBn: 'EVL-RoomTagger Play বাটনে চাপুন',
        titleEn: 'Click Play on EVL-RoomTagger',
        instructionBn: 'স্ক্রিপ্টটির পাশের Play বাটন চাপলেই সব রুমে এক ক্লিকে ট্যাগ বসে যাবে।',
        instructionEn: 'Press the green Play button next to EVL-RoomTagger to auto-tag every room instantly.',
      },
    ],
    quickCommand: 'Manage Tab > Dynamo Player > EVL-RoomTagger',
    compatibilityBn: 'Autodesk Revit 2021 - 2026',
    compatibilityEn: 'Autodesk Revit 2021 - 2026',
    rawCodeSnippet: `{
  "Uuid": "c4b8e21a-7b3e-4d69-92c1-840f317b9df0",
  "IsCustomNode": false,
  "Description": "EVLab Plugin Hub - Autodesk Revit Auto Room Tagger & Area Calculator (EVL-RoomTagger)",
  "Name": "EVL-RoomTagger",
  "ElementResolver": { "ResolutionMap": {} },
  "Inputs": [
    { "Id": "d01", "Name": "Active Level Only", "Type": "boolean", "Value": "true" }
  ],
  "Outputs": [
    { "Id": "o01", "Name": "Tagged Rooms Count", "Type": "number" },
    { "Id": "o02", "Name": "Total Floor Area", "Type": "number" }
  ],
  "Nodes": [
    {
      "ConcreteType": "Dynamo.Graph.Nodes.CustomNodes.Function, DynamoCore",
      "FunctionSignature": "Revit.Elements.Room.ByLevelAndCenterPoint",
      "FunctionType": "DesignScriptBuiltInFunction",
      "Id": "node-01",
      "Title": "EVLab Scan & Place Room Tags"
    }
  ]
}`,
  },
  {
    id: 'civil3d-evl-cutfill',
    nameEn: 'EVL-CutFill: Quick Earthwork Cut & Fill Estimator',
    nameBn: 'EVL-CutFill: মাটিকাটা ও ভরাট আয়তন গণনাকারী (লিস্প)',
    softwareId: 'civil3d',
    version: 'v2.1.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-CutFill.lsp',
    fileSize: '5.1 KB',
    categoryBn: 'ভূমি উন্নয়ন ও আর্থওয়ার্ক',
    categoryEn: 'Land Grading & Earthwork',
    shortSummaryBn: 'রাস্তা ও প্লট উন্নয়নে বিদ্যমান জমি ও প্রস্তাবিত ডিজাইনের মধ্যে মাটি কাটা (Cut) এবং ভরাটের (Fill) মোট ভলিউম মুহূর্তেই বের করুন।',
    shortSummaryEn: 'Calculate exact earthwork cut & fill volumes, elevation differences, and reports in cubic-meters and CFT for road and site grading.',
    purposeBn: 'সিভিল ইঞ্জিনিয়ারিংয়ে জমি ভরাট বা লেভেলিং প্রজেক্টে এক্সিস্টিং গ্রাউন্ড এবং ফিনিশড গ্রাউন্ডের কাট ও ফিলের হিসাব বের করতে জটিল সময়সাপেক্ষ কাজ করতে হয়। এই প্লাগিনটি তাৎক্ষণিক কাট ও ফিল ভলিউম এবং সিএফটি হিসাব বের করে দেয়।',
    purposeEn: 'Performing earthwork grading calculations between existing natural terrain and proposed design levels manually is complex. This tool calculates cut volume, fill volume, and conversion to CFT in a structured summary instantly.',
    highlightsBn: [
      'সিভিল ড্রয়িংয়ে কাট (Cut) এবং ফিল (Fill) ভলিউম দ্রুত হিসাব',
      'ঘনমিটার (m³) এবং সিএফটি (CFT) উভয় এককে স্বয়ংক্রিয় রূপান্তর',
      'স্ক্রিনে তাৎক্ষণিক ফলাফল প্রদর্শন ও ড্রাফটিং সাপোর্ট',
      'রাস্তা, বাঁধ এবং হাউজিং প্লট উন্নয়নের জন্য অপরিহার্য',
    ],
    highlightsEn: [
      'Calculates both excavation (Cut) and embankment (Fill) volumes',
      'Instant dual unit conversions: Cubic Meters (m³) and Cubic Feet (CFT)',
      'Immediate alert dialog and command-line summary table output',
      'Essential for road alignments, plot leveling, and civil site work',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-CutFill ডাউনলোড করুন',
        titleEn: 'Download EVL-CutFill.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-CutFill.lsp ফাইলটি সেভ করুন।',
        instructionEn: 'Click Download to save EVL-CutFill.lsp onto your drive.',
      },
      {
        stepNumber: 2,
        titleBn: 'Civil 3D-তে লোড করুন',
        titleEn: 'Load into Civil 3D',
        instructionBn: 'Civil 3D-তে APPLOAD কমান্ড লিখে ফাইলটি সিলেক্ট করে Load দিন।',
        instructionEn: 'Type APPLOAD in Civil 3D command line and click Load on this file.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'EVL-CutFill কমান্ড চালু করুন',
        titleEn: 'Execute EVL-CutFill',
        instructionBn: 'কমান্ড লাইনে EVL-CutFill (বা CUTFIL) লিখে Enter দিন।',
        instructionEn: 'Type EVL-CutFill (or CUTFIL) in command line and press Enter.',
        command: 'EVL-CutFill',
      },
      {
        stepNumber: 4,
        titleBn: 'লেভেল ইনপুট দিন',
        titleEn: 'Input Elevations',
        instructionBn: 'বিদ্যমান ও ডিজাইন লেভেল লিখলেই সরাসরি ভলিউম রিপোর্ট চলে আসবে।',
        instructionEn: 'Enter plot area, natural ground level, and design elevation to get volumes.',
      },
    ],
    quickCommand: 'EVL-CutFill',
    compatibilityBn: 'AutoCAD Civil 3D 2018 - 2026',
    compatibilityEn: 'AutoCAD Civil 3D 2018 - 2026',
    rawCodeSnippet: `;; =========================================================================
;; EVLab Plugin Hub - AutoCAD Civil 3D Quick Cut-Fill Estimator (EVL-CutFill.lsp)
;; Commands: EVL-CutFill or CUTFIL
;; =========================================================================
(defun c:evl-cutfil (/ area ex_elev des_elev diff cut_vol fill_vol)
  (princ "\\n[EVLab Civil 3D] --- Quick Cut-Fill Earthwork Estimator (EVL-CutFill) ---")
  (setq area (getreal "\\nEnter plot area (Sq.m): "))
  (if (and area (> area 0))
    (progn
      (setq ex_elev (getreal "\\nExisting Ground Level (meters): "))
      (setq des_elev (getreal "\\nProposed Design Level (meters): "))
      (setq diff (- des_elev ex_elev))
      (if (> diff 0)
        (progn
          (setq fill_vol (* area diff))
          (setq cut_vol 0.0)
          (alert (strcat "EVLab Earthwork Report (EVL-CutFill)\\n"
                         "-------------------------------------\\n"
                         "Status: FILL REQUIRED\\n"
                         "Height Diff: " (rtos diff 2 3) " m\\n"
                         "Total Fill Volume: " (rtos fill_vol 2 2) " m³\\n"
                         "CFT Conversion: " (rtos (* fill_vol 35.3147) 2 2) " cft"))
        )
        (progn
          (setq cut_vol (* area (abs diff)))
          (setq fill_vol 0.0)
          (alert (strcat "EVLab Earthwork Report (EVL-CutFill)\\n"
                         "-------------------------------------\\n"
                         "Status: CUT REQUIRED\\n"
                         "Cut Depth: " (rtos (abs diff) 2 3) " m\\n"
                         "Total Cut Volume: " (rtos cut_vol 2 2) " m³\\n"
                         "CFT Conversion: " (rtos (* cut_vol 35.3147) 2 2) " cft"))
        )
      )
    )
    (princ "\\nInvalid plot area input.")
  )
  (princ)
)
(defun c:cutfil () (c:evl-cutfil))
(princ "\\n>>> EVLab Civil 3D EVL-CutFill Loaded! Type 'EVL-CutFill' or 'CUTFIL'. <<<")
(princ)`,
  },
];

export const PLUGINS_DATA: PluginItem[] = [
  ...CORE_PLUGINS_DATA,
  ...EXTRA_SKETCHUP_PLUGINS,
  ...BUILDING_PLUGINS,
  ...CIVIL_PLUGINS,
  ...PLANT_AND_MEP_PLUGINS,
  ...AUTOCAD_PLUGINS,
];

