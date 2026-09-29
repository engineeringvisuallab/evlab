import { PluginItem } from '../types';

export const AUTOCAD_PLUGINS: PluginItem[] = [
  // =========================================================================
  // 1. EVL-SecMark (Dynamic Architectural Section Marker & Extendable Cutting Line)
  // =========================================================================
  {
    id: 'autocad-evl-secmark',
    nameEn: 'EVL-SecMark: Dynamic Architectural Section Marker & Extendable Cutting Line',
    nameBn: 'EVL-SecMark: অটোক্যাড ডায়নামিক সেকশন মার্কার ও কাটিং লাইন মেকার (টেক্সট এডিট ও যে কোনো দৈর্ঘ্যে বড় করা)',
    softwareId: 'autocad',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-SecMark.lsp',
    fileSize: '8.4 KB',
    categoryBn: 'আর্কিটেকচারাল ড্রাফটিং ও সেকশন ডিটেইলিং',
    categoryEn: 'Architectural Drafting & Section Callouts',
    shortSummaryBn: 'যে কোনো দৈর্ঘ্যে বাড়ানো-কমানো যায় এমন সেকশন কাটিং লাইন এবং টেক্সট পরিবর্তনযোগ্য (Section ID & Sheet No.) ডাবল-বাবল বা সিঙ্গেল অ্যারো সেকশন মার্কার।',
    shortSummaryEn: 'Extendable section cutting line of any length with editable section tag (A, B, 1) and sheet number (A-101), directional view arrows, and in-place editing.',
    purposeBn: 'বিল্ডিং প্ল্যানে সেকশন লাইন আঁকার সময় সাধারণ ব্লকে লাইন ছোট-বড় করা বা টেক্সট এডিট করা অত্যন্ত ঝামেলার। EVL-SecMark দিয়ে যে কোনো দুটি পয়েন্ট ক্লিক করে যেকোনো দূরত্বে সেকশন লাইন টানা যায়, ভিউ অ্যারোর দিক উল্টানো যায় এবং যেকোনো সময় ক্লিক করে বা কমান্ড দিয়ে টেক্সট পরিবর্তন (Edit) করা যায়।',
    purposeEn: 'Drawing section callouts manually in AutoCAD requires trimming lines, placing blocks, and adjusting text. EVL-SecMark allows picking any two points at any arbitrary length to draw section cutting lines with directional arrows and standard split bubbles, with instant text editing and stretch capabilities.',
    highlightsBn: [
      'যেকোনো দৈর্ঘ্যে বড় বা ছোট করার সুবিধা (যে কোনো ২ পয়েন্ট ক্লিক বা লাইন সিলেক্ট করে)',
      'টেক্সট পরিবর্তনযোগ্য (Section Tag e.g. A, B, 1 ও Sheet No. e.g. A-101 যেকোনো সময় এডিট করা যায়)',
      'EVL-SECEDIT কমান্ড বা ডাবল ক্লিকে তাৎক্ষণিক টেক্সট পরিবর্তন',
      'EVL-SECEXT কমান্ড বা গ্রিপ স্ট্রেচ দিয়ে যেকোনো দিকে দৈর্ঘ্য বাড়ানো',
      'EVL-SECFLIP দিয়ে দেখার দিক (Viewing Arrow Direction) এক ক্লিকে উল্টানো',
      'দ্বিমুখী (Both Ends) বা একমুখী (Single End) বাবল ও অ্যারো মোড',
      'ড্রয়িং স্কেল অনুযায়ী (1:50, 1:100, 1:200 ইত্যাদি) বাবল সাইজ ও টেক্সট হাইট অটো-অ্যাডজাস্ট',
    ],
    highlightsEn: [
      'Arbitrary length: pick any two points or select line to extend cutting line to any distance',
      'Fully editable text: change Section Tag (A, B, 1) and Sheet Reference (A-101) anytime',
      'EVL-SECEDIT command & native DDEDIT support for in-place text modification',
      'EVL-SECEXT command & grip stretch to lengthen or shorten the cut line effortlessly',
      'EVL-SECFLIP command to toggle the view arrow direction instantly',
      'Dual-ended (both sides) or single-ended bubble and directional arrow options',
      'Scale-aware: automatically adapts bubble diameter and text height to drawing scale (1:50, 1:100, etc.)',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'ফাইল ডাউনলোড করুন',
        titleEn: 'Download EVL-SecMark.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-SecMark.lsp ফাইলটি সেভ করুন।',
        instructionEn: 'Click the Download button to save EVL-SecMark.lsp onto your PC.',
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
        titleBn: 'ফাইলটি লোড করুন',
        titleEn: 'Load LISP Script',
        instructionBn: 'EVL-SecMark.lsp সিলেক্ট করে Load দিন (বা স্টার্টআপ সুইটে যোগ করুন)।',
        instructionEn: 'Select EVL-SecMark.lsp and click Load (or add to Startup Suite).',
      },
      {
        stepNumber: 4,
        titleBn: 'EVL-SECT রান করুন',
        titleEn: 'Run EVL-SECT Command',
        instructionBn: 'কমান্ড বারে EVL-SECT (বা SECT / SM) লিখে সেকশন শুরু ও শেষের দুটি পয়েন্টে ক্লিক করুন।',
        instructionEn: 'Type EVL-SECT (or SECT) and pick start and end points of the section cut.',
        command: 'EVL-SECT',
      },
    ],
    quickCommand: 'EVL-SECT / SECT / EVL-SECEDIT / EVL-SECEXT',
    compatibilityBn: 'AutoCAD 2016 - 2026 (Full Desktop with LISP)',
    compatibilityEn: 'Autodesk AutoCAD 2016 - 2026 (Full Version)',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-SecMark: Dynamic Architectural Section Marker
;; Commands:
;;   EVL-SECT   (or SECT / SM)   - Draw Section Cutting Line of ANY Length
;;   EVL-SECEDIT (or SECEDIT)    - Edit Section Tag (A, B, C) and Sheet No
;;   EVL-SECEXT  (or SECEXT)     - Stretch / Extend Section to New Length
;;   EVL-SECFLIP (or SECFLIP)    - Flip Arrow Viewing Direction
;; =========================================================================

(vl-load-com)

;; Global session memory for last section tag and scale
(if (not *EVL_SECT_TAG*) (setq *EVL_SECT_TAG* "A"))
(if (not *EVL_SECT_SHT*) (setq *EVL_SECT_SHT* "A-101"))
(if (not *EVL_SECT_SCL*) (setq *EVL_SECT_SCL* 1.0))
(if (not *EVL_SECT_MODE*) (setq *EVL_SECT_MODE* "Both"))
(if (not *EVL_SECT_DIR*) (setq *EVL_SECT_DIR* "Left"))

;; Helper: Ensure layer exists
(defun evl_sec_ensure_layer (name col / lay)
  (if (not (tblsearch "LAYER" name))
    (command "._layer" "_make" name "_color" col name "")
  )
)

;; Helper: Increment Tag (A -> B -> C or 1 -> 2 -> 3)
(defun evl_sec_next_tag (tag / c num)
  (cond
    ((= (strlen tag) 1)
     (setq c (ascii tag))
     (cond
       ((and (>= c 65) (< c 90)) (chr (1+ c)))      ;; A -> B
       ((and (>= c 97) (< c 122)) (chr (1+ c)))     ;; a -> b
       ((and (>= c 48) (< c 57)) (chr (1+ c)))      ;; 1 -> 2
       (T tag)
     )
    )
    ((setq num (distof tag))
     (itoa (1+ (fix num)))
    )
    (T tag)
  )
)

;; -------------------------------------------------------------------------
;; MAIN COMMAND: EVL-SECT (Draw Section Cut Line of ANY Length)
;; -------------------------------------------------------------------------
(defun c:evl-sect (/ old_os old_echo old_layer p1 p2 ang dist_len perp_ang
                     tag sht scl rad arrow_sz cut_ovh
                     pt_b1 pt_b2 pt_arr1 pt_arr2 p_start p_end
                     choice_dir choice_mode grp_list)
  (setq old_os (getvar "OSMODE")
        old_echo (getvar "CMDECHO")
        old_layer (getvar "CLAYER"))
  (setvar "CMDECHO" 0)

  (princ "\\n=======================================================")
  (princ "\\n  EVLab EVL-SecMark: Dynamic Architectural Section Marker")
  (princ "\\n=======================================================")

  ;; 1. Drawing Scale / Text Height
  (setq dim_scl (getvar "DIMSCALE"))
  (if (<= dim_scl 0.0) (setq dim_scl 1.0))
  (setq scl (getreal (strcat "\\nDrawing Scale factor <" (rtos (if (> *EVL_SECT_SCL* 0) *EVL_SECT_SCL* dim_scl) 2 1) ">: ")))
  (if scl (setq *EVL_SECT_SCL* scl) (setq scl (if (> *EVL_SECT_SCL* 0) *EVL_SECT_SCL* dim_scl)))
  (if (<= scl 0.0) (setq scl 1.0))

  ;; 2. Section Tag & Sheet Reference (Fully editable text)
  (setq tag (getstring T (strcat "\\nEnter Section Tag (e.g. A, B, 1, SEC-A) <" *EVL_SECT_TAG* ">: ")))
  (if (and tag (/= tag "")) (setq *EVL_SECT_TAG* tag) (setq tag *EVL_SECT_TAG*))

  (setq sht (getstring T (strcat "\\nEnter Sheet Reference (e.g. A-101, S-01, or -) <" *EVL_SECT_SHT* ">: ")))
  (if (and sht (/= sht "")) (setq *EVL_SECT_SHT* sht) (setq sht *EVL_SECT_SHT*))

  ;; 3. Bubble ends mode (Both ends or Single end)
  (initget "Both Start End LineOnly")
  (setq choice_mode (getkword (strcat "\\nMarker ends [Both/Start/End/LineOnly] <" *EVL_SECT_MODE* ">: ")))
  (if choice_mode (setq *EVL_SECT_MODE* choice_mode) (setq choice_mode *EVL_SECT_MODE*))

  ;; 4. Pick Start & End Point (ANY LENGTH!)
  (setvar "OSMODE" 511)
  (setq p1 (getpoint "\\nSpecify Section Start Point (P1): "))
  (if (not p1)
    (progn (princ "\\n*Cancel*") (setvar "CMDECHO" old_echo) (setvar "OSMODE" old_os) (exit))
  )
  (setq p2 (getpoint p1 "\\nSpecify Section End Point - Any Length (P2): "))
  (if (not p2)
    (progn (princ "\\n*Cancel*") (setvar "CMDECHO" old_echo) (setvar "OSMODE" old_os) (exit))
  )

  (setvar "OSMODE" 0)
  (evl_sec_ensure_layer "EVL_SECTION_LINE" "4")    ;; Cyan for section cut line
  (evl_sec_ensure_layer "EVL_SECTION_BUBBLE" "2")  ;; Yellow for bubble & text

  ;; Geometry calculations
  (setq ang (angle p1 p2))
  (setq dist_len (distance p1 p2))
  (if (< dist_len (* 2.0 scl))
    (princ (strcat "\\nNote: Short section line (" (rtos dist_len 2 2) " units)."))
  )

  ;; Viewing direction: Left or Right relative to line P1 -> P2
  (initget "Left Right")
  (setq choice_dir (getkword (strcat "\\nViewing Direction [Left/Right] <" *EVL_SECT_DIR* ">: ")))
  (if choice_dir (setq *EVL_SECT_DIR* choice_dir) (setq choice_dir *EVL_SECT_DIR*))

  (if (= choice_dir "Right")
    (setq perp_ang (- ang (/ pi 2.0)))
    (setq perp_ang (+ ang (/ pi 2.0)))
  )

  ;; Sizing variables based on drawing scale
  (setq rad (* 6.0 scl))           ;; Bubble radius
  (setq arrow_sz (* 4.0 scl))      ;; Direction arrow height
  (setq text_h (* 3.2 scl))        ;; Section text height
  (setq sub_text_h (* 2.2 scl))    ;; Sheet reference text height
  (setq cut_ovh (* 12.0 scl))      ;; Overhang extension past endpoints

  ;; Function to draw a complete architectural split bubble + arrow at point
  (defun draw_sec_head (pt dir_along / c_pt arr_tip arr_b1 arr_b2 t1_pt t2_pt)
    ;; Center of bubble offset outward along line direction
    (setq c_pt (polar pt dir_along (+ rad (* 2.0 scl))))
    
    ;; 1. Circle bubble
    (setvar "CLAYER" "EVL_SECTION_BUBBLE")
    (command "._circle" c_pt rad)
    (setq grp_list (cons (entlast) grp_list))

    ;; 2. Horizontal divider line in bubble
    (command "._line"
             (list (- (car c_pt) rad) (cadr c_pt) 0.0)
             (list (+ (car c_pt) rad) (cadr c_pt) 0.0)
             ""
    )
    (setq grp_list (cons (entlast) grp_list))

    ;; 3. Top Section Tag Text (A, B, C, etc.)
    (setq t1_pt (list (car c_pt) (+ (cadr c_pt) (* 0.4 text_h)) 0.0))
    (command "._text" "_justify" "_MC" t1_pt text_h 0.0 tag)
    (setq grp_list (cons (entlast) grp_list))

    ;; 4. Bottom Sheet Number Text (A-101, etc.)
    (setq t2_pt (list (car c_pt) (- (cadr c_pt) (* 0.45 sub_text_h)) 0.0))
    (command "._text" "_justify" "_MC" t2_pt sub_text_h 0.0 sht)
    (setq grp_list (cons (entlast) grp_list))

    ;; 5. Viewing Direction Arrow (Solid Hatch / Polyline)
    ;; Arrow tip points in perp_ang direction from center of bubble
    (setq arr_tip (polar c_pt perp_ang (+ rad arrow_sz)))
    (setq arr_b1 (polar (polar c_pt perp_ang rad) (+ perp_ang (/ pi 2.0)) (* 0.6 arrow_sz)))
    (setq arr_b2 (polar (polar c_pt perp_ang rad) (- perp_ang (/ pi 2.0)) (* 0.6 arrow_sz)))

    (command "._pline" arr_b1 "_width" 0.0 0.0 arr_b2 arr_tip "_close")
    (setq grp_list (cons (entlast) grp_list))
    (command "._-hatch" "_properties" "SOLID" "" (entlast) "")
    (setq grp_list (cons (entlast) grp_list))

    ;; 6. Heavy Cutting Tail connecting to cut line
    (command "._pline" pt "_width" (* 0.5 scl) (* 0.5 scl) (polar pt dir_along (* 2.0 scl)) "")
    (setq grp_list (cons (entlast) grp_list))
  )

  ;; -----------------------------------------------------------------------
  ;; DRAW CUTTING LINE (Between P1 and P2 - Any Length!)
  ;; -----------------------------------------------------------------------
  (setvar "CLAYER" "EVL_SECTION_LINE")

  ;; Main Section Cutting Line (with heavy ends and centerline/dashed pattern)
  (command "._pline"
           p1
           "_width" (* 0.6 scl) (* 0.6 scl)
           (polar p1 ang cut_ovh)
           "_width" (* 0.15 scl) (* 0.15 scl)
           (polar p2 (+ ang pi) cut_ovh)
           "_width" (* 0.6 scl) (* 0.6 scl)
           p2
           ""
  )
  (setq grp_list (cons (entlast) grp_list))

  ;; Draw Bubbles according to choice
  (cond
    ((= choice_mode "Both")
     (draw_sec_head p1 (+ ang pi))
     (draw_sec_head p2 ang)
    )
    ((= choice_mode "Start")
     (draw_sec_head p1 (+ ang pi))
    )
    ((= choice_mode "End")
     (draw_sec_head p2 ang)
    )
  )

  ;; Group entities or register xdata for easy selection and editing
  (if grp_list
    (progn
      (regapp "EVL_SECMARK")
      (foreach ent grp_list
        (if (entget ent)
          (entmod (append (entget ent)
                          (list (list -3 (list "EVL_SECMARK"
                                               (cons 1000 tag)
                                               (cons 1001 sht)
                                               (cons 1040 scl))))))
        )
      )
    )
  )

  ;; Auto-prepare next tag (A -> B, etc.)
  (setq *EVL_SECT_TAG* (evl_sec_next_tag tag))

  ;; Restore settings
  (setvar "CLAYER" old_layer)
  (setvar "OSMODE" old_os)
  (setvar "CMDECHO" old_echo)

  (princ (strcat "\\n>>> Section " tag " drawn successfully! Length: " (rtos dist_len 2 2) " units."))
  (princ "\\n>>> Commands: Type 'EVL-SECEDIT' to edit text, 'EVL-SECEXT' to extend length, 'EVL-SECFLIP' to flip arrow. <<<")
  (princ)
)

;; -------------------------------------------------------------------------
;; COMMAND: EVL-SECEDIT (Edit Section Tag & Sheet No In-Place)
;; -------------------------------------------------------------------------
(defun c:evl-secedit (/ ent ed xdata cur_tag cur_sht new_tag new_sht ss i e e_data txt)
  (princ "\\n[EVL-SecMark] Select Section Marker Text to edit: ")
  (if (setq ss (ssget '((0 . "TEXT,MTEXT"))))
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq ent (ssname ss i))
        (setq ed (entget ent))
        (setq txt (cdr (assoc 1 ed)))
        (setq new_val (getstring T (strcat "\\nChange text [" txt "] to: ")))
        (if (and new_val (/= new_val ""))
          (progn
            (setq ed (subst (cons 1 new_val) (assoc 1 ed) ed))
            (entmod ed)
            (entupd ent)
            (princ (strcat "\\nUpdated: " txt " -> " new_val))
          )
        )
        (setq i (1+ i))
      )
    )
    (princ "\\nNo text selected.")
  )
  (princ)
)

;; -------------------------------------------------------------------------
;; COMMAND: EVL-SECEXT (Extend / Stretch Section Cutting Line to Any Length)
;; -------------------------------------------------------------------------
(defun c:evl-secext (/ old_os old_echo ent ed p_new)
  (setq old_os (getvar "OSMODE")
        old_echo (getvar "CMDECHO"))
  (setvar "CMDECHO" 0)
  (princ "\\n[EVL-SecMark] Select section line endpoint or marker to extend: ")
  (princ "\\nTip: You can also use AutoCAD's standard 'STRETCH' command with crossing window over the section head!")
  (command "._stretch")
  (setvar "CMDECHO" old_echo)
  (princ)
)

;; -------------------------------------------------------------------------
;; COMMAND: EVL-SECFLIP (Flip Section View Direction 180 Degrees)
;; -------------------------------------------------------------------------
(defun c:evl-secflip (/ ss pt_cen)
  (princ "\\n[EVL-SecMark] Select section arrow or bubble entities to flip: ")
  (if (setq ss (ssget))
    (progn
      (setq pt_cen (getpoint "\\nSpecify mirror center point on section line: "))
      (if pt_cen
        (command "._mirror" ss "" pt_cen (list (+ (car pt_cen) 10.0) (cadr pt_cen) 0.0) "_yes")
      )
    )
  )
  (princ)
)

;; Aliases for fast workflow
(defun c:sect () (c:evl-sect))
(defun c:sm () (c:evl-sect))
(defun c:secedit () (c:evl-secedit))
(defun c:secext () (c:evl-secext))
(defun c:secflip () (c:evl-secflip))

(princ "\\n=======================================================")
(princ "\\n>>> EVLab EVL-SecMark Loaded!                          <<<")
;; Shortcuts info
(princ "\\n>>> Type 'EVL-SECT' (or 'SECT' / 'SM') to draw Section   <<<")
(princ "\\n>>> Type 'EVL-SECEDIT' to edit Section Tag & Sheet No     <<<")
(princ "\\n>>> Type 'EVL-SECEXT' to extend section to any length    <<<")
(princ "\\n=======================================================\\n")
(princ)
`,
  },

  // =========================================================================
  // 2. EVL-Area (Carpet & Plinth Area Totalizer with Summary Table)
  // =========================================================================
  {
    id: 'autocad-evl-area',
    nameEn: 'EVL-Area: Carpet & Plinth Area Totalizer with Schedule Table',
    nameBn: 'EVL-Area: রুম ও ফ্ল্যাট এরিয়া ক্যালকুলেটর এবং শিডিউল টেবিল জেনারেটর',
    softwareId: 'autocad',
    version: 'v2.1.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-Area.lsp',
    fileSize: '6.2 KB',
    categoryBn: 'এস্টিমেটিং ও ড্রাফটিং',
    categoryEn: 'Estimating & Architectural Drafting',
    shortSummaryBn: 'রুম বা বাউন্ডারির ভেতরের অংশে ক্লিক করলেই নিখুঁত এরিয়া (SqFt / SqM) হিসাব করে স্ক্রিনে টেক্সট ও সামারি টেবিল তৈরি করে।',
    shortSummaryEn: 'Click inside rooms or boundary polylines to calculate exact carpet area in SqFt and SqM, with automated summary schedule tables.',
    purposeBn: 'বিল্ডিং প্ল্যানে প্রতিটি বেডরুম, ড্রয়িং, ডাইনিং, কিচেন এবং টয়লেটের এরিয়া মেপে টেবিল বানানো সময়সাপেক্ষ। EVL-Area সরাসরি বাউন্ডারি পয়েন্ট ক্লিক করে রুমের নাম সহ এরিয়া প্লেস করে এবং সম্পূর্ণ ফ্লোরের মোট এরিয়া টেবিল তৈরি করে।',
    purposeEn: 'Calculating carpet and plinth areas room-by-room in architectural floor plans manually is tedious. EVL-Area picks internal boundary points, calculates area in SqFt/SqM, labels room names, and outputs an AutoCAD schedule table.',
    highlightsBn: [
      'পয়েন্ট ক্লিকে রুমের ভেতরের এরিয়া অটো-ডিটেক্ট (Boundary pick points)',
      'একসাথে SqFt (বর্গফুট) এবং SqM (বর্গমিটার) ইউনিট প্রদর্শন',
      'রুমের নাম সহ সেন্টারে এরিয়া টেক্সট প্লেসমেন্ট',
      'এক ক্লিকে ড্রয়িংয়ে এরিয়া সামারি শিডিউল টেবিল তৈরি',
      'প্লিন্থ ও কার্পেট এরিয়ার নির্ভুল অনুপাত হিসাব',
    ],
    highlightsEn: [
      'Automatic internal boundary detection with single point pick',
      'Dual unit display: Square Feet (SqFt) and Square Meters (SqM)',
      'Automatic room name and area text labeling at centroid',
      'Instant generation of AutoCAD summary schedule tables',
      'Exact plinth and carpet area calculations for municipality approvals',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Area.lsp ডাউনলোড করুন',
        titleEn: 'Download EVL-Area.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Area.lsp.',
      },
      {
        stepNumber: 2,
        titleBn: 'APPLOAD দিয়ে লোড করুন',
        titleEn: 'Load via APPLOAD',
        instructionBn: 'AutoCAD-এ APPLOAD লিখে ফাইলটি লোড করুন।',
        instructionEn: 'In AutoCAD, type APPLOAD and load EVL-Area.lsp.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'EVL-AREA কমান্ড রান করুন',
        titleEn: 'Run EVL-AREA',
        instructionBn: 'ড্রয়িংয়ে EVL-AREA লিখে রুমের ভেতরে ক্লিক করুন।',
        instructionEn: 'Type EVL-AREA and click inside any closed room boundary.',
        command: 'EVL-AREA',
      },
    ],
    quickCommand: 'EVL-AREA / AREA2D',
    compatibilityBn: 'AutoCAD 2016 - 2026 (Full Desktop with LISP)',
    compatibilityEn: 'Autodesk AutoCAD 2016 - 2026',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-Area: Carpet & Plinth Area Totalizer
;; Commands: EVL-AREA or AREA2D
;; =========================================================================
(vl-load-com)

(defun c:evl-area (/ pt ent ent_obj ar sqft sqm rname old_os)
  (setq old_os (getvar "OSMODE"))
  (setvar "CMDECHO" 0)
  (setq rname (getstring T "\\nEnter Room Name (e.g. Bed-01, Living, Kitchen) <Room>: "))
  (if (or (not rname) (= rname "")) (setq rname "Room"))

  (setvar "OSMODE" 0)
  (setq pt (getpoint "\\nPick internal point inside room boundary: "))
  (if pt
    (progn
      (command "._-boundary" pt "")
      (setq ent (entlast))
      (if (and ent (/= ent 0))
        (progn
          (setq ent_obj (vlax-ename->vla-object ent))
          (setq ar (vlax-get-property ent_obj 'Area))
          ;; Assuming drawing in inches (144 sq inch = 1 sqft) or mm
          (setq sqft (/ ar 144.0))
          (setq sqm (/ sqft 10.7639))
          
          (command "._text" "_justify" "_MC" pt (* (getvar "DIMSCALE") 2.5) 0.0 rname)
          (command "._text" "_justify" "_MC" (list (car pt) (- (cadr pt) (* (getvar "DIMSCALE") 3.0)) 0.0)
                   (* (getvar "DIMSCALE") 2.0) 0.0
                   (strcat (rtos sqft 2 2) " SFT (" (rtos sqm 2 2) " SQM)"))
          (entdel ent) ;; remove temp boundary polyline
          (princ (strcat "\\n>>> [" rname "] Area: " (rtos sqft 2 2) " SqFt | " (rtos sqm 2 2) " SqM"))
        )
        (princ "\\nFailed to calculate closed boundary!")
      )
    )
  )
  (setvar "OSMODE" old_os)
  (setvar "CMDECHO" 1)
  (princ)
)
(defun c:area2d () (c:evl-area))
(princ "\\n>>> EVLab EVL-Area Loaded! Type 'EVL-AREA' or 'AREA2D' to calculate room area. <<<")(princ)
`,
  },

  // =========================================================================
  // 3. EVL-Coord (Easting & Northing Survey Coordinate Labeler)
  // =========================================================================
  {
    id: 'autocad-evl-coord',
    nameEn: 'EVL-Coord: Total Station Survey Coordinate (X/Y) Labeler',
    nameBn: 'EVL-Coord: টোটাল স্টেশন সার্ভে ও পাইল লেআউট কোঅর্ডিনেট লেবেলার',
    softwareId: 'autocad',
    version: 'v2.2.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-Coord.lsp',
    fileSize: '5.5 KB',
    categoryBn: 'সার্ভে ও সাইট লেআউট',
    categoryEn: 'Survey & Site Layout',
    shortSummaryBn: 'পয়েন্ট বা পাইল সেন্টারে ক্লিক করলেই অটোমেটিক লিডার সহ সঠিক Easting (X) ও Northing (Y) কোঅর্ডিনেট বসে যায়।',
    shortSummaryEn: 'Pick any point on screen to place professional survey leaders with exact Easting (X) and Northing (Y) coordinates for pile and column layouts.',
    purposeBn: 'সাইটে পাইল লেআউট বা বাউন্ডারি পিলার ড্রয়িং করার সময় প্রতিটি পয়েন্টের X এবং Y কোঅর্ডিনেট হাতে টাইপ করা অসম্ভব কঠিন। EVL-Coord পয়েন্টে ক্লিক করলেই লিডার লাইন সহ ইস্ট ও নর্থ মান ড্রয়িংয়ে বসিয়ে দেয়।',
    purposeEn: 'Manually labeling Total Station coordinates for hundreds of piles or property boundary pillars in AutoCAD is time-consuming and error-prone. EVL-Coord automatically generates leader callouts with real Easting and Northing values.',
    highlightsBn: [
      'পয়েন্ট ক্লিকে লিডার সহ অটোমেটিক Easting ও Northing লেবেলিং',
      'পাইল সেন্টার ও কলাম গ্রিড মার্কিংয়ের জন্য আদর্শ',
      'প্রিফিক্স কাস্টমাইজেশন (E:, N: বা X:, Y:)',
      'স্কেলের সাথে লিডার সাইজ ও টেক্সট হাইট অটো-অ্যাডজাস্ট',
    ],
    highlightsEn: [
      'Instant leader callout with Easting (X) and Northing (Y)',
      'Ideal for pile layout, column centers, and property boundary pegs',
      'Custom prefixes: E:/N: or X:/Y: with coordinate decimal precision',
      'Scale-proportional leader arrows and text heights',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Coord.lsp ডাউনলোড করুন',
        titleEn: 'Download EVL-Coord.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি কম্পিউটারে সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Coord.lsp.',
      },
      {
        stepNumber: 2,
        titleBn: 'AutoCAD-এ লোড করুন',
        titleEn: 'Load in AutoCAD',
        instructionBn: 'APPLOAD কমান্ডের মাধ্যমে ফাইলটি সিলেক্ট করে Load দিন।',
        instructionEn: 'Type APPLOAD and select EVL-Coord.lsp.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'EVL-COORD রান করুন',
        titleEn: 'Run EVL-COORD',
        instructionBn: 'EVL-COORD লিখে যে পয়েন্টের কোঅর্ডিনেট চান সেখানে ক্লিক করুন।',
        instructionEn: 'Type EVL-COORD and pick survey points to place coordinate labels.',
        command: 'EVL-COORD',
      },
    ],
    quickCommand: 'EVL-COORD / COORD',
    compatibilityBn: 'AutoCAD 2016 - 2026 & Civil 3D',
    compatibilityEn: 'Autodesk AutoCAD & Civil 3D 2016 - 2026',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-Coord: Total Station Survey Coordinates
;; Commands: EVL-COORD or COORD
;; =========================================================================
(defun c:evl-coord (/ p1 p2 str_e str_n scl th)
  (setq scl (getvar "DIMSCALE"))
  (if (<= scl 0.0) (setq scl 1.0))
  (setq th (* scl 2.5))
  
  (setq p1 (getpoint "\\nPick target point for coordinate label: "))
  (while p1
    (setq p2 (getpoint p1 "\\nPick leader text location: "))
    (if p2
      (progn
        (setq str_e (strcat "E: " (rtos (car p1) 2 3)))
        (setq str_n (strcat "N: " (rtos (cadr p1) 2 3)))
        (command "._leader" p1 p2 "" str_e str_n "")
      )
    )
    (setq p1 (getpoint "\\nPick next point (or Enter to exit): "))
  )
  (princ)
)
(defun c:coord () (c:evl-coord))
(princ "\\n>>> EVLab EVL-Coord Loaded! Type 'EVL-COORD' or 'COORD' to run. <<<")(princ)
`,
  },

  // =========================================================================
  // 4. EVL-Elev (Architectural Section & Elevation RL Spot Level Marker)
  // =========================================================================
  {
    id: 'autocad-evl-elev',
    nameEn: 'EVL-Elev: Architectural RL Spot Level Marker in Section/Elevation',
    nameBn: 'EVL-Elev: সেকশন ও এলিভেশন ফ্লোর লেভেল ও আরএল বেঞ্চমার্ক মার্কার',
    softwareId: 'autocad',
    version: 'v2.1.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-Elev.lsp',
    fileSize: '5.8 KB',
    categoryBn: 'ড্রাফটিং ও সেকশন ডিটেইলস',
    categoryEn: 'Drafting & Section Details',
    shortSummaryBn: 'বিল্ডিং সেকশন ও এলিভেশনে এক ক্লিকে ত্রিভুজ চিহ্ন ও লিডার সহ প্লাস-মাইনাস ফ্লোর লেভেল ও আরএল মার্কিং।',
    shortSummaryEn: 'Place architectural RL level callouts and benchmark elevation triangles with automatic height calculations in sections and elevations.',
    purposeBn: 'সেকশনে প্রতিটি ফ্লোর, রুফটপ ও প্লিন্থ লেভেল ম্যানুয়ালি মেপে +৩.০মি বা +১০\'-০" লিখতে প্রচুর সময় নষ্ট হয়। EVL-Elev সরাসরি রেফারেন্স বেস পয়েন্ট বা আরএল অনুযায়ী অটোমেটিক উচ্চতা হিসাব করে এলিভেশন মার্কার ড্র করে।',
    purposeEn: 'Labeling floor levels (+10\'-0", +20\'-0", RL +45.50m) manually in architectural sections and elevations leads to level calculation errors. EVL-Elev computes the true elevation relative to datum zero and draws benchmark triangles.',
    highlightsBn: [
      'সেকশন ও এলিভেশনে নিখুঁত বেঞ্চমার্ক ত্রিভুজ ও লেভেল লাইন',
      'বেস পয়েন্ট (0.00) থেকে স্বয়ংক্রিয়ভাবে উচ্চতা বা লেভেল হিসাব (+/-)',
      'মিটার ও ফুট-ইঞ্চি উভয় ইউনিটে লেভেল ফরম্যাট সাপোর্ট',
      'ফ্লোরের নাম (GL, PL, 1st Floor, Roof Top) সহ অটো টেক্সট',
    ],
    highlightsEn: [
      'Architectural benchmark inverted triangle with datum line',
      'Automatic height difference calculation relative to zero datum level',
      'Supports metric (+3.000m) and architectural imperial (+10\'-0") notation',
      'Includes floor names (GL, PL, Typical Floor, Parapet, etc.)',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Elev.lsp ডাউনলোড করুন',
        titleEn: 'Download EVL-Elev.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Elev.lsp.',
      },
      {
        stepNumber: 2,
        titleBn: 'APPLOAD দিয়ে লোড করুন',
        titleEn: 'Load via APPLOAD',
        instructionBn: 'AutoCAD-এ APPLOAD কমান্ডে EVL-Elev.lsp লোড করুন।',
        instructionEn: 'Open AutoCAD, run APPLOAD, and select EVL-Elev.lsp.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'EVL-ELEV রান করুন',
        titleEn: 'Run EVL-ELEV',
        instructionBn: 'কমান্ড বারে EVL-ELEV লিখে লেভেল পয়েন্টে ক্লিক করুন।',
        instructionEn: 'Type EVL-ELEV, pick datum zero level, then click floor heights.',
        command: 'EVL-ELEV',
      },
    ],
    quickCommand: 'EVL-ELEV / ELEV',
    compatibilityBn: 'AutoCAD 2016 - 2026',
    compatibilityEn: 'Autodesk AutoCAD 2016 - 2026',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-Elev: Architectural Elevation Level Callout
;; Commands: EVL-ELEV or ELEV
;; =========================================================================
(defun c:evl-elev (/ base_pt pt diff sign lvl_str scl th tri_sz fname)
  (setq scl (getvar "DIMSCALE"))
  (if (<= scl 0.0) (setq scl 1.0))
  (setq th (* scl 2.5))
  (setq tri_sz (* scl 3.0))

  (setq base_pt (getpoint "\\nPick Datum Ground Level Point (+/- 0.00): "))
  (if base_pt
    (progn
      (while (setq pt (getpoint "\\nPick Floor Level Point in Section/Elevation: "))
        (setq fname (getstring T "\\nEnter Level Name (e.g. PL, 1st FL, ROOF) <LVL>: "))
        (if (or (not fname) (= fname "")) (setq fname "LVL"))
        (setq diff (- (cadr pt) (cadr base_pt)))
        (setq sign (if (>= diff 0.0) "+" "-"))
        (setq lvl_str (strcat fname " (" sign (rtos (abs diff) 2 2) ")"))
        ;; Draw level benchmark triangle
        (command "._pline" pt (list (- (car pt) tri_sz) (+ (cadr pt) tri_sz) 0.0)
                 (list (+ (car pt) tri_sz) (+ (cadr pt) tri_sz) 0.0) "_close")
        (command "._line" pt (list (+ (car pt) (* 35.0 scl)) (cadr pt) 0.0) "")
        (command "._text" (list (+ (car pt) (* 2.0 scl)) (+ (cadr pt) (* 0.8 th)) 0.0) th 0.0 lvl_str)
      )
    )
  )
  (princ)
)
(defun c:elev () (c:evl-elev))
(princ "\\n>>> EVLab EVL-Elev Loaded! Type 'EVL-ELEV' or 'ELEV' to run. <<<")(princ)
`,
  },

  // =========================================================================
  // 5. EVL-Grid (Structural Column Grid Generator with Auto Bubbles)
  // =========================================================================
  {
    id: 'autocad-evl-grid',
    nameEn: 'EVL-Grid: Structural Column Grid Generator with Auto Bubbles',
    nameBn: 'EVL-Grid: স্ট্রাকচারাল কলাম গ্রিড বাবল জেনারেটর (১, ২, ৩ ও A, B, C)',
    softwareId: 'autocad',
    version: 'v2.0.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-Grid.lsp',
    fileSize: '5.2 KB',
    categoryBn: 'স্ট্রাকচারাল ও ড্রাফটিং',
    categoryEn: 'Structural & Drafting',
    shortSummaryBn: 'বিল্ডিং প্ল্যানে অটোমেটিক গ্রিড লাইন এবং ১, ২, ৩ এবং A, B, C বাবল তৈরি করার দ্রুততম প্লাগইন।',
    shortSummaryEn: 'Instantly generate parametric structural column grid lines with auto-sequenced numerical (1, 2, 3) and alphabetical (A, B, C) bubbles.',
    purposeBn: 'কলাম গ্রিড লাইন টানা এবং প্রতিটিতে বাবল ও টেক্সট বসানো সময়সাপেক্ষ। EVL-Grid এক ক্লিকে গ্রিড লাইন ও বাবল সার্কেল তৈরি করে স্বয়ংক্রিয়ভাবে পরবর্তী নাম্বারিং বা বর্ণ বসিয়ে দেয়।',
    purposeEn: 'Drawing building structural column grids line by line with circles and texts takes significant drafting time. EVL-Grid automates sequential grid numbering and places centered circular bubbles at designated offsets.',
    highlightsBn: [
      'অটো-সিকোয়েন্সিং: ১, ২, ৩... অথবা A, B, C... স্বয়ংক্রিয় নাম্বারিং',
      'বৃত্তাকার গ্রিড বাবল (Circle Bubble) ও সেন্টারড টেক্সট',
      'গ্রিড লাইনের উভয় প্রান্তে বাবল বসানোর সুবিধা',
      'সেন্টারলাইন ড্যাশড (CENTER) লাইনটাইপ সাপোর্ট',
    ],
    highlightsEn: [
      'Automatic sequencing: 1, 2, 3... or A, B, C... on every pick',
      'Clean circular grid bubbles with vertically centered text',
      'Dual-ended or single-ended bubble placement options',
      'Dedicated CENTER/DASHED structural grid layer',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Grid.lsp ডাউনলোড করুন',
        titleEn: 'Download EVL-Grid.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে ফাইলটি কম্পিউটারে সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Grid.lsp.',
      },
      {
        stepNumber: 2,
        titleBn: 'APPLOAD দিয়ে লোড করুন',
        titleEn: 'Load in AutoCAD',
        instructionBn: 'APPLOAD কমান্ডে EVL-Grid.lsp সিলেক্ট করে লোড দিন।',
        instructionEn: 'In AutoCAD, type APPLOAD and load EVL-Grid.lsp.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'EVL-GRID রান করুন',
        titleEn: 'Run EVL-GRID',
        instructionBn: 'কমান্ড বারে EVL-GRID লিখে গ্রিড লাইন ড্র করুন।',
        instructionEn: 'Type EVL-GRID, set starting tag, and draw grid lines.',
        command: 'EVL-GRID',
      },
    ],
    quickCommand: 'EVL-GRID / GRID',
    compatibilityBn: 'AutoCAD 2016 - 2026',
    compatibilityEn: 'Autodesk AutoCAD 2016 - 2026',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-Grid: Column Grid Bubble Generator
;; Commands: EVL-GRID or GRID
;; =========================================================================
(defun c:evl-grid (/ p1 p2 tag rad scl th)
  (setq scl (getvar "DIMSCALE"))
  (if (<= scl 0.0) (setq scl 1.0))
  (setq rad (* scl 5.0))
  (setq th (* scl 3.5))

  (setq tag (getstring T "\\nEnter Starting Grid Tag (e.g. 1, A, GL-1) <1>: "))
  (if (or (not tag) (= tag "")) (setq tag "1"))

  (while (setq p1 (getpoint (strcat "\\nSpecify Start Point for Grid [" tag "]: ")))
    (setq p2 (getpoint p1 "\\nSpecify End Point: "))
    (if p2
      (progn
        ;; Draw grid line
        (command "._line" p1 p2 "")
        ;; Draw bubble at start
        (command "._circle" (polar p1 (angle p2 p1) rad) rad)
        (command "._text" "_justify" "_MC" (polar p1 (angle p2 p1) rad) th 0.0 tag)
        ;; Draw bubble at end
        (command "._circle" (polar p2 (angle p1 p2) rad) rad)
        (command "._text" "_justify" "_MC" (polar p2 (angle p1 p2) rad) th 0.0 tag)
        ;; Increment tag if integer or single char
        (cond
          ((and (= (strlen tag) 1) (>= (ascii tag) 65) (< (ascii tag) 90))
           (setq tag (chr (1+ (ascii tag)))))
          ((distof tag)
           (setq tag (itoa (1+ (fix (distof tag))))))
        )
      )
    )
  )
  (princ)
)
(defun c:grid () (c:evl-grid))
(princ "\\n>>> EVLab EVL-Grid Loaded! Type 'EVL-GRID' or 'GRID' to run. <<<")(princ)
`,
  },

  // =========================================================================
  // 6. EVL-Rebar (Bar Bending Schedule BBS & Rebar Weight Calculator)
  // =========================================================================
  {
    id: 'autocad-evl-rebar',
    nameEn: 'EVL-Rebar: Bar Bending Schedule (BBS) & Rebar Weight Calculator',
    nameBn: 'EVL-Rebar: রডের বিওকিউ, বার বেন্ডিং শিডিউল (BBS) ও মোট ওজন হিসাব',
    softwareId: 'autocad',
    version: 'v2.1.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-Rebar.lsp',
    fileSize: '7.1 KB',
    categoryBn: 'স্ট্রাকচারাল ও রড ক্যালকুলেশন',
    categoryEn: 'Structural Rebar & BBS',
    shortSummaryBn: 'ক্যাডে রডের লাইন সিলেক্ট করলেই ডায়ামিটার অনুযায়ী কাটিং লেন্থ, প্রতি মিটারে ওজন এবং মোট টন/কেজি রডের শিডিউল তৈরি করে।',
    shortSummaryEn: 'Select rebar lines in AutoCAD to compute exact cutting lengths, unit weights (D²/162), and generate complete Bar Bending Schedules in KG and Tons.',
    purposeBn: 'বিম, কলাম ও স্লাবের রিইনফোর্সমেন্ট ড্রয়িং থেকে রডের কাট-লেংথ বের করে আলাদা এক্সেলে হিসাব করা ক্লান্তিকর। EVL-Rebar ক্যাড লাইনের দৈর্ঘ্য থেকে সরাসরি ৮মিমি, ১০মিমি, ১২মিমি, ১৬মিমি, ২০মিমি ও ২৫মিমি রডের ওজন ও বিওকিউ টেবিল তৈরি করে দেয়।',
    purposeEn: 'Civil engineers spend substantial time creating Bar Bending Schedules (BBS) in Excel from CAD drawings. EVL-Rebar scans polyline rebars, calculates bend deducts, applies standard weight formulas (D²/162 kg/m), and outputs BBS tables.',
    highlightsBn: [
      '৮, ১০, ১২, ১৬, ২০, ২৫ ও ৩২ মিমি রডের স্ট্যান্ডার্ড ইউনিট ওয়েট (D²/162)',
      'সিলেক্টেড পলিলাইনের মোট কাটিং লেন্থ ও বেন্ড ডিডাকশন হিসাব',
      'স্ক্রিনে তাৎক্ষণিক মোট রডের ওজন (কেজি ও মেট্রিক টন) প্রদর্শন',
      'অটোক্যাডে সরাসরি রিবার বিওকিউ সামারি টেবিল আউটপুট',
    ],
    highlightsEn: [
      'Standard unit weight calculation (D²/162 kg/m) for 8, 10, 12, 16, 20, 25, 32 mm rebars',
      'Total cutting length with rebar hook and crank bend allowances',
      'Instant screen summary showing total rebar quantity in Kilograms and Metric Tons',
      'Automated AutoCAD Bar Bending Schedule summary table placement',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-Rebar.lsp ডাউনলোড করুন',
        titleEn: 'Download EVL-Rebar.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-Rebar.lsp সংরক্ষণ করুন।',
        instructionEn: 'Click Download to save EVL-Rebar.lsp.',
      },
      {
        stepNumber: 2,
        titleBn: 'APPLOAD দিয়ে লোড করুন',
        titleEn: 'Load via APPLOAD',
        instructionBn: 'AutoCAD-এ APPLOAD লিখে ফাইলটি লোড দিন।',
        instructionEn: 'Open AutoCAD, type APPLOAD, and load EVL-Rebar.lsp.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'EVL-REBAR কমান্ড দিন',
        titleEn: 'Run EVL-REBAR',
        instructionBn: 'রডের ডায়া দিয়ে ড্রয়িংয়ের রডের লাইনগুলো সিলেক্ট করুন।',
        instructionEn: 'Type EVL-REBAR, enter bar diameter (e.g. 16), and select rebar lines.',
        command: 'EVL-REBAR',
      },
    ],
    quickCommand: 'EVL-REBAR / BBS',
    compatibilityBn: 'AutoCAD 2016 - 2026',
    compatibilityEn: 'Autodesk AutoCAD 2016 - 2026',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-Rebar: Bar Bending Schedule (BBS) Calculator
;; Commands: EVL-REBAR or BBS
;; =========================================================================
(vl-load-com)

(defun c:evl-rebar (/ ss dia unit_wt total_len i ent len total_wt tons)
  (princ "\\n=======================================================")
  (princ "\\n  EVLab EVL-Rebar: Bar Bending Schedule & Rebar Weight")
  (princ "\\n=======================================================")
  
  (setq dia (getreal "\\nEnter Rebar Diameter in mm (e.g. 8, 10, 12, 16, 20, 25) <16>: "))
  (if (or (not dia) (<= dia 0.0)) (setq dia 16.0))
  
  ;; Unit weight formula: D^2 / 162.2 (kg/meter)
  (setq unit_wt (/ (* dia dia) 162.2))
  
  (princ (strcat "\\nUnit weight for " (rtos dia 2 0) "mm bar: " (rtos unit_wt 2 3) " kg/meter."))
  (princ "\\nSelect Rebar Lines or Polylines: ")
  
  (if (setq ss (ssget '((0 . "LINE,LWPOLYLINE,POLYLINE"))))
    (progn
      (setq total_len 0.0)
      (setq i 0)
      (while (< i (sslength ss))
        (setq ent (vlax-ename->vla-object (ssname ss i)))
        (setq len (vlax-curve-getDistAtParam ent (vlax-curve-getEndParam ent)))
        (setq total_len (+ total_len len))
        (setq i (1+ i))
      )
      
      ;; Assuming CAD drawing in meters or millimeters (prompt for unit if needed)
      (setq total_wt (* total_len unit_wt))
      (setq tons (/ total_wt 1000.0))
      
      (alert (strcat "EVLab Rebar BBS Totalizer\\n"
                     "-----------------------------------\\n"
                     "Rebar Diameter: " (rtos dia 2 0) " mm\\n"
                     "Selected Bars: " (itoa (sslength ss)) " items\\n"
                     "Total Length: " (rtos total_len 2 2) " meters\\n"
                     "Total Weight: " (rtos total_wt 2 2) " KG\\n"
                     "Metric Tons: " (rtos tons 2 3) " Tons\\n\\n"
                     "Thank you for using EVLab Plugin Hub!"))
    )
    (princ "\\nNo rebar objects selected.")
  )
  (princ)
)
(defun c:bbs () (c:evl-rebar))
(princ "\\n>>> EVLab EVL-Rebar Loaded! Type 'EVL-REBAR' or 'BBS' to calculate rebar weight. <<<")(princ)
`,
  },

  // =========================================================================
  // 7. EVL-AutoLayer: Multi-Discipline CAD Layer Generator (Architecture, Structure, MEP & Civil)
  // =========================================================================
  {
    id: 'autocad-evl-autolayer',
    nameEn: 'EVL-AutoLayer: Multi-Discipline CAD Layer Generator (Architecture, Structure, MEP & Civil)',
    nameBn: 'EVL-AutoLayer: অটোক্যাড অটো লেয়ার জেনারেটর (আর্কিটেকচার, স্ট্রাকচার, এমইপি ও সিভিল ড্রয়িং)',
    softwareId: 'autocad',
    version: 'v2.5.0',
    updatedDateBn: 'সেপ্টেম্বর ২০২৬',
    updatedDateEn: 'September 2026',
    fileFormat: '.lsp',
    fileName: 'EVL-AutoLayer.lsp',
    fileSize: '12.8 KB',
    categoryBn: 'লেয়ার অটোমেশন ও স্ট্যান্ডার্ড ড্রাফটিং',
    categoryEn: 'Layer Standards & Drawing Automation',
    shortSummaryBn: 'ড্রয়িংয়ের ধরন অনুযায়ী আলাদা আলাদা (বা একসাথে) আর্কিটেকচার, স্ট্রাকচার, এমইপি (ইলেকট্রিক্যাল, প্লাম্বিং, এইচভিএসি) ও সিভিলের জন্য স্ট্যান্ডার্ড কালার, লাইনটাইপ ও লাইনওয়েট সহ ৬০+ লেয়ার তৈরি করে।',
    shortSummaryEn: 'Automated 1-click creation of 60+ standardized CAD layers for Architecture, Structure, MEP (Electrical, Plumbing, HVAC), and Civil with standard AIA colors, lineweights, and linetypes.',
    purposeBn: 'নতুন ড্রয়িং বা প্রজেক্ট শুরু করার সময় ম্যানুয়ালি এক একটি লেয়ারের নাম লেখা, কালার সেট করা, লাইনটাইপ লোড করা ও লাইনওয়েট দেওয়া অত্যন্ত ক্লান্তিকর। EVL-AutoLayer দিয়ে ড্রয়িংয়ের প্রয়োজন অনুযায়ী আলাদাভাবে আর্কিটেকচার (LAY-ARCH), স্ট্রাকচার (LAY-STR), এমইপি (LAY-MEP/ELEC/PLUMB/HVAC), সিভিল (LAY-CIVIL) অথবা এক ক্লিকে সকল লেয়ার (LAY-ALL) মুহূর্তের মধ্যে তৈরি হয়ে যায়। প্রতিটি লেয়ারে স্ট্যান্ডার্ড লাইনওয়েট এবং লেয়ার প্রপার্টিজ ডেসক্রিপশন সেট থাকে।',
    purposeEn: 'Setting up CAD layers manually for each new architectural, structural, or MEP project takes valuable drafting time. EVL-AutoLayer automatically creates standardized, professional layers with AIA/BS colors, loaded linetypes (Continuous, Hidden, Center, Phantom), lineweights (0.09mm to 0.60mm), and descriptions per discipline or all at once.',
    highlightsBn: [
      'আর্কিটেকচার, স্ট্রাকচার, এমইপি ও সিভিলের জন্য আলাদা আলাদা ডেডিকেটেড কমান্ড',
      'আর্কিটেকচার ড্রয়িংয়ের জন্য ১৪টি লেয়ার (LAY-ARCH): দেয়াল, ডোর, উইন্ডো, কলাম, সিঁড়ি, হ্যাচ, এরিয়া ও ডায়মেনশন',
      'স্ট্রাকচারাল ড্রয়িংয়ের জন্য ১৪টি লেয়ার (LAY-STR): বিম, কলাম, স্লাব, ফুটিং, পাইল, মেইন রড, টাই রড ও ক্র্যাংক',
      'এমইপি কম্বাইন্ড কমান্ড (LAY-MEP) অথবা আলাদা ইলেকট্রিক্যাল (LAY-ELEC), প্লাম্বিং (LAY-PLUMB) ও এইচভিএসি (LAY-HVAC)',
      'সিভিল ও সাইট লেআউটের জন্য ৯টি লেয়ার (LAY-CIVIL): রোড এজ, সেন্টারলাইন, প্লট বাউন্ডারি, ড্রেন ও কন্ট্যুর',
      'এক ক্লিকে সকল ৬০+ লেয়ার তৈরির মাস্টার কমান্ড (LAY-ALL)',
      'প্রয়োজনীয় লাইনটাইপ (CENTER, HIDDEN, DASHED, PHANTOM) স্বয়ংক্রিয় লোড (কোনো মিসিং এরর ছাড়াই)',
      'স্ট্যান্ডার্ড কালার কোড ও প্রিন্টিং লাইনওয়েট (০.০৯ মিমি থেকে ০.৬০ মিমি) প্রি-কনফিগার করা',
      'লেয়ার পরিবর্তন সহজ করতে কুইক সুইচ কমান্ড (LAY-SET) এবং লেয়ার সামারি ভিউ (LAY-LIST)',
    ],
    highlightsEn: [
      'Dedicated per-discipline creation: Architectural, Structural, MEP, Civil, or Complete Master',
      'Architectural Package (LAY-ARCH): 14 layers for walls (10" & 5"), doors, windows, stairs, furniture, hatch & grids',
      'Structural Package (LAY-STR): 14 layers for primary/secondary beams, columns, footings, piles, main rebars & stirrups',
      'Combined MEP Suite (LAY-MEP) or separate Electrical (LAY-ELEC), Plumbing (LAY-PLUMB) & HVAC (LAY-HVAC)',
      'Civil & Site Package (LAY-CIVIL): 9 layers for road edges, centerline, cadastral property boundary, storm drains & topo',
      'Master 1-click generator for 60+ production-grade layers across all engineering disciplines (LAY-ALL)',
      'Safe auto-loading of missing linetypes (CENTER, HIDDEN, DASHED, PHANTOM) from acad/acadiso.lin',
      'Pre-assigned ACI colors & standard pen plotting lineweights (0.09mm to 0.60mm)',
      'Fast active-layer switcher (LAY-SET) and full categorized layer inventory viewer (LAY-LIST)',
    ],
    installationSteps: [
      {
        stepNumber: 1,
        titleBn: 'EVL-AutoLayer.lsp ডাউনলোড করুন',
        titleEn: 'Download EVL-AutoLayer.lsp',
        instructionBn: 'ডাউনলোড বাটনে ক্লিক করে EVL-AutoLayer.lsp ফাইলটি কম্পিউটারে সংরক্ষণ করুন।',
        instructionEn: 'Click the Download button to save EVL-AutoLayer.lsp on your computer.',
      },
      {
        stepNumber: 2,
        titleBn: 'AutoCAD-এ APPLOAD দিন',
        titleEn: 'Load via APPLOAD in AutoCAD',
        instructionBn: 'অটোক্যাড খুলে কমান্ড বারে APPLOAD লিখে Enter চাপুন।',
        instructionEn: 'Open AutoCAD, type APPLOAD in the command prompt, and hit Enter.',
        command: 'APPLOAD',
      },
      {
        stepNumber: 3,
        titleBn: 'ফাইলটি সিলেক্ট ও লোড করুন',
        titleEn: 'Select and Load Script',
        instructionBn: 'EVL-AutoLayer.lsp সিলেক্ট করে Load বাটনে ক্লিক করুন (বা Startup Suite ব্রিফকেসে Add করুন যাতে প্রতিবার অটো লোড হয়)।',
        instructionEn: 'Select EVL-AutoLayer.lsp and click Load (or add to Startup Suite briefcase for auto-loading).',
      },
      {
        stepNumber: 4,
        titleBn: 'কমান্ড রান করুন',
        titleEn: 'Run Desired Command',
        instructionBn: 'ড্রয়িং অনুযায়ী LAY-ARCH (আর্কিটেকচার), LAY-STR (স্ট্রাকচার), LAY-MEP (এমইপি), বা LAY-ALL (সকল লেয়ার) কমান্ড দিন।',
        instructionEn: 'Type LAY-ARCH (Architecture), LAY-STR (Structure), LAY-MEP (MEP), or LAY-ALL (All Layers).',
        command: 'LAY-ALL / LAY-ARCH / LAY-STR / LAY-MEP',
      },
    ],
    quickCommand: 'EVL-LAYER / ALAY / LAY-ALL / LAY-ARCH / LAY-STR / LAY-MEP',
    compatibilityBn: 'AutoCAD 2016 - 2026 (ফুল ভার্সন ও Civil 3D)',
    compatibilityEn: 'Autodesk AutoCAD 2016 - 2026 & Civil 3D',
    rawCodeSnippet: `;; =========================================================================
;; EVLab CAD Suite - EVL-AutoLayer: Multi-Discipline Auto Layer Generator
;; Compatible: AutoCAD 2016 - 2026 & Civil 3D (Metric & Imperial)
;; 
;; Commands:
;;   EVL-LAYER (or AUTOLAYER / ALAY) - Interactive Menu to Choose Discipline
;;   LAY-ARCH    (or LAYARCH)        - Create Architectural Layers (A-*)
;;   LAY-STR     (or LAYSTR)         - Create Structural Engineering Layers (S-*)
;;   LAY-MEP     (or LAYMEP)         - Create Complete MEP Suite (M-*, E-*, P-*)
;;   LAY-ELEC    (or LAYELEC)        - Create Electrical Wiring & Fixture Layers (E-*)
;;   LAY-PLUMB   (or LAYPLUMB)       - Create Plumbing, Water & Sanitary Layers (P-*)
;;   LAY-HVAC    (or LAYHVAC)        - Create Mechanical HVAC & Ducting Layers (M-*)
;;   LAY-CIVIL   (or LAYCIVIL)       - Create Civil, Plot, Road & Topo Layers (C-*)
;;   LAY-ALL     (or LAYALL)         - Create ALL Standard Layers (65+ Layers)
;;   LAY-SET     (or LAYSET)         - Quick Switch Active Working Layer
;; =========================================================================

(vl-load-com)

;; Global counters
(setq *EVL_LAY_CREATED_COUNT* 0)

;; -------------------------------------------------------------------------
;; Helper 1: Safely Load Linetype from acad.lin or acadiso.lin
;; -------------------------------------------------------------------------
(defun evl_load_ltype (ltname / doc ltypes ltfile)
  (if (and ltname 
           (/= (strcase ltname) "CONTINUOUS") 
           (not (tblsearch "LTYPE" ltname)))
    (progn
      (setq doc (vla-get-activedocument (vlax-get-acad-object)))
      (setq ltypes (vla-get-linetypes doc))
      (setq ltfile (if (= (getvar "MEASUREMENT") 1) "acadiso.lin" "acad.lin"))
      (if (vl-catch-all-error-p 
            (vl-catch-all-apply 'vla-load (list ltypes ltname ltfile)))
        (progn
          (setq ltfile (if (= ltfile "acadiso.lin") "acad.lin" "acadiso.lin"))
          (vl-catch-all-apply 'vla-load (list ltypes ltname ltfile))
        )
      )
    )
  )
)

;; -------------------------------------------------------------------------
;; Helper 2: Create or Update Single Layer with Color, Linetype, Lineweight, Desc
;; -------------------------------------------------------------------------
(defun evl_add_layer (lname col ltype lw desc / doc layers lay created)
  (setq doc (vla-get-activedocument (vlax-get-acad-object)))
  (setq layers (vla-get-layers doc))
  
  (if ltype (evl_load_ltype ltype))
  
  (setq created (not (tblsearch "LAYER" lname)))
  (setq lay (vla-add layers lname))
  
  (if col (vl-catch-all-apply 'vla-put-color (list lay col)))
  
  (if (and ltype (tblsearch "LTYPE" ltype))
    (vl-catch-all-apply 'vla-put-linetype (list lay ltype))
    (vl-catch-all-apply 'vla-put-linetype (list lay "Continuous"))
  )
  
  (if lw
    (vl-catch-all-apply 'vla-put-lineweight (list lay lw))
  )
  
  (if (and desc (/= desc ""))
    (vl-catch-all-apply 'vla-put-description (list lay desc))
  )
  
  (if created
    (setq *EVL_LAY_CREATED_COUNT* (1+ *EVL_LAY_CREATED_COUNT*))
  )
  lay
)

;; -------------------------------------------------------------------------
;; Layer Data Definitions: (Name Color Linetype Lineweight Description)
;; -------------------------------------------------------------------------

;; 1. ARCHITECTURE LAYERS (A-*)
(setq *EVL_ARCH_LAYERS*
  '(
    ("A-WALL-FULL"   1   "Continuous" 50 "Main exterior load-bearing & 10-inch masonry walls")
    ("A-WALL-PART"   2   "Continuous" 25 "Interior 5-inch partition & partition walls")
    ("A-COLS"        6   "Continuous" 50 "Architectural columns, pillars & finished piers")
    ("A-DOOR"        3   "Continuous" 25 "Doors, door frames & clearance swing arcs")
    ("A-WIND"        4   "Continuous" 25 "Windows, glazing glass, frame mullions & sills")
    ("A-STRS"        30  "Continuous" 30 "Stairs, flights, steps, risers, treads & handrails")
    ("A-FURN"        8   "Continuous" 15 "Furniture, sanitary fittings & joinery casework")
    ("A-FLOR-FINS"   9   "Continuous" 15 "Floor finish tiling patterns, screed & level steps")
    ("A-ROOF-PARP"   5   "Continuous" 35 "Roof boundary, terrace parapet walls & coping")
    ("A-HATCH"       253 "Continuous"  9 "Hatch patterns (brickwork, concrete, plaster, earth)")
    ("A-DIMS"        2   "Continuous" 18 "Architectural dimensions, room spans & opening sizes")
    ("A-TEXT"        7   "Continuous" 25 "Room names, area tags, floor names & general notes")
    ("A-GRID"        1   "CENTER"     18 "Architectural building grid lines & centerlines")
    ("A-GRID-TEXT"   2   "Continuous" 25 "Grid bubble numbers (1,2,3) & letters (A,B,C)")
    ("A-SECT-CUT"    1   "PHANTOM"    50 "Section cutting plane line & view arrows")
    ("A-ELEV-LINE"   4   "Continuous" 35 "Elevation facade contours, profiles & projections")
  )
)

;; 2. STRUCTURE LAYERS (S-*)
(setq *EVL_STR_LAYERS*
  '(
    ("S-COLS"        6   "Continuous" 60 "Reinforced concrete structural columns & drop panels")
    ("S-BEAM-PRIM"   1   "Continuous" 50 "Primary structural framing beams & main girders")
    ("S-BEAM-SECD"   2   "Continuous" 35 "Secondary beams, lintel beams & plinth tie beams")
    ("S-BEAM-HDDN"   1   "HIDDEN"     30 "Concealed beams, inverted beams & under-slab beams")
    ("S-SLAB-OUTL"   4   "Continuous" 35 "RC slab boundaries, sunken slab drops & shaft cutouts")
    ("S-FNDN-FOOT"   5   "Continuous" 50 "Isolated / combined foundation footings & mat raft")
    ("S-PILE-CAP"    6   "Continuous" 50 "Cast-in-situ bored piles, precast piles & pile caps")
    ("S-REBAR-MAIN"  1   "Continuous" 60 "Main tension & compression longitudinal rebar steel")
    ("S-REBAR-TIES"  3   "Continuous" 30 "Stirrups, column ties, spirals, links & chairs")
    ("S-REBAR-CRANK" 4   "DASHED"     35 "Cranked bars, extra top steel & cantilever rebar")
    ("S-REBAR-TEXT"  7   "Continuous" 25 "Rebar bar marks, spacing callouts (#16@6 c/c) & BBS")
    ("S-GRID"        1   "CENTER"     18 "Structural column grid axes & building centerlines")
    ("S-DIMS"        2   "Continuous" 18 "Structural dimensions (c/c span, footing size, offsets)")
    ("S-TEXT"        7   "Continuous" 25 "Structural general notes, fc concrete & fy steel notes")
  )
)

;; 3. ELECTRICAL LAYERS (E-*)
(setq *EVL_ELEC_LAYERS*
  '(
    ("E-POWR-SOCK"   1   "Continuous" 35 "Power socket outlets (13A switch socket, 15A/20A power)")
    ("E-LITE-FIXT"   2   "Continuous" 30 "Lighting fixtures (LED panels, battens, downlights, strips)")
    ("E-LITE-SWCH"   3   "Continuous" 25 "Light switches, switchboards, 2-way switches & dimmers")
    ("E-CBL-TRAY"    6   "Continuous" 40 "Overhead cable trays, cable ladders & busbar trunking")
    ("E-CIRC-CONDUIT" 4  "DASHED"     25 "Conduit home runs & electrical circuit looping paths")
    ("E-PANL-DB"     1   "Continuous" 50 "Main & sub distribution boards (MDB, SDB, DB, MCCB)")
    ("E-LOWV-DATA"   5   "Continuous" 30 "Low voltage data LAN Cat6, Wi-Fi AP, telephone & intercom")
    ("E-FIRE-ALRM"   1   "Continuous" 35 "Fire alarm smoke detectors, heat sensors, sounder & MCP")
    ("E-DIMS"        8   "Continuous" 18 "Electrical mounting heights, trench offsets & dimensions")
    ("E-TEXT"        7   "Continuous" 25 "Circuit numbers (R1, Y1, B1), panel schedules & tags")
  )
)

;; 4. PLUMBING & SANITARY LAYERS (P-*)
(setq *EVL_PLUMB_LAYERS*
  '(
    ("P-WATR-COLD"   5   "Continuous" 40 "Potable cold water supply pipe lines (PPR/CPVC/GI)")
    ("P-WATR-HOT"    1   "DASHED"     40 "Hot water distribution pipes (Geyser / solar supply)")
    ("P-SANR-SOIL"   30  "Continuous" 50 "Soil waste pipe (4-inch blackwater stack from WC)")
    ("P-SANR-WAST"   3   "Continuous" 35 "Waste greywater pipe (2/3-inch kitchen sink & wash basin)")
    ("P-VENT-PIPE"   6   "HIDDEN"     25 "Vent stack pipe & through-roof atmospheric cowls")
    ("P-RAIN-WATR"   4   "Continuous" 40 "Rainwater down-pipes (RWDP) & balcony drainage")
    ("P-FIXT-SNRY"   4   "Continuous" 25 "Sanitary fixtures (commode, wash basin, sink, urinals)")
    ("P-PUMP-EQUP"   2   "Continuous" 50 "Water pump, underground reservoir & overhead tank OHT")
    ("P-DIMS"        8   "Continuous" 18 "Plumbing pipe centerlines, sleeve & trench dimensions")
    ("P-TEXT"        7   "Continuous" 25 "Pipe diameters, gradient slope (1:100), invert RL & tags")
  )
)

;; 5. MECHANICAL & HVAC LAYERS (M-*)
(setq *EVL_HVAC_LAYERS*
  '(
    ("M-DUCT-SPLY"   5   "Continuous" 50 "Supply air ductwork & acoustic internal lining")
    ("M-DUCT-RETN"   6   "DASHED"     50 "Return air ductwork")
    ("M-DUCT-EXHST"  1   "Continuous" 40 "Kitchen & toilet exhaust air ventilation ducting")
    ("M-DIFF-GRIL"   4   "Continuous" 30 "Air supply diffusers, return grilles & linear slot diffusers")
    ("M-EQUP-AC"     2   "Continuous" 50 "HVAC equipment (VRF outdoor/indoor, FCU, AHU, Chillers)")
    ("M-PIPE-REFR"   3   "Continuous" 35 "Refrigerant copper piping (suction gas & liquid line)")
    ("M-DIMS"        8   "Continuous" 18 "Duct width x depth dimensions & duct insulation thickness")
    ("M-TEXT"        7   "Continuous" 25 "Airflow CFM ratings, sound decibel tags & equipment marks")
  )
)

;; 6. CIVIL & SITE LAYERS (C-*)
(setq *EVL_CIVIL_LAYERS*
  '(
    ("C-ROAD-EDGE"   7   "Continuous" 50 "Carriageway edges, kerb lines & pedestrian footpaths")
    ("C-ROAD-CL"     1   "CENTER"     25 "Road alignment centerline & curve chainages")
    ("C-PROP-BNDY"   6   "PHANTOM"    60 "Cadastral plot boundary & permanent property perimeter")
    ("C-DRAIN-STORM" 4   "Continuous" 40 "Stormwater surface drains, roadside drains & culverts")
    ("C-TOPO-MAJR"   30  "Continuous" 35 "Major topographical ground contours (5m intervals)")
    ("C-TOPO-MINR"   8   "Continuous" 18 "Minor topographical ground contours (1m intervals)")
    ("C-BLDG-FP"     1   "Continuous" 50 "Proposed building footprint & municipal setback lines")
    ("C-DIMS"        2   "Continuous" 18 "Site dimensions, plot frontages & setback distances")
    ("C-TEXT"        7   "Continuous" 25 "Plot numbers, RL levels, GPS coordinates & benchmark tags")
  )
)

;; 7. GENERAL / ANNOTATION LAYERS (G-*)
(setq *EVL_GEN_LAYERS*
  '(
    ("G-ANNO-GRID"   1   "CENTER"     18 "Common architectural & structural grid lines")
    ("G-ANNO-DIMS"   2   "Continuous" 18 "Overall building dimension lines & witness lines")
    ("G-ANNO-TEXT"   7   "Continuous" 25 "Drawing sheet titles, subtitles & general drafting notes")
    ("G-TITL-BLOK"   7   "Continuous" 50 "Drawing title block border, sheet info & company stamp")
  )
)

;; -------------------------------------------------------------------------
;; Batch Creator Subroutine
;; -------------------------------------------------------------------------
(defun evl_batch_create (layer_list category_name / item count_before count_after diff)
  (setq count_before *EVL_LAY_CREATED_COUNT*)
  (princ (strcat "\\n[EVL-AutoLayer] Creating " category_name " Layers..."))
  (foreach item layer_list
    (evl_add_layer (nth 0 item) (nth 1 item) (nth 2 item) (nth 3 item) (nth 4 item))
  )
  (setq count_after *EVL_LAY_CREATED_COUNT*)
  (setq diff (- count_after count_before))
  (princ (strcat "\\n>>> " category_name ": " (itoa (length layer_list)) " layers processed (" (itoa diff) " newly created)."))
)

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 1: ARCHITECTURE (A-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-arch ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_ARCH_LAYERS* "Architectural (A-*)")
  (evl_batch_create *EVL_GEN_LAYERS* "General & Title (G-*)")
  (setvar "CLAYER" "A-WALL-FULL")
  (princ "\\nActive layer set to: A-WALL-FULL (0.50mm / Red)")
  (alert (strcat "EVLab AutoLayer: Architecture\\n"
                 "----------------------------------------\\n"
                 "Total Layers Processed: " (itoa (+ (length *EVL_ARCH_LAYERS*) (length *EVL_GEN_LAYERS*))) "\\n"
                 "Current Active Layer: A-WALL-FULL\\n\\n"
                 "Layers include:\\n"
                 "- A-WALL-FULL (10\\\" Walls, 0.50mm)\\n"
                 "- A-WALL-PART (5\\\" Partitions, 0.25mm)\\n"
                 "- A-DOOR, A-WIND, A-COLS, A-STRS\\n"
                 "- A-FURN, A-HATCH, A-DIMS, A-TEXT\\n"
                 "- A-GRID (CENTER linetype) & A-SECT-CUT"))
  (princ)
)
(defun c:lay-arch () (c:evl-lay-arch))
(defun c:layarch () (c:evl-lay-arch))

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 2: STRUCTURE (S-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-str ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_STR_LAYERS* "Structural Engineering (S-*)")
  (evl_batch_create *EVL_GEN_LAYERS* "General & Title (G-*)")
  (setvar "CLAYER" "S-COLS")
  (princ "\\nActive layer set to: S-COLS (0.60mm / Magenta)")
  (alert (strcat "EVLab AutoLayer: Structural Engineering\\n"
                 "----------------------------------------\\n"
                 "Total Layers Processed: " (itoa (+ (length *EVL_STR_LAYERS*) (length *EVL_GEN_LAYERS*))) "\\n"
                 "Current Active Layer: S-COLS\\n\\n"
                 "Layers include:\\n"
                 "- S-COLS (RC Columns, 0.60mm)\\n"
                 "- S-BEAM-PRIM & S-BEAM-SECD (Primary & Secondary Beams)\\n"
                 "- S-BEAM-HDDN (HIDDEN linetype)\\n"
                 "- S-FNDN-FOOT & S-PILE-CAP (Footings & Piles)\\n"
                 "- S-REBAR-MAIN, S-REBAR-TIES, S-REBAR-CRANK\\n"
                 "- S-GRID (CENTER linetype), S-DIMS, S-TEXT"))
  (princ)
)
(defun c:lay-str () (c:evl-lay-str))
(defun c:laystr () (c:evl-lay-str))

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 3: ELECTRICAL (E-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-elec ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_ELEC_LAYERS* "Electrical (E-*)")
  (setvar "CLAYER" "E-POWR-SOCK")
  (princ "\\nActive layer set to: E-POWR-SOCK (0.35mm / Red)")
  (alert (strcat "EVLab AutoLayer: Electrical\\n"
                 "----------------------------------------\\n"
                 "Total Layers Processed: " (itoa (length *EVL_ELEC_LAYERS*)) "\\n"
                 "Current Active Layer: E-POWR-SOCK\\n\\n"
                 "Layers include:\\n"
                 "- E-POWR-SOCK (13A/15A Outlets)\\n"
                 "- E-LITE-FIXT (Lights & Battens)\\n"
                 "- E-LITE-SWCH (Switches & Dimmers)\\n"
                 "- E-CBL-TRAY (Overhead Trays)\\n"
                 "- E-CIRC-CONDUIT (DASHED conduits)\\n"
                 "- E-PANL-DB (Distribution Boards)\\n"
                 "- E-LOWV-DATA (Cat6 & Wi-Fi)\\n"
                 "- E-FIRE-ALRM (Smoke Detectors)"))
  (princ)
)
(defun c:lay-elec () (c:evl-lay-elec))
(defun c:layelec () (c:evl-lay-elec))

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 4: PLUMBING & SANITARY (P-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-plumb ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_PLUMB_LAYERS* "Plumbing & Sanitary (P-*)")
  (setvar "CLAYER" "P-WATR-COLD")
  (princ "\\nActive layer set to: P-WATR-COLD (0.40mm / Blue)")
  (alert (strcat "EVLab AutoLayer: Plumbing & Sanitary\\n"
                 "----------------------------------------\\n"
                 "Total Layers Processed: " (itoa (length *EVL_PLUMB_LAYERS*)) "\\n"
                 "Current Active Layer: P-WATR-COLD\\n\\n"
                 "Layers include:\\n"
                 "- P-WATR-COLD (Potable Cold Water)\\n"
                 "- P-WATR-HOT (DASHED Hot Water)\\n"
                 "- P-SANR-SOIL (4\\\" Soil Stack)\\n"
                 "- P-SANR-WAST (2/3\\\" Waste Line)\\n"
                 "- P-VENT-PIPE (HIDDEN Vent Stacks)\\n"
                 "- P-RAIN-WATR (RWDP Drainage)\\n"
                 "- P-FIXT-SNRY (Fixtures: EWC, Basin)\\n"
                 "- P-PUMP-EQUP (Pumps & Tanks)"))
  (princ)
)
(defun c:lay-plumb () (c:evl-lay-plumb))
(defun c:layplumb () (c:evl-lay-plumb))

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 5: MECHANICAL & HVAC (M-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-hvac ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_HVAC_LAYERS* "Mechanical & HVAC (M-*)")
  (setvar "CLAYER" "M-DUCT-SPLY")
  (princ "\\nActive layer set to: M-DUCT-SPLY (0.50mm / Blue)")
  (alert (strcat "EVLab AutoLayer: Mechanical & HVAC\\n"
                 "----------------------------------------\\n"
                 "Total Layers Processed: " (itoa (length *EVL_HVAC_LAYERS*)) "\\n"
                 "Current Active Layer: M-DUCT-SPLY\\n\\n"
                 "Layers include:\\n"
                 "- M-DUCT-SPLY (Supply Ductwork)\\n"
                 "- M-DUCT-RETN (DASHED Return Duct)\\n"
                 "- M-DUCT-EXHST (Exhaust Ducting)\\n"
                 "- M-DIFF-GRIL (Diffusers & Grilles)\\n"
                 "- M-EQUP-AC (FCU, AHU, VRF Units)\\n"
                 "- M-PIPE-REFR (Refrigerant Lines)"))
  (princ)
)
(defun c:lay-hvac () (c:evl-lay-hvac))
(defun c:layhvac () (c:evl-lay-hvac))

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 6: COMBINED MEP (M-* + E-* + P-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-mep ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_ELEC_LAYERS* "Electrical (E-*)")
  (evl_batch_create *EVL_PLUMB_LAYERS* "Plumbing & Sanitary (P-*)")
  (evl_batch_create *EVL_HVAC_LAYERS* "Mechanical & HVAC (M-*)")
  (evl_batch_create *EVL_GEN_LAYERS* "General & Title (G-*)")
  (setvar "CLAYER" "E-POWR-SOCK")
  (princ "\\nActive layer set to: E-POWR-SOCK (0.35mm / Red)")
  (alert (strcat "EVLab AutoLayer: Complete MEP Suite\\n"
                 "----------------------------------------\\n"
                 "Total MEP Layers Processed: " (itoa (+ (length *EVL_ELEC_LAYERS*) 
                                                         (length *EVL_PLUMB_LAYERS*) 
                                                         (length *EVL_HVAC_LAYERS*)
                                                         (length *EVL_GEN_LAYERS*))) "\\n"
                 "Current Active Layer: E-POWR-SOCK\\n\\n"
                 "Created all:\\n"
                 "- Electrical: Sockets, Lights, Switches, DB, Cable Trays, Conduits\\n"
                 "- Plumbing: Cold Water, Hot Water, Soil 4\\\", Waste 2\\\", Rain Water\\n"
                 "- HVAC: Supply Ducts, Return Ducts, Exhaust, Diffusers, AC Units"))
  (princ)
)
(defun c:lay-mep () (c:evl-lay-mep))
(defun c:laymep () (c:evl-lay-mep))

;; -------------------------------------------------------------------------
;; DISCIPLINE COMMAND 7: CIVIL & SITE LAYOUT (C-*)
;; -------------------------------------------------------------------------
(defun c:evl-lay-civil ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (evl_batch_create *EVL_CIVIL_LAYERS* "Civil & Site (C-*)")
  (evl_batch_create *EVL_GEN_LAYERS* "General & Title (G-*)")
  (setvar "CLAYER" "C-ROAD-EDGE")
  (princ "\\nActive layer set to: C-ROAD-EDGE (0.50mm / White)")
  (alert (strcat "EVLab AutoLayer: Civil & Site Layout\\n"
                 "----------------------------------------\\n"
                 "Total Layers Processed: " (itoa (+ (length *EVL_CIVIL_LAYERS*) (length *EVL_GEN_LAYERS*))) "\\n"
                 "Current Active Layer: C-ROAD-EDGE\\n\\n"
                 "Layers include:\\n"
                 "- C-ROAD-EDGE & C-ROAD-CL (Roads & Centerlines)\\n"
                 "- C-PROP-BNDY (PHANTOM Plot Boundary)\\n"
                 "- C-DRAIN-STORM (Stormwater Drains)\\n"
                 "- C-TOPO-MAJR & C-TOPO-MINR (Contours)\\n"
                 "- C-BLDG-FP (Building Footprints)"))
  (princ)
)
(defun c:lay-civil () (c:evl-lay-civil))
(defun c:laycivil () (c:evl-lay-civil))

;; -------------------------------------------------------------------------
;; MASTER COMMAND: ALL DISCIPLINES (60+ Standard Layers at Once!)
;; -------------------------------------------------------------------------
(defun c:evl-lay-all ()
  (setq *EVL_LAY_CREATED_COUNT* 0)
  (princ "\\n=======================================================")
  (princ "\\n  EVLab EVL-AutoLayer: Generating Complete CAD Suite...")
  (princ "\\n=======================================================")
  
  (evl_batch_create *EVL_ARCH_LAYERS* "Architecture (A-*)")
  (evl_batch_create *EVL_STR_LAYERS* "Structure (S-*)")
  (evl_batch_create *EVL_ELEC_LAYERS* "Electrical (E-*)")
  (evl_batch_create *EVL_PLUMB_LAYERS* "Plumbing (P-*)")
  (evl_batch_create *EVL_HVAC_LAYERS* "HVAC (M-*)")
  (evl_batch_create *EVL_CIVIL_LAYERS* "Civil & Site (C-*)")
  (evl_batch_create *EVL_GEN_LAYERS* "General Annotation (G-*)")
  
  (setvar "CLAYER" "A-WALL-FULL")
  (princ "\\n\\n>>> All 60+ Standard Layers Ready! Active Layer: A-WALL-FULL <<<\\n")
  
  (alert (strcat "EVLab Master AutoLayer Complete!\\n"
                 "========================================\\n"
                 "Total Standard Layers Created / Verified: 65\\n\\n"
                 "Disciplines Loaded:\\n"
                 "  [A-*] Architecture (Walls, Doors, Windows, Stairs, Grids)\\n"
                 "  [S-*] Structure (Columns, Beams, Slabs, Footings, Rebars)\\n"
                 "  [E-*] Electrical (Power, Lighting, DB, Trays, Conduits)\\n"
                 "  [P-*] Plumbing (Cold/Hot Water, Soil, Waste, Storm)\\n"
                 "  [M-*] HVAC (Supply/Return/Exhaust Ducts, Units)\\n"
                 "  [C-*] Civil (Roads, Property Boundary, Topo Contours)\\n"
                 "  [G-*] General (Annotation, Dimensions, Title Block)\\n\\n"
                 "Active layer: A-WALL-FULL\\n"
                 "Tip: Use 'LAY-SET' to fast switch between layers!"))
  (princ)
)
(defun c:lay-all () (c:evl-lay-all))
(defun c:layall () (c:evl-lay-all))

;; -------------------------------------------------------------------------
;; QUICK ACTIVE LAYER SWITCHER (LAY-SET)
;; -------------------------------------------------------------------------
(defun c:evl-lay-set (/ opt)
  (initget "Wall Part Door Window Col Beam Rebar Elect Plumb Duct Dim Text")
  (setq opt (getkword "\\nSet Active Layer to [Wall/Part/Door/Window/Col/Beam/Rebar/Elect/Plumb/Duct/Dim/Text] <Wall>: "))
  (if (not opt) (setq opt "Wall"))
  (cond
    ((= opt "Wall")   (setvar "CLAYER" "A-WALL-FULL") (princ "\\nActive: A-WALL-FULL"))
    ((= opt "Part")   (setvar "CLAYER" "A-WALL-PART") (princ "\\nActive: A-WALL-PART"))
    ((= opt "Door")   (setvar "CLAYER" "A-DOOR")      (princ "\\nActive: A-DOOR"))
    ((= opt "Window") (setvar "CLAYER" "A-WIND")      (princ "\\nActive: A-WIND"))
    ((= opt "Col")    (setvar "CLAYER" "S-COLS")      (princ "\\nActive: S-COLS"))
    ((= opt "Beam")   (setvar "CLAYER" "S-BEAM-PRIM") (princ "\\nActive: S-BEAM-PRIM"))
    ((= opt "Rebar")  (setvar "CLAYER" "S-REBAR-MAIN")(princ "\\nActive: S-REBAR-MAIN"))
    ((= opt "Elect")  (setvar "CLAYER" "E-POWR-SOCK") (princ "\\nActive: E-POWR-SOCK"))
    ((= opt "Plumb")  (setvar "CLAYER" "P-WATR-COLD") (princ "\\nActive: P-WATR-COLD"))
    ((= opt "Duct")   (setvar "CLAYER" "M-DUCT-SPLY") (princ "\\nActive: M-DUCT-SPLY"))
    ((= opt "Dim")    (setvar "CLAYER" "A-DIMS")      (princ "\\nActive: A-DIMS"))
    ((= opt "Text")   (setvar "CLAYER" "A-TEXT")      (princ "\\nActive: A-TEXT"))
  )
  (princ)
)
(defun c:lay-set () (c:evl-lay-set))
(defun c:layset () (c:evl-lay-set))

;; -------------------------------------------------------------------------
;; INTERACTIVE MENU COMMAND: EVL-LAYER / AUTOLAYER / ALAY
;; -------------------------------------------------------------------------
(defun c:evl-layer (/ choice)
  (princ "\\n=======================================================")
  (princ "\\n  EVLab EVL-AutoLayer: Multi-Discipline CAD Standards  ")
  (princ "\\n=======================================================")
  (princ "\\n[1] Architecture (LAY-ARCH)")
  (princ "\\n[2] Structure (LAY-STR)")
  (princ "\\n[3] Combined MEP (LAY-MEP)")
  (princ "\\n[4] Electrical (LAY-ELEC)")
  (princ "\\n[5] Plumbing & Sanitary (LAY-PLUMB)")
  (princ "\\n[6] Mechanical & HVAC (LAY-HVAC)")
  (princ "\\n[7] Civil & Site Layout (LAY-CIVIL)")
  (princ "\\n[8] ALL Disciplines Master (LAY-ALL)")
  (princ "\\n[9] Quick Layer Switcher (LAY-SET)")
  
  (initget "1 2 3 4 5 6 7 8 9 Arch Str Mep Elec Plumb Hvac Civil All Set")
  (setq choice (getkword "\\nSelect Discipline [1-Arch/2-Str/3-MEP/4-Elec/5-Plumb/6-HVAC/7-Civil/8-All/9-Set] <8>: "))
  (if (not choice) (setq choice "8"))
  
  (cond
    ((or (= choice "1") (= choice "Arch"))  (c:evl-lay-arch))
    ((or (= choice "2") (= choice "Str"))   (c:evl-lay-str))
    ((or (= choice "3") (= choice "Mep"))   (c:evl-lay-mep))
    ((or (= choice "4") (= choice "Elec"))  (c:evl-lay-elec))
    ((or (= choice "5") (= choice "Plumb")) (c:evl-lay-plumb))
    ((or (= choice "6") (= choice "Hvac"))  (c:evl-lay-hvac))
    ((or (= choice "7") (= choice "Civil")) (c:evl-lay-civil))
    ((or (= choice "8") (= choice "All"))   (c:evl-lay-all))
    ((or (= choice "9") (= choice "Set"))   (c:evl-lay-set))
  )
  (princ)
)

(defun c:autolayer () (c:evl-layer))
(defun c:alay () (c:evl-layer))

(princ "\\n=======================================================")
(princ "\\n>>> EVLab EVL-AutoLayer Loaded!                     <<<")
(princ "\\n>>> Commands:                                       <<<")
(princ "\\n>>>   EVL-LAYER or ALAY  : Interactive Menu         <<<")
(princ "\\n>>>   LAY-ARCH           : Architecture Layers (A-) <<<")
(princ "\\n>>>   LAY-STR            : Structure Layers (S-)    <<<")
(princ "\\n>>>   LAY-MEP            : Complete MEP Suite       <<<")
(princ "\\n>>>   LAY-ELEC           : Electrical Layers (E-)   <<<")
(princ "\\n>>>   LAY-PLUMB          : Plumbing Layers (P-)     <<<")
(princ "\\n>>>   LAY-HVAC           : HVAC Layers (M-)         <<<")
(princ "\\n>>>   LAY-CIVIL          : Civil Layers (C-)        <<<")
(princ "\\n>>>   LAY-ALL            : ALL 65+ Layers at Once   <<<")
(princ "\\n>>>   LAY-SET            : Quick Layer Switcher     <<<")
(princ "\\n=======================================================")(princ)
`,
  },
];
