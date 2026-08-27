import { EquipmentDetail, EquipmentId } from '../types';

export const EQUIPMENT_LIST: EquipmentDetail[] = [
  {
    id: 'river_intake',
    nameBn: 'নদীর পানি উত্তোলন (Raw Water Intake)',
    nameEn: 'River Water Intake & Pumping Station',
    categoryBn: 'প্রাথমিক পানি সংগ্রহ',
    categoryEn: 'Raw Water Extraction',
    shortDescBn: 'নদী থেকে অপরিশোধিত পানি বড় পাম্প ও স্ক্রিনের মাধ্যমে প্লান্টে আনা হয়।',
    shortDescEn: 'Extracts raw water from the river via heavy-duty intake pumps and bar screens.',
    fullDescBn: 'নদীর বুক থেকে কাঁচা পানি উত্তোলন প্রক্রিয়ায় বড় আবর্জনা, পলি ও ভাসমান বস্তু আটকাতে বার স্ক্রিন ও ট্র্যাশ র্যাক ব্যবহার করা হয়। ৩টি সাবমার্সিবল সেন্ট্রিফিউগাল পাম্প পাইপলাইনের মাধ্যমে পানিকে কোয়াগুলেশন ট্যাংকে প্রেরণ করে।',
    fullDescEn: 'The raw intake structure draws surface water from the river using coarse bar screens to block floating debris, weeds, and aquatic solids. Heavy-duty centrifugal pumps transport raw water continuously to the flash mixer.',
    processStepsBn: [
      '১. নদী থেকে পানি প্রবেশমুখে ট্র্যাশ র্যাক ও বার স্ক্রিনের মাধ্যমে বড় প্লাস্টিক ও শেওলা অপসারণ।',
      '২. সাকশন চেম্বার থেকে ৩টি হেভি-ডিউটি ভার্টিক্যাল টারবাইন পাম্প দিয়ে পানি উত্তোলন।',
      '৩. ইনলেট প্রেসার ও ফ্লো মিটার দ্বারা পানির প্রবাহ ও প্রাথমিক ঘোলাত্ব (Turbidity) পরিমাপ।',
      '৪. মেইন র ওয়াটার ব্লু পাইপলাইনের মাধ্যমে কোয়াগুলেশন চেম্বারে প্রেরণ।'
    ],
    processStepsEn: [
      '1. Coarse bar screening blocks debris, floating plastics, and weeds.',
      '2. Heavy-duty vertical turbine pumps draw raw river water into suction headers.',
      '3. In-line ultrasonic flowmeter & turbidity sensors continuously record intake quality.',
      '4. Pressurized intake piping conveys raw water to the rapid flash mixing basin.'
    ],
    keySpecs: [
      { labelBn: 'পাম্পিং ক্ষমতা', labelEn: 'Pump Capacity', value: '2,500 m³/hr' },
      { labelBn: 'ইনটেক স্ক্রিন সাইজ', labelEn: 'Screen Aperture', value: '15 mm Coarse / 5 mm Fine' },
      { labelBn: 'পাম্প সংখ্যা', labelEn: 'Pumps Running', value: '3 Units (2 Duty + 1 Standby)' },
      { labelBn: 'মোটর পাওয়ার', labelEn: 'Motor Rating', value: '160 kW each' },
      { labelBn: 'ইনটেক হেড প্রেসার', labelEn: 'Discharge Head', value: '4.2 Bar' },
      { labelBn: 'নদীর পানির টার্বিডিটি', labelEn: 'Raw Turbidity', value: '80 - 250 NTU' }
    ],
    workingPrincipleBn: 'সেন্ট্রিফিউগাল ফোর্সের মাধ্যমে পানিকে হাই-প্রেশারে উত্তোলন করা হয়। নদীর পানির গুণমান সেন্সর দ্বারা রিয়েল-টাইম তথ্য সেন্ট্রাল কন্ট্রোল রুমে পাঠানো হয়।',
    workingPrincipleEn: 'Centrifugal kinetic energy pressurizes river water across intake mains. Submerged multi-parameter sensors relay continuous raw turbidity and conductivity to the SCADA system.',
    position3D: [-28, 1.2, 5],
    cameraTarget: [-28, 1, 5],
    cameraPosition: [-38, 12, 18],
    defaultTelemetry: {
      turbidityIn: 165,
      turbidityOut: 165,
      flowRate: 2400,
      phLevel: 7.4,
      pressure: 4.2,
      chemicalDose: 0,
      energyConsumption: 320,
      temperature: 24.5,
      tankLevel: 85,
      motorRpm: 1480,
      efficiency: 94,
      dissolvedOxygen: 6.8,
      tds: 210
    }
  },
  {
    id: 'coagulation',
    nameBn: 'কোয়াগুলেশন ফ্ল্যাশ মিক্সার (Coagulation)',
    nameEn: 'Coagulation Rapid Flash Mixer',
    categoryBn: 'রাসায়নিক প্রক্রিয়াকরণ',
    categoryEn: 'Chemical Dosing & Flash Mixing',
    shortDescBn: 'অ্যালাম (Alum) ও পলিইলেক্ট্রোলাইট মিশিয়ে পানির সূক্ষ্ম কণার চার্জ নিরপেক্ষ করা হয়।',
    shortDescEn: 'Rapidly injects alum and coagulant aids to destabilize negatively charged colloidal particles.',
    fullDescBn: 'পানিতে থাকা ক্ষুদ্রাতিক্ষুদ্র ভাসমান কণাগুলোর গায়ে ঋণাত্মক চার্জ থাকার কারণে তারা সহজে নিচে পড়ে না। এই দ্রুত মিশ্রণ চেম্বারে অ্যালুমিনিয়াম সালফেট (Alum) ও পলিমার দ্রবণ উচ্চগতির ইম্পেলারের সাহায্যে ২০-৩০ সেকেন্ডের মধ্যে তীব্রভাবে মেশানো হয়, ফলে চার্জ নিরপেক্ষ হয়ে কণাগুলো একত্রিত হতে শুরু করে।',
    fullDescEn: 'Microscopic colloidal clay and silt remain suspended due to negative electrostatic charges. The high-speed flash mixer injects coagulants (Alum / PAC) at 400+ RPM to instantly destabilize particle charges within 30 seconds.',
    processStepsBn: [
      '১. ইন-লাইন ডোজিং সিস্টেম থেকে নির্দিষ্ট অনুপাতে লিকুইড অ্যালাম স্প্রে।',
      '২. হাই-স্পিড টারবাইন ইম্পেলার দিয়ে অতি দ্রুত পানির ঘূর্ণি সৃষ্টি ও ব্লেন্ডিং।',
      '৩. পিএইচ কারেকশনের জন্য লাইম (Lime) বা কস্টিক সোডা স্বয়ংক্রিয় নিয়ন্ত্রণ।',
      '৪. তাৎক্ষণিক চার্জ ডি-স্ট্যাবিলাইজেশনের পর পানি ফ্লোকুলশন ট্যাংকে স্থানান্তর।'
    ],
    processStepsEn: [
      '1. Automated metering pumps inject calibrated liquid alum & coagulant aids.',
      '2. High-speed turbine agitator creates intense turbulent micro-eddies.',
      '3. Real-time pH correction with lime slurry for optimal coagulation chemistry.',
      '4. Rapidly destabilized water overflows into the baffled flocculation basins.'
    ],
    keySpecs: [
      { labelBn: 'মিক্সার স্পিড', labelEn: 'Impeller RPM', value: '450 RPM (Variable VFD)' },
      { labelBn: 'ডিটেনশন টাইম', labelEn: 'Detention Time', value: '30 - 45 Seconds' },
      { labelBn: 'অ্যালাম ডোজিং রেট', labelEn: 'Alum Dosing Rate', value: '25 - 45 mg/L' },
      { labelBn: 'টার্বুলাইজেশন জি-ভ্যালু', labelEn: 'Velocity Gradient (G)', value: '850 s⁻¹' },
      { labelBn: 'চেম্বার ভলিউম', labelEn: 'Basin Volume', value: '65 m³' }
    ],
    workingPrincipleBn: 'উচ্চগতির ঘূর্ণির মাধ্যমে অ্যালুমিনিয়াম আয়ন দ্রুত কণার সাথে বিক্রিয়া করে মাইক্রো-ফ্লক গঠনের পরিবেশ তৈরি করে।',
    workingPrincipleEn: 'Rapid charge neutralization occurs as trivalent aluminum cations bond with negatively charged silt colloids.',
    position3D: [-14, 2.5, -9],
    cameraTarget: [-14, 2.5, -9],
    cameraPosition: [-24, 11, -1],
    defaultTelemetry: {
      turbidityIn: 165,
      turbidityOut: 140,
      flowRate: 2380,
      phLevel: 6.9,
      pressure: 2.1,
      chemicalDose: 35,
      energyConsumption: 45,
      temperature: 24.5,
      tankLevel: 92,
      motorRpm: 450,
      efficiency: 98
    }
  },
  {
    id: 'flocculation',
    nameBn: 'ফ্লোকুলশন বেসিন (Flocculation Basin)',
    nameEn: 'Flocculation Basin & Paddle Flocculators',
    categoryBn: 'ধীরগতির সংমিশ্রণ',
    categoryEn: 'Slow Mixing & Floc Growth',
    shortDescBn: 'ধীরগতির প্যাডেলের সাহায্যে ক্ষুদ্র কণাগুলোকে বড় ভারী ফ্লকে (Floc) রূপান্তর করা হয়।',
    shortDescEn: 'Slow paddle agitation bridges destabilized micro-particles into heavy settleable flocs.',
    fullDescBn: 'ফ্লোকুলশন চেম্বারে একাধিক কম্পার্টমেন্ট ও ধীরগতির ঘূর্ণায়মান প্যাডেল হুইল থাকে। এখানে মৃদু আলোড়নের ফলে ক্ষুদ্র কণাগুলো একে অপরের সাথে ধাক্কা খেয়ে বড় তুলার মতো ভারী গুচ্ছ (Floc) তৈরি করে, যা পরবর্তী সেডিমেন্টেশন ট্যাংকে সহজে নিচে থিতিয়ে পড়বে।',
    fullDescEn: 'Consists of multi-stage baffled chambers equipped with horizontal/vertical slow-revolving paddle wheels. Gentle hydrodynamic collisions cause micro-flocs to aggregate into large, dense agglomerates ready for rapid settling.',
    processStepsBn: [
      '১. তিনটি ধাপে ক্রমান্বয়ে গতি কমিয়ে (Tapered Flocculation) মৃদু আলোড়ন সৃষ্টি।',
      '২. ক্ষুদ্র কণাগুলোর সংঘর্ষ ঘটিয়ে দৃশ্যমান ভারী ফ্লক তৈরি।',
      '৩. ফ্লক ভেঙে যাওয়া রোধ করতে গতি ২০ থেকে ৫ RPM পর্যন্ত পরিমিত রাখা।',
      '৪. শান্ত গতিতে পানিকে থিতানো ট্যাংকের কেন্দ্রীয় কূপে প্রবেশ করানো।'
    ],
    processStepsEn: [
      '1. Multi-compartment tapered velocity mixing (Stage 1 high -> Stage 3 low).',
      '2. Gentle inter-particle collision promotes rapid bridging of polymeric flocs.',
      '3. Strict speed limiting prevents shear-induced floc breakage.',
      '4. Quiescent laminar flow channels stream flocs into central clarifier wells.'
    ],
    keySpecs: [
      { labelBn: 'প্যাডেল স্পিড', labelEn: 'Paddle Speed', value: '12 - 25 RPM (3-Stage)' },
      { labelBn: 'ডিটেনশন টাইম', labelEn: 'Detention Time', value: '25 - 35 Minutes' },
      { labelBn: 'ফ্লক গ্রোথ সাইজ', labelEn: 'Average Floc Size', value: '1.5 - 3.5 mm' },
      { labelBn: 'জি-ভ্যালু রেঞ্জ', labelEn: 'G-Value (Velocity)', value: '50 to 15 s⁻¹' }
    ],
    workingPrincipleBn: 'মৃদু আলোড়নের ফিজিক্যাল কাইনেটিক্স ব্যবহার করে কণার আকার বৃদ্ধি করা হয় যেন মাধ্যাকর্ষণ শক্তিতে তা দ্রুত নিচে তলিয়ে যায়।',
    workingPrincipleEn: 'Hydrodynamic shear gradients maximize collision frequency while keeping shear below the floc yield threshold.',
    position3D: [-6, 2.5, -9],
    cameraTarget: [-6, 2.5, -9],
    cameraPosition: [-12, 12, 2],
    defaultTelemetry: {
      turbidityIn: 140,
      turbidityOut: 110,
      flowRate: 2360,
      phLevel: 7.1,
      pressure: 1.5,
      chemicalDose: 2.5,
      energyConsumption: 30,
      temperature: 24.5,
      tankLevel: 90,
      motorRpm: 18,
      efficiency: 96
    }
  },
  {
    id: 'clarifier_1',
    nameBn: 'থিতানো ট্যাংক ১ (Primary Clarifier)',
    nameEn: 'Primary Circular Clarifier & Scraper',
    categoryBn: 'সেডিমেন্টেশন ও তলানি পৃথকীকরণ',
    categoryEn: 'Sedimentation & Clarification',
    shortDescBn: 'ভারী ফ্লক ও ময়লা মাধ্যাকর্ষণের টানে ট্যাংকের তলায় জমা হয় এবং পরিষ্কার পানি উপচে পড়ে।',
    shortDescEn: 'Gravity settles heavy flocs to the cone hopper bottom while clarified water overflows peripheral weirs.',
    fullDescBn: 'বৃত্তাকার ক্ল্যারিফায়ার ট্যাংকে পানি কেন্দ্র থেকে ধীর গতিতে পরিধির দিকে প্রবাহিত হয়। কেন্দ্রবর্তী শান্ত জোনে ভারী ফ্লকগুলো ট্যাংকের ঢালু মেঝের দিকে জমা হয়। একটি ঘূর্ণায়মান ব্রিজ স্ক্র্যাপার ধীরে ধীরে তলানিকে কেন্দ্রীয় ড্রেনে পাঠায় এবং উপরিভাগের স্ফটিক স্বচ্ছ পানি ভি-নচ ওয়্যার দিয়ে ফিল্টারে চলে যায়।',
    fullDescEn: 'Circular radial-flow clarifier with a rotating bridge scraper. High-density flocs settle into the conical central sludge sump under gravity settling. Clarified surface effluent smoothly skims over peripheral V-notch weir launders.',
    processStepsBn: [
      '১. কেন্দ্রীয় স্টিলিং ওয়েল দিয়ে শান্ত গতিতে ফ্লোক মিশ্রিত পানির প্রবেশ।',
      '২. গ্র্যাভিটি থিতানো প্রক্রিয়ায় ৯৫% পর্যন্ত ভাসমান কণা ও ফ্লক নিচে তলানিতে রূপান্তর।',
      '৩. ঘূর্ণায়মান মেকানাইজড স্ক্র্যাপার আর্ম দ্বারা স্লাজকে কেন্দ্রীয় কূপে পুশ করা।',
      '৪. পেরিফেরাল ভি-নচ ওয়্যারের মাধ্যমে পরিচ্ছন্ন পানি ওভারফ্লো হয়ে ফিল্ট্রেশন লাইনে যাত্রা।'
    ],
    processStepsEn: [
      '1. Raw floc stream enters the central energy-dissipating feed well.',
      '2. Quiescent gravity settling removes over 92% of suspended solids.',
      '3. Rotating bottom scraper arm slowly plows settled sludge to the center hopper.',
      '4. Ultra-clear supernatant overflows through peripheral V-notch weirs.'
    ],
    keySpecs: [
      { labelBn: 'ট্যাংক ডায়ামিটার', labelEn: 'Tank Diameter', value: '32 Meters' },
      { labelBn: 'গভীরতা (সাইড ডেপথ)', labelEn: 'Side Water Depth', value: '4.5 Meters' },
      { labelBn: 'সারফেস লোডিং রেট', labelEn: 'Surface Overflow Rate', value: '1.2 m³/(m²·hr)' },
      { labelBn: 'স্ক্র্যাপার রোটেশন স্পিড', labelEn: 'Scraper Speed', value: '0.03 RPM (1 Rev / 35 min)' },
      { labelBn: 'টার্বিডিটি অপসারণ হার', labelEn: 'Turbidity Removal', value: '> 92%' }
    ],
    workingPrincipleBn: 'স্টোকস এর সূত্রানুসারে পানির ধীরগতির অনুভূমিক প্রবাহে ভারী কণার নিম্নগামী বেগ কাজ করে এবং পরিষ্কার পানি আলাদা হয়ে যায়।',
    workingPrincipleEn: 'Operates on Stokes Law of sedimentation: horizontal flow velocity is maintained far below the discrete settling velocity of agglomerated flocs.',
    position3D: [-8, 2, 4],
    cameraTarget: [-8, 2, 4],
    cameraPosition: [-16, 14, 16],
    defaultTelemetry: {
      turbidityIn: 110,
      turbidityOut: 8.5,
      flowRate: 1180,
      phLevel: 7.2,
      pressure: 1.1,
      chemicalDose: 0,
      energyConsumption: 18,
      temperature: 24.3,
      tankLevel: 96,
      motorRpm: 2,
      efficiency: 95
    }
  },
  {
    id: 'clarifier_2',
    nameBn: 'থিতানো ট্যাংক ২ (Secondary Clarifier)',
    nameEn: 'Secondary Circular Clarifier & Scraper',
    categoryBn: 'সেডিমেন্টেশন ও তলানি পৃথকীকরণ',
    categoryEn: 'Sedimentation & Clarification',
    shortDescBn: 'দ্বিতীয় বৃত্তাকার ক্ল্যারিফায়ার যা সমান্তরালভাবে অতিরিক্ত পানি পরিষ্কার ও থিতাতে কাজ করে।',
    shortDescEn: 'Twin secondary clarifier operating in parallel to handle high surge capacity and fine settlement.',
    fullDescBn: 'প্লান্টের মোট ওয়াটার লোড ভাগ করে নেওয়ার জন্য দ্বিতীয় এই বৃত্তাকার ক্ল্যারিফায়ারটি কাজ করে। এতে রয়েছে আলাদা সেন্ট্রাল স্টিলিং ওয়েল, স্টিল ট্রাস রোটেটিং ব্রিজ এবং সার্কুলার লাউণ্ডার চ্যানেল। এর ফলে পানির টার্বিডিটি ১৫ এনটিইউ এর নিচে নেমে আসে।',
    fullDescEn: 'Parallel twin circular clarifier providing redundant capacity. Features a rotating radial steel bridge, bottom squeegee blades, and scum skimmers ensuring crystal-clear clarified water feed into the filter building.',
    processStepsBn: [
      '১. প্রথম ক্ল্যারিফায়ারের সাথে সমান্তরাল লোড শেয়ারিং ও প্রবাহ নিয়ন্ত্রণ।',
      '২. পানির সূক্ষ্ম তলানি ধরে রেখে টার্বিডিটি ১০ NTU এর নিচে নামিয়ে আনা।',
      '৩. তলায় জমা স্লাজকে স্লাজ পাম্পিং স্টেশনের সাহায্যে থিকনার ট্যাংকে প্রেরণ।',
      '৪. সুষম চাপে পানিকে গ্র্যাভিটি ফিল্ট্রেশন ভবনে স্থানান্তর।'
    ],
    processStepsEn: [
      '1. Parallel load distribution from main distribution splitter chamber.',
      '2. Deep bed clarification dropping turbidity below 10 NTU.',
      '3. Underflow sludge continuously extracted by positive displacement pumps.',
      '4. Clarified water gravity channels direct flow into the filtration gallery.'
    ],
    keySpecs: [
      { labelBn: 'ট্যাংক ডায়ামিটার', labelEn: 'Tank Diameter', value: '32 Meters' },
      { labelBn: 'স্লাজ স্ক্র্যাপার ড্রাইভ', labelEn: 'Bridge Drive Power', value: '2.2 kW High Torque' },
      { labelBn: 'ডিটেনশন টাইম', labelEn: 'Retention Period', value: '3.2 Hours' },
      { labelBn: 'স্লাজ ভলিউম কনসেন্ট্রেশন', labelEn: 'Sludge Concentration', value: '2.5% Dry Solids' }
    ],
    workingPrincipleBn: 'দ্বৈত ক্ল্যারিফায়ার আর্কিটেকচার প্লান্টকে পিক আওয়ারে বা বর্ষাকালে অবিরাম বিশুদ্ধকরণ সক্ষমতা প্রদান করে।',
    workingPrincipleEn: 'Dual-train clarifier architecture provides operational redundancy and prevents hydraulic overloading during monsoon surges.',
    position3D: [5, 2, -4],
    cameraTarget: [5, 2, -4],
    cameraPosition: [-3, 14, 8],
    defaultTelemetry: {
      turbidityIn: 110,
      turbidityOut: 7.2,
      flowRate: 1180,
      phLevel: 7.2,
      pressure: 1.1,
      chemicalDose: 0,
      energyConsumption: 18,
      temperature: 24.3,
      tankLevel: 95,
      motorRpm: 2,
      efficiency: 97
    }
  },
  {
    id: 'filtration',
    nameBn: 'ফিল্ট্রেশন ভবন (Filtration Building)',
    nameEn: 'Rapid Sand & Carbon Filtration Facility',
    categoryBn: 'গভীর স্তরীভূত পরিস্রাবণ',
    categoryEn: 'Media Filtration & Adsorption',
    shortDescBn: 'বালু, অ্যানথ্রাসাইট ও অ্যাক্টিভেটেড কার্বন বেডের মাধ্যমে জীবাণু ও অদৃশ্য কণা ছাঁকন।',
    shortDescEn: 'Dual-media rapid gravity sand beds and granular activated carbon filters remove fine suspended solids.',
    fullDescBn: 'ফিল্ট্রেশন ভবনে একাধিক র‍্যাপিড গ্র্যাভিটি স্যান্ড ফিল্টার এবং অ্যাক্টিভেটেড কার্বন কলাম রয়েছে। কোয়ার্টজ বালি ও অ্যানথ্রাসাইট কয়লার স্তর অতিক্রম করার সময় পানির অতি সূক্ষ্ম কণা, ব্যাকটেরিয়া ও দুর্গন্ধ ৯৯.৯% দূর হয়ে টার্বিডিটি ০.৩ NTU এর নিচে চলে আসে। ফিল্টার ব্লক হলে স্বয়ংক্রিয় ব্যাকওয়াশ সিস্টেম চালু হয়।',
    fullDescEn: 'State-of-the-art filtration building housing multi-cell rapid gravity sand filters and pressurized granular activated carbon (GAC) vessels. Anthracite, silica sand, and garnet layers trap micro-turbidity down to <0.3 NTU while carbon adsorbs taste, odor, and organic chemicals.',
    processStepsBn: [
      '১. ক্ল্যারিফাইড পানি ফিল্টার বেডের উপরিভাগে সমানভাবে ছড়িয়ে দেওয়া।',
      '২. অ্যানথ্রাসাইট কয়লা, কোয়ার্টজ বালি ও গ্র্যাভেলের মধ্য দিয়ে পানির নিম্নগামী প্রাকৃতিক পরিস্রাবণ।',
      '৩. দানাদার কার্বন দ্বারা অপ্রয়োজনীয় গন্ধ, স্বাদ ও ক্ষতিকর দ্রবীভূত রাসায়নিক শোষণ।',
      '৪. ফিল্টারে হেড লস বাড়লে এয়ার ব্লোয়ার ও হাই-প্রেশার পানির সাহায্যে ব্যাকওয়াশ সম্পন্ন।'
    ],
    processStepsEn: [
      '1. Uniform influent weir distribution over dual-media bed surfaces.',
      '2. Downward percolation through anthracite, graded silica sand, and garnet gravel.',
      '3. GAC contact chambers eliminate trace organic compounds, pesticide residues, and odor.',
      '4. Differential pressure trigger initiates automated air scour and reverse backwash cycle.'
    ],
    keySpecs: [
      { labelBn: 'ফিল্ট্রেশন রেট', labelEn: 'Filtration Velocity', value: '7.5 m/hr' },
      { labelBn: 'মিডিয়া স্তর', labelEn: 'Media Bed Depth', value: 'Anthracite (450mm) + Sand (300mm)' },
      { labelBn: 'আউটপুট টার্বিডিটি', labelEn: 'Treated Turbidity', value: '< 0.3 NTU (WHO Standard)' },
      { labelBn: 'ব্যাকওয়াশ পাম্প', labelEn: 'Backwash Pumps', value: '4 x 75 kW High Flow' },
      { labelBn: 'কার্বন শোষণ ক্ষমতা', labelEn: 'Iodine Number', value: '> 950 mg/g' }
    ],
    workingPrincipleBn: 'ফিজিক্যাল ট্র্যাপিং, ইন্টারসেপশন এবং ইলেক্ট্রোস্ট্যাটিক অ্যাটম শোষণের মাধ্যমে পানির প্রতিটি ফোঁটাকে পরিশুদ্ধ করা হয়।',
    workingPrincipleEn: 'Combines mechanical straining, deep bed interception, Brownian diffusion, and physical carbon micropore adsorption.',
    position3D: [9, 2.5, 7],
    cameraTarget: [9, 2.5, 7],
    cameraPosition: [3, 14, 20],
    defaultTelemetry: {
      turbidityIn: 7.8,
      turbidityOut: 0.28,
      flowRate: 2320,
      phLevel: 7.25,
      pressure: 3.4,
      chemicalDose: 0,
      energyConsumption: 110,
      temperature: 24.2,
      tankLevel: 88,
      motorRpm: 1200,
      efficiency: 99.4
    }
  },
  {
    id: 'chlorination',
    nameBn: 'ক্লোরিনেশন ও ইউভি জীবাণুনাশক (UV & Chlorination)',
    nameEn: 'UV Reactors & Chemical Disinfection',
    categoryBn: 'জীবাণু বিনাশ ও সুরক্ষা',
    categoryEn: 'Disinfection & Pathogen Inactivation',
    shortDescBn: 'আল্ট্রাভায়োলেট রশ্মি ও সোডিয়াম হাইপোক্লোরাইট দ্বারা ১০০% ব্যাকটেরিয়া ও ভাইরাস ধ্বংস।',
    shortDescEn: 'High-intensity UV chambers and chlorine dosing eliminate 99.99% of bacteria, viruses, and pathogens.',
    fullDescBn: 'ফিল্ট্রেশন পরবর্তী নিরাপদ জীবানুমুক্তকরণের চূড়ান্ত ধাপ। পানি প্রথমে ইউভি রিঅ্যাক্টরের ভেতর দিয়ে প্রবাহিত হয়ে তাৎক্ষণিক ডিএনএ ধ্বংসের মাধ্যমে ব্যাকটেরিয়া নিষ্ক্রিয় করে। এরপর পাইপলাইনের দীর্ঘ যাত্রায় ব্যাকটেরিয়া পুনঃজন্ম রোধ করতে সুনির্দিষ্ট মাত্রায় ক্লোরিন গ্যাস / সোডিয়াম হাইপোক্লোরাইট মেশানো হয়।',
    fullDescEn: 'Dual-barrier disinfection consisting of medium-pressure closed-pipe UV reactors followed by automated sodium hypochlorite dosing. UV destroys cryptosporidium/giardia oocysts, while residual free chlorine ensures long-lasting microbiological security throughout the city pipeline network.',
    processStepsBn: [
      '১. ২৫৪ ন্যানোমিটার তরঙ্গদৈর্ঘ্যের আল্ট্রাভায়োলেট (UV) রশ্মির ভেতর দিয়ে পানির প্রবাহ।',
      '২. ক্লোরিন কন্টাক্ট চেম্বারে স্বয়ংক্রিয় গ্যাস বা লিকুইড ক্লোরিন ইনজেকশন।',
      '৩. ২০ মিনিট কন্টাক্ট টাইমে প্যাথোজেন ও ক্ষতিকর জীবাণু শতভাগ ধ্বংসকরণ।',
      '৪. ডিস্ট্রিবিউশন লাইনের জন্য রেসিডুয়াল ক্লোরিন (০.৫ - ১.০ mg/L) সংরক্ষণ।'
    ],
    processStepsEn: [
      '1. 254 nm germicidal UV lamp arrays instantly inactivate viruses and protozoa.',
      '2. Vacuum-feed gas chlorinators inject precise chlorine solution at the flash point.',
      '3. Serpentine contact baffle basin guarantees 20+ minutes of contact disinfection time.',
      '4. Amperometric residual analyzers maintain 0.6 - 0.8 ppm residual protection.'
    ],
    keySpecs: [
      { labelBn: 'ইউভি ডোজ ক্ষমতা', labelEn: 'UV Fluence Dose', value: '40 mJ/cm²' },
      { labelBn: 'ক্লোরিন ডোজিং রেট', labelEn: 'Chlorine Dosing Rate', value: '1.5 - 2.8 mg/L' },
      { labelBn: 'রেসিডুয়াল ক্লোরিন', labelEn: 'Residual Free Chlorine', value: '0.65 mg/L' },
      { labelBn: 'জীবাণু বিনাশ হার', labelEn: 'Log Pathogen Reduction', value: '99.99% (4-Log)' },
      { labelBn: 'ল্যাম্প লাইফস্টাইল', labelEn: 'UV Lamp Life', value: '12,000 Hours' }
    ],
    workingPrincipleBn: 'ইউভি ফোটন শক্তি প্যাথোজেনের নিউক্লিক অ্যাসিড ভেঙে প্রজনন বন্ধ করে এবং ক্লোরিন কোষ প্রাচীর জারিত করে ধ্বংস করে।',
    workingPrincipleEn: 'UV radiation disrupts microbial DNA pyrimidine dimers, while hypochlorous acid (HOCl) oxidizes bacterial cell walls.',
    position3D: [19, 2.5, -4],
    cameraTarget: [19, 2.5, -4],
    cameraPosition: [12, 11, 6],
    defaultTelemetry: {
      turbidityIn: 0.28,
      turbidityOut: 0.22,
      flowRate: 2310,
      phLevel: 7.3,
      pressure: 2.8,
      chemicalDose: 1.8,
      energyConsumption: 65,
      temperature: 24.1,
      tankLevel: 85,
      motorRpm: 950,
      efficiency: 99.9,
      freeChlorine: 0.68
    }
  },
  {
    id: 'storage_tanks',
    nameBn: 'বিশুদ্ধ পানির STORAGE TANKS',
    nameEn: 'Treated Pure Water Storage Reservoirs',
    categoryBn: 'পরিশোধিত পানি সংরক্ষণ ও সরবরাহ',
    categoryEn: 'Clean Water Storage & Distribution',
    shortDescBn: 'সম্পূর্ণ খাবার উপযোগী বিশুদ্ধ পানি বিশাল ডোম ট্যাংকে জমা করে শহরে সরবরাহ করা হয়।',
    shortDescEn: 'Twin massive domed clearwell reservoirs storing potable clean water for municipal distribution.',
    fullDescBn: 'বিশাল গোলাকার গম্বুজাকৃতির কংক্রিট ও স্টিল ট্যাংক যেখানে কোটি লিটার বিশুদ্ধ খাবার পানি সংরক্ষিত থাকে। এখান থেকে শক্তিশালী হাই-লিফট পাম্প স্টেশনের মাধ্যমে পুরো শহরের বাসাবাড়ি, হাসপাতাল ও কারখানায় ২৪/৭ নিরবচ্ছিন্ন বিশুদ্ধ পানি পাইপলাইনের মাধ্যমে সরবরাহ করা হয়।',
    fullDescEn: 'Dual mega-capacity prestressed concrete domed clearwells holding millions of liters of pristine potable water. High-lift booster pumping stations pressurize city municipal distribution trunk mains 24/7 with zero interruption.',
    processStepsBn: [
      '১. পরিশোধিত পানি আন্ডারগ্রাউন্ড ক্লিয়ারওয়েল চ্যানেলে সংগৃহীত হওয়া।',
      '২. দুটি বৃহৎ ডোম রিজার্ভার ট্যাংকে নিরাপদ সংরক্ষণ ও সার্বক্ষণিক পানির স্তর মনিটরিং।',
      '৩. অনলাইনে পানির স্বাদ, গন্ধ, পিএইচ ও ক্লোরিন লেভেল সেন্সর দিয়ে শেষবারের মতো পরীক্ষা।',
      '৪. ৪টি হাই-লিফট সেন্ট্রিফিউগাল পাম্প দিয়ে নগরীর পাইপলাইনে সরবরাহ।'
    ],
    processStepsEn: [
      '1. Polished clean water fills the enclosed clearwell balancing reservoirs.',
      '2. Twin domed ground storage tanks maintain dynamic emergency reserves.',
      '3. Final multi-parameter water quality verification (Turbidity <0.2, pH 7.3, Cl 0.65).',
      '4. High-lift variable speed distribution pumps pressurize city distribution grid.'
    ],
    keySpecs: [
      { labelBn: 'মোট ধারণক্ষমতা', labelEn: 'Total Storage Capacity', value: '45,000,000 Liters (45 ML)' },
      { labelBn: 'ট্যাংক উচ্চতা ও ব্যাস', labelEn: 'Tank Dimensions', value: 'Dia: 28m, Height: 16m' },
      { labelBn: 'বিতরণ পাম্প হেড', labelEn: 'Distribution Pressure', value: '6.5 Bar' },
      { labelBn: 'সেবাগ্রহীতা জনসংখ্যা', labelEn: 'Beneficiary Population', value: '850,000 Citizens' },
      { labelBn: 'দৈনিক মোট সরবরাহ', labelEn: 'Daily Plant Production', value: '55,000 m³/day' }
    ],
    workingPrincipleBn: 'কন্টিনিউয়াস প্রেশারাইজড ডিস্ট্রিবিউশন যাতে নগরীর পাইপলাইনে কোনো ব্যাকটেরিয়াল ব্যাক-সিফনেজ না ঘটে।',
    workingPrincipleEn: 'Positive hydraulic pressure gradient across city trunk lines prevents external groundwater infiltration.',
    position3D: [27, 4, 3],
    cameraTarget: [27, 4, 3],
    cameraPosition: [18, 16, 17],
    defaultTelemetry: {
      turbidityIn: 0.22,
      turbidityOut: 0.18,
      flowRate: 2280,
      phLevel: 7.35,
      pressure: 6.5,
      chemicalDose: 0,
      energyConsumption: 480,
      temperature: 23.9,
      tankLevel: 82,
      motorRpm: 1450,
      efficiency: 99.8,
      freeChlorine: 0.65,
      tds: 140
    }
  },
  {
    id: 'sludge_treatment',
    nameBn: 'স্লাজ ট্রিটমেন্ট ও ডিওয়াটারিং (Sludge Treatment)',
    nameEn: 'Sludge Thickening & Dewatering Plant',
    categoryBn: 'বর্জ্য প্রক্রিয়াকরণ ও পরিবেশ সুরক্ষা',
    categoryEn: 'Sludge Dewatering & Solid Waste Recycling',
    shortDescBn: 'ক্ল্যারিফায়ারের তলার বর্জ্য শুকিয়ে ড্রাই স্লাজ কেক তৈরি করে জৈব সার হিসেবে ব্যবহার।',
    shortDescEn: 'Gravity thickeners and high-pressure plate filter presses dewater sludge into dry eco-fertilizer cakes.',
    fullDescBn: 'ক্ল্যারিফায়ার ও ফিল্টার ব্যাকওয়াশ থেকে সংগৃহীত ঘোলা স্লাজকে গ্র্যাভিটি থিকনারে ঘন করা হয়। এরপর পলিমার সহযোগে হাই-প্রেশার মেমব্রেন ফিল্টার প্রেসে চাপ দিয়ে পানি বের করে শুকনো মাটির মতো স্লাজ কেক তৈরি করা হয়, যা ক্ষতিকর নয় এবং কৃষিতে সার বা ইট তৈরিতে কাজে লাগে। নিঃসৃত পরিষ্কার পানি পুনরায় নদীর ইনটেকে পাঠানো হয়।',
    fullDescEn: 'Underflow clarifier solids and filter backwash water are routed to gravity sludge thickeners. Polymer-conditioned sludge is squeezed in high-pressure filter presses into dry, manageable solid cakes suitable for agriculture or brick manufacturing, while filtrate water is recycled.',
    processStepsBn: [
      '১. ক্ল্যারিফায়ার তলানি থেকে স্লাজ পাম্প দিয়ে থিকনার ট্যাংকে জমা করা।',
      '২. পলিমার মিশিয়ে পানি ও কাদাকে আলাদা করার গতি ত্বরান্বিত করা।',
      '৩. মেমব্রেন ফিল্টার প্রেস মেশিনের প্লেটগুলোর মাঝে উচ্চচাপে পানি নিষ্কাশন।',
      '৪. শুকনো স্লাজ কেক ট্রাকে লোড করে পরিবেশবান্ধব পুনর্ব্যবহার।'
    ],
    processStepsEn: [
      '1. Sludge pumps collect thick underflow into circular gravity thickener.',
      '2. Cationic polymer conditioning accelerates liquid-solid phase separation.',
      '3. High-pressure plate-and-frame filter press compresses slurry at 16 bar.',
      '4. Dry, odorless sludge cakes are discharged to transport trucks for soil conditioning.'
    ],
    keySpecs: [
      { labelBn: 'স্লাজ কেক শুষ্কতা', labelEn: 'Cake Dry Solids (DS)', value: '32 - 38% DS' },
      { labelBn: 'ফিল্টার প্রেস চাপ', labelEn: 'Press Operating Pressure', value: '16 Bar Hydraulic' },
      { labelBn: 'পানি রিসাইক্লিং হার', labelEn: 'Filtrate Water Recovery', value: '98.5%' },
      { labelBn: 'দৈনিক স্লাজ উৎপাদন', labelEn: 'Daily Dry Cake Output', value: '14 Metric Tons' }
    ],
    workingPrincipleBn: 'জিরো লিকুইড ডিসচার্জ (ZLD) নীতিতে পানির অপচয় শূন্যে নামিয়ে এনে পরিবেশদূষণ রোধ।',
    workingPrincipleEn: 'Zero Liquid Discharge philosophy: 100% of liquid filtrate is recirculated, achieving closed-loop sustainability.',
    position3D: [19, 2, 15],
    cameraTarget: [19, 2, 15],
    cameraPosition: [11, 13, 26],
    defaultTelemetry: {
      turbidityIn: 4500,
      turbidityOut: 12,
      flowRate: 120,
      phLevel: 7.0,
      pressure: 15.8,
      chemicalDose: 4.2,
      energyConsumption: 75,
      temperature: 24.8,
      tankLevel: 74,
      motorRpm: 600,
      efficiency: 93
    }
  },
  {
    id: 'admin_building',
    nameBn: 'কেন্দ্রীয় স্ক্যাডা নিয়ন্ত্রণ ভবন (City SCADA Center)',
    nameEn: 'Administration & Central SCADA Control Center',
    categoryBn: 'কেন্দ্রীয় নিয়ন্ত্রণ ও অটোমেশন',
    categoryEn: 'Plant Automation & SCADA Monitoring',
    shortDescBn: 'প্লান্টের সব যন্ত্রাংশ, পাম্প, কেমিক্যাল ডোজিং ও সেন্সর ডাটা কেন্দ্রীয়ভাবে নিয়ন্ত্রণ করা হয়।',
    shortDescEn: 'Main engineering headquarters housing the industrial SCADA control room and quality laboratory.',
    fullDescBn: 'আধুনিক গ্লাস ফেসাডের দুই তলা বিশিষ্ট প্রশাসনিক ও স্ক্যাডা নিয়ন্ত্রণ ভবন। এখান থেকে প্লান্ট ইঞ্জিনিয়াররা কম্পিউটারে রিয়েল-টাইম পিএলসি (PLC) ড্যাশবোর্ড, পাইপলাইনের প্রেশার, ফ্লো-রেট, অটোমেটিক ভালভ এবং অ্যালার্ম পর্যবেক্ষণ ও রিমোট কন্ট্রোল করেন। ভবনে রয়েছে অত্যাধুনিক ওয়াটার কোয়ালিটি টেস্টিং ল্যাবরেটরি।',
    fullDescEn: 'A high-tech two-story administrative and automation center featuring a central multi-screen SCADA room and state-certified microbiology/chemistry lab. Operators supervise redundant PLCs, network pressures, automatic chemical dosing loops, and emergency safety overrides.',
    processStepsBn: [
      '১. পুরো প্লান্টের প্রতিটি সেন্সর ও পাম্পের ডাটা ফাইবার অপটিক নেটওয়ার্কে রিসিভ।',
      '২. অটো-টিউনিং অ্যালগরিদমের মাধ্যমে নদীর টার্বিডিটি অনুযায়ী কেমিক্যাল ডোজিং ক্যালকুলেশন।',
      '৩. কোনো ভালভ বা মোটরে অস্বাভাবিকতা দেখা দিলে অডিও-ভিজ্যুয়াল অ্যালার্ম ট্রিগার।',
      '৪. ২৪/৭ ল্যাবরেটরিতে ব্যাকটেরিয়া ও ভারী ধাতুর গুণগত মান অনুমোদন।'
    ],
    processStepsEn: [
      '1. High-speed industrial Ethernet relays field I/O data from all plant sensors.',
      '2. AI/PLC PID feedback loops auto-adjust alum and chlorine dosing based on real-time water quality.',
      '3. Predictive maintenance system forecasts pump bearing wear and filter clogging.',
      '4. Daily microbiological testing and water safety compliance certification.'
    ],
    keySpecs: [
      { labelBn: 'কন্ট্রোল সিস্টেম', labelEn: 'SCADA Architecture', value: 'Redundant Distributed PLC / DCS' },
      { labelBn: 'সেন্সর চ্যানেল', labelEn: 'Monitored I/O Points', value: '1,450 Real-Time Tags' },
      { labelBn: 'ল্যাবরেটরি রেটিং', labelEn: 'Testing Standard', value: 'ISO 17025 Certified' },
      { labelBn: 'জরুরি ব্যাকআপ পাওয়ার', labelEn: 'Emergency Generator', value: '2 x 1,250 kVA Diesel GenSet' }
    ],
    workingPrincipleBn: 'ফুল অটোমেশন ও ইন্ডাস্ট্রি ৪.০ প্রযুক্তির সাহায্যে ২৪ ঘণ্টা নিরবচ্ছিন্ন পানি পরিশোধন নিশ্চিতকরণ।',
    workingPrincipleEn: 'Industry 4.0 IoT analytics and fault-tolerant PLCs guarantee seamless municipal water security.',
    position3D: [16, 3, -15],
    cameraTarget: [16, 3, -15],
    cameraPosition: [7, 13, -4],
    defaultTelemetry: {
      turbidityIn: 165,
      turbidityOut: 0.18,
      flowRate: 2400,
      phLevel: 7.3,
      pressure: 6.5,
      chemicalDose: 0,
      energyConsumption: 1150,
      temperature: 22.0,
      tankLevel: 100,
      motorRpm: 0,
      efficiency: 99.9
    }
  }
];

export const PROCESS_STAGES_ORDER: EquipmentId[] = [
  'river_intake',
  'coagulation',
  'flocculation',
  'clarifier_1',
  'clarifier_2',
  'filtration',
  'chlorination',
  'storage_tanks',
  'sludge_treatment',
  'admin_building'
];
