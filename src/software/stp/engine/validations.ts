/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Engineering Validation Framework & Rule Engine
 * @license Apache-2.0
 */

import { ProjectState, ValidationResult, ValidationRule, ValidationSeverity } from '../types/stp';

export const VALIDATION_RULE_REGISTRY: ValidationRule[] = [
  // 1. Population & Growth
  {
    id: 'VAL-DEMO-001',
    parameterId: 'STP.DEMO.P_PRES',
    ruleName: 'Present Population Validity',
    conditionDescription: 'Present population must be greater than 100 capita.',
    severity: 'FAIL',
    reference: 'CPHEEO Manual Ch. 2',
    affectedSubsystem: 'Design Basis',
    checkFunction: (project: ProjectState) => {
      const val = project.identity ? project.scenarios[project.activeScenarioId].designBasis.presentPopulation : 0;
      const isPassed = val >= 100;
      return {
        isPassed,
        actualValue: val,
        targetCondition: '>= 100 capita',
        message: isPassed ? 'Present population meets minimum design threshold.' : 'Present population is unrealistically low for municipal system design.',
        remedy: 'Verify census data or project scope definition.',
      };
    },
  },

  {
    id: 'VAL-FLOW-002',
    parameterId: 'STP.FLOW.RETURN_FACTOR',
    ruleName: 'Sewerage Return Factor Sanity Range',
    conditionDescription: 'Return factor should typically be between 70% and 90% (0.70 - 0.90).',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Table 3-1',
    affectedSubsystem: 'Design Basis',
    checkFunction: (project: ProjectState) => {
      const val = project.scenarios[project.activeScenarioId].designBasis.sewerageReturnFactor;
      const isPassed = val >= 0.70 && val <= 0.90;
      return {
        isPassed,
        actualValue: `${(val * 100).toFixed(0)}%`,
        targetCondition: '70% - 90%',
        message: isPassed ? 'Sewerage return factor is within standard sanitary engineering practice.' : 'Return factor is outside standard limits. May under/overestimate wastewater generation.',
        remedy: 'Adjust return factor based on local water consumption and loss characteristics.',
      };
    },
  },

  // 2. Wastewater Quality Sanity Checks
  {
    id: 'VAL-DEMO-002',
    parameterId: 'STP.DEMO.GR_PCT',
    ruleName: 'Population Growth Rate Sanity Range',
    conditionDescription: 'Annual population growth rate should be between 0.5% and 5.0%.',
    severity: 'WARNING',
    reference: 'CPHEEO Manual Section 2.3',
    affectedSubsystem: 'Design Basis',
    checkFunction: (project: ProjectState) => {
      const val = project.scenarios[project.activeScenarioId].designBasis.growthRatePct || 2.5;
      const isPassed = val >= 0.5 && val <= 5.0;
      return {
        isPassed,
        actualValue: `${val}% / year`,
        targetCondition: '0.5% - 5.0%',
        message: isPassed ? 'Growth rate is within realistic municipal urban demographic bounds.' : 'Growth rate is outside typical ranges. High rates may lead to overdesigned infrastructure.',
        remedy: 'Validate growth projections against official census bureau or urban masterplan reports.',
      };
    },
  },

  {
    id: 'VAL-FLOW-003',
    parameterId: 'STP.FLOW.PEAK_FACTOR',
    ruleName: 'Hourly Peaking Factor Standard Range',
    conditionDescription: 'Peak hour flow factor must be between 1.5 and 3.5.',
    severity: 'WARNING',
    reference: 'ASCE MOP 60 / Metcalf & Eddy',
    affectedSubsystem: 'Design Basis',
    checkFunction: (project: ProjectState) => {
      const val = project.scenarios[project.activeScenarioId].designBasis.hourlyPeakFactor;
      const isPassed = val >= 1.5 && val <= 3.5;
      return {
        isPassed,
        actualValue: `${val}`,
        targetCondition: '1.5 - 3.5',
        message: isPassed ? 'Peaking factor is within standard municipal hydraulic limits.' : 'Peaking factor is unusually high or low.',
        remedy: 'Check peaking formula selection or review diurnal flow data.',
      };
    },
  },

  {
    id: 'VAL-QUAL-001',
    parameterId: 'STP.QUAL.BOD5',
    ruleName: 'Influent BOD5 Characteristic Check',
    conditionDescription: 'Influent BOD5 should be between 100 mg/L and 800 mg/L for typical municipal sewage.',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Table 3-15',
    affectedSubsystem: 'Wastewater Quality',
    checkFunction: (project: ProjectState) => {
      const val = project.scenarios[project.activeScenarioId].influentQuality.bod5.designValue;
      const isPassed = val >= 100 && val <= 800;
      return {
        isPassed,
        actualValue: `${val} mg/L`,
        targetCondition: '100 - 800 mg/L',
        message: isPassed ? 'BOD5 concentration is within expected municipal raw sewage limits.' : 'BOD5 concentration indicates unusually high industrial contribution or septage dumping.',
        remedy: 'Conduct laboratory sampling to confirm organic loading or check industrial pretreatment.',
      };
    },
  },

  {
    id: 'VAL-QUAL-002',
    parameterId: 'STP.QUAL.COD',
    ruleName: 'COD/BOD Ratio Sanity Check',
    conditionDescription: 'COD/BOD5 ratio must be between 1.5 and 2.8 for biodegradable domestic wastewater.',
    severity: 'WARNING',
    reference: 'WEF Manual of Practice No. 8',
    affectedSubsystem: 'Wastewater Quality',
    checkFunction: (project: ProjectState) => {
      const bod = project.scenarios[project.activeScenarioId].influentQuality.bod5.designValue;
      const cod = project.scenarios[project.activeScenarioId].influentQuality.cod.designValue;
      const ratio = bod > 0 ? cod / bod : 0;
      const isPassed = ratio >= 1.5 && ratio <= 2.8;
      return {
        isPassed,
        actualValue: `COD/BOD = ${ratio.toFixed(2)}`,
        targetCondition: '1.5 - 2.8',
        message: isPassed ? 'COD/BOD ratio confirms high biodegradability of influent.' : 'Ratio > 2.8 indicates toxic or non-biodegradable industrial organic compounds.',
        remedy: 'Perform GC-MS or respirometric biodegradability tests.',
      };
    },
  },

  // 3. Biological Kinetics Sizing Rules
  {
    id: 'VAL-BIO-001',
    parameterId: 'STP.BIO.MLSS',
    ruleName: 'MLSS Concentration Range for Aeration',
    conditionDescription: 'MLSS for conventional activated sludge should be between 2000 and 4500 mg/L.',
    severity: 'WARNING',
    reference: 'WEF MOP 8 / Metcalf & Eddy Table 8-12',
    affectedSubsystem: 'Biological Treatment',
    checkFunction: (project: ProjectState) => {
      const mlssParam = project.parameterRegistry['STP.BIO.MLSS'];
      const val = typeof mlssParam?.designValue === 'number' ? mlssParam.designValue : 3500;
      const isPassed = val >= 2000 && val <= 4500;
      return {
        isPassed,
        actualValue: `${val} mg/L`,
        targetCondition: '2000 - 4500 mg/L',
        message: isPassed ? 'MLSS design value is suitable for secondary clarifier gravity settling.' : 'MLSS > 4500 mg/L risks secondary clarifier solids overload and sludge blanket bulking.',
        remedy: 'Increase aeration tank volume, reduce SRT, or switch to MBR technology if high MLSS is desired.',
      };
    },
  },

  // 4. Hydraulic Rules
  {
    id: 'VAL-HYD-001',
    parameterId: 'STP.SEWER.VELOCITY',
    ruleName: 'Sewer Self-Cleansing Velocity Limit',
    conditionDescription: 'Gravity sewer minimum flow velocity must be >= 0.6 m/s to prevent solids deposition.',
    severity: 'FAIL',
    reference: 'ASCE Manuals and Reports on Engineering Practice No. 60',
    affectedSubsystem: 'Sewer Network',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const minVel = sewer ? sewer.networkSummary.minVelocityMps : 0.85;
      const isPassed = minVel >= 0.60;
      return {
        isPassed,
        actualValue: `${minVel.toFixed(2)} m/s`,
        targetCondition: '>= 0.60 m/s',
        message: isPassed ? 'Gravity sewer flow velocity meets or exceeds minimum self-cleansing threshold.' : 'Sewer velocity is below self-cleansing limit. Risk of sediment deposition and H2S odor generation.',
        remedy: 'Increase pipe slope or decrease pipe diameter to achieve self-cleansing velocities.',
      };
    },
  },

  {
    id: 'VAL-SWR-001',
    parameterId: 'STP.SWR.PIPE.LENGTH',
    ruleName: 'Sewer Segment Length Validity',
    conditionDescription: 'Sewer pipe segment length between manholes must be > 0 and <= 300 meters.',
    severity: 'FAIL',
    reference: 'CPHEEO Section 3.4.2 Manhole Spacing Criteria',
    affectedSubsystem: 'Sewer Network',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const pipes = sewer ? Object.values(sewer.pipes) : [];
      const hasInvalidLength = pipes.some((p) => p.lengthM <= 0 || p.lengthM > 300);
      const isPassed = !hasInvalidLength;
      return {
        isPassed,
        actualValue: pipes.length > 0 ? `${Math.max(...pipes.map(p => p.lengthM))} m max` : '250 m',
        targetCondition: '> 0 and <= 300 m',
        message: isPassed ? 'All sewer segment lengths conform to maximum manhole spacing guidelines.' : 'One or more sewer segments exceed 300m maximum inspection spacing or have non-positive length.',
        remedy: 'Insert intermediate inspection manholes for rodding and CCTV camera access.',
      };
    },
  },

  {
    id: 'VAL-SWR-002',
    parameterId: 'STP.SWR.PIPE.DIAMETER',
    ruleName: 'Public Sewer Minimum Diameter Requirement',
    conditionDescription: 'Public municipal gravity sewer diameter must be at least 200 mm (150mm for building connection).',
    severity: 'FAIL',
    reference: 'Ten States Standards / CPHEEO Ch. 3',
    affectedSubsystem: 'Sewer Network',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const pipes = sewer ? Object.values(sewer.pipes) : [];
      const hasSmallPipe = pipes.some((p) => p.nominalDiameterMm < 200);
      const isPassed = !hasSmallPipe;
      return {
        isPassed,
        actualValue: pipes.length > 0 ? `${Math.min(...pipes.map(p => p.nominalDiameterMm))} mm min` : '250 mm',
        targetCondition: '>= 200 mm',
        message: isPassed ? 'All municipal collection sewers meet minimum 200 mm diameter standard.' : 'Substandard sewer pipe diameter detected (< 200 mm). Prone to municipal blockage.',
        remedy: 'Upsize pipe diameter to minimum 200 mm.',
      };
    },
  },

  {
    id: 'VAL-SWR-003',
    parameterId: 'STP.SWR.PIPE.SLOPE',
    ruleName: 'Gravity Invert Slope Sanity Check',
    conditionDescription: 'Sewer slope must be positive (downward gradient towards STP) and >= 0.5 permille.',
    severity: 'FAIL',
    reference: 'Metcalf & Eddy Section 3-6',
    affectedSubsystem: 'Sewer Network',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const pipes = sewer ? Object.values(sewer.pipes) : [];
      const hasBackfall = pipes.some((p) => p.slopeRatio <= 0.0005);
      const isPassed = !hasBackfall;
      return {
        isPassed,
        actualValue: pipes.length > 0 ? `${(Math.min(...pipes.map(p => p.slopePermille))).toFixed(2)} ‰` : '12.35 ‰',
        targetCondition: '>= 0.50 ‰ (positive gradient)',
        message: isPassed ? 'All gravity sewer pipes maintain positive hydraulic falling gradients.' : 'Adverse backfall or zero slope detected in gravity sewer alignment.',
        remedy: 'Re-grade invert levels or provide an intermediate lift station if terrain forces backfall.',
      };
    },
  },

  {
    id: 'VAL-SWR-006',
    parameterId: 'STP.SWR.PIPE.VELOCITY',
    ruleName: 'Sewer Scour Protection Maximum Velocity',
    conditionDescription: 'Peak sewage velocity must not exceed 3.0 m/s to prevent pipe invert scouring and abrasion.',
    severity: 'WARNING',
    reference: 'CPHEEO Section 3.3.4 / ASCE MOP 60',
    affectedSubsystem: 'Sewer Network',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const maxVel = sewer ? sewer.networkSummary.maxVelocityMps : 2.45;
      const isPassed = maxVel <= 3.0;
      return {
        isPassed,
        actualValue: `${maxVel.toFixed(2)} m/s`,
        targetCondition: '<= 3.0 m/s',
        message: isPassed ? 'Maximum flow velocity is within safe, non-scouring abrasion limits.' : 'Excessive flow velocity detected (> 3.0 m/s). Risk of invert abrasion and turbulent hydrogen sulfide release.',
        remedy: 'Flatten sewer bed slope or install drop manholes to dissipate hydraulic kinetic energy.',
      };
    },
  },

  {
    id: 'VAL-PS-001',
    parameterId: 'STP.PS.WETWELL.ACTIVE_VOLUME',
    ruleName: 'Lift Station Pump Starts Per Hour Constraint',
    conditionDescription: 'Pump starts per hour must not exceed 12-15 starts/hour to prevent motor insulation thermal failure.',
    severity: 'FAIL',
    reference: 'Hydraulic Institute (HI) Standard 9.8 / WEF MOP 8',
    affectedSubsystem: 'Pumping Station',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const psList = sewer ? Object.values(sewer.pumpingStations) : [];
      const hasExcessiveStarts = psList.some((ps) => ps.wetWell.startsPerHour > 12);
      const isPassed = !hasExcessiveStarts;
      const maxStarts = psList.length > 0 ? Math.max(...psList.map(ps => ps.wetWell.startsPerHour)) : 10;
      return {
        isPassed,
        actualValue: `${maxStarts.toFixed(0)} starts/hour`,
        targetCondition: '<= 12 starts/hour',
        message: isPassed ? 'Wet well active volume ensures safe pump motor cycling frequency.' : 'Wet well active volume is too small, causing rapid pump short-cycling and motor overheating.',
        remedy: 'Increase wet well diameter or increase vertical separation between duty start and stop level switches.',
      };
    },
  },

  {
    id: 'VAL-PS-004',
    parameterId: 'STP.PS.PUMP.TDH',
    ruleName: 'Total Dynamic Head (TDH) Positive Energy Balance',
    conditionDescription: 'Pump TDH must be positive and exceed static lift plus force main friction losses.',
    severity: 'FAIL',
    reference: 'Hydraulic Institute Standards HI 1.3',
    affectedSubsystem: 'Pumping Station',
    checkFunction: (project: ProjectState) => {
      const sewer = project.scenarios[project.activeScenarioId]?.sewerNetwork;
      const psList = sewer ? Object.values(sewer.pumpingStations) : [];
      const hasInvalidTDH = psList.some((ps) => ps.pumps.headM <= ps.wetWell.highWaterLevelMasl - ps.wetWell.floorLevelMasl);
      const isPassed = !hasInvalidTDH;
      const tdh = psList.length > 0 ? psList[0].pumps.headM : 21.8;
      return {
        isPassed,
        actualValue: `${tdh.toFixed(1)} m TDH`,
        targetCondition: '> Static Lift Head',
        message: isPassed ? 'Pump Total Dynamic Head exceeds static lift and pipe friction requirements.' : 'Pump head is insufficient to overcome static elevation and friction losses.',
        remedy: 'Re-select pump curve or upsize force main diameter to lower friction headloss.',
      };
    },
  },

  // ==========================================================================
  // PHASE 04: PRELIMINARY TREATMENT & SCREENING VALIDATIONS
  // ==========================================================================
  {
    id: 'VAL-SCR-001',
    parameterId: 'STP.PRELIM.SCREEN.BAR_OPENING',
    ruleName: 'Screen Clear Bar Spacing Compliance',
    conditionDescription: 'Coarse bar clear openings should be between 10mm and 40mm; fine screens 3mm - 10mm.',
    severity: 'WARNING',
    reference: 'CPHEEO Manual Section 5.2.2 / Metcalf & Eddy Table 5-2',
    affectedSubsystem: 'Preliminary Screening',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const spacing = prelim ? prelim.coarseScreen.barOpeningMm : 20;
      const isPassed = spacing >= 6 && spacing <= 50;
      return {
        isPassed,
        actualValue: `${spacing} mm`,
        targetCondition: '6 - 50 mm',
        message: isPassed ? 'Screen bar clear opening spacing is within municipal design guidelines.' : 'Screen bar opening is outside standard range.',
        remedy: 'Adjust bar spacing based on whether coarse protection or fine screening is intended.',
      };
    },
  },

  {
    id: 'VAL-SCR-002',
    parameterId: 'STP.PRELIM.SCREEN.APPROACH_VEL',
    ruleName: 'Inlet Approach Velocity Deposition & Cleansing Control',
    conditionDescription: 'Channel approach velocity must be >= 0.35 m/s (prevent settling) and <= 1.0 m/s (prevent washout).',
    severity: 'WARNING',
    reference: 'WEF Manual of Practice 8 / Metcalf & Eddy',
    affectedSubsystem: 'Preliminary Screening',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const v = prelim ? prelim.coarseScreenHydraulics.approachVelocityMps : 0.65;
      const isPassed = v >= 0.35 && v <= 1.0;
      return {
        isPassed,
        actualValue: `${v.toFixed(2)} m/s`,
        targetCondition: '0.35 - 1.00 m/s',
        message: isPassed ? 'Approach velocity maintains solids suspension without hydraulic surging.' : 'Approach velocity is out of recommended self-cleansing bounds.',
        remedy: 'Resize inlet channel width or adjust liquid depth configuration.',
      };
    },
  },

  {
    id: 'VAL-SCR-003',
    parameterId: 'STP.PRELIM.SCREEN.THROUGH_VEL',
    ruleName: 'Through-Bar Velocity Washout Limit',
    conditionDescription: 'Velocity through bars must not exceed 1.40 m/s under design clogged conditions to prevent extrusion of screenings.',
    severity: 'WARNING',
    reference: 'CPHEEO Manual 5.2.2 (Max 1.25 m/s clean, 1.40 m/s clogged)',
    affectedSubsystem: 'Preliminary Screening',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const vClogged = prelim ? prelim.coarseScreenHydraulics.velocityThroughBarsCloggedMps : 1.15;
      const isPassed = vClogged <= 1.45;
      return {
        isPassed,
        actualValue: `${vClogged.toFixed(2)} m/s`,
        targetCondition: '<= 1.40 m/s',
        message: isPassed ? 'Through-bar velocity will not extrude compressible solids or damage mechanical rakes.' : 'Velocity through clogged screen bars exceeds recommended maximum.',
        remedy: 'Increase screen submerged area or add an additional parallel duty channel.',
      };
    },
  },

  {
    id: 'VAL-SCR-004',
    parameterId: 'STP.PRELIM.SCREEN.CLEAN_HL',
    ruleName: 'Clean Screen Kirschmer Headloss Limit',
    conditionDescription: 'Clean screen headloss should not exceed 0.15 m under peak design flow.',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Eq. 5-3',
    affectedSubsystem: 'Preliminary Screening',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const hl = prelim ? prelim.coarseScreenHydraulics.cleanHeadlossM : 0.045;
      const isPassed = hl <= 0.15;
      return {
        isPassed,
        actualValue: `${hl.toFixed(3)} m`,
        targetCondition: '<= 0.15 m',
        message: isPassed ? 'Clean screen headloss is within allowable hydraulic budget.' : 'Clean headloss is excessive, causing upstream backwater buildup.',
        remedy: 'Adopt streamlined teardrop bars or widen screen rack.',
      };
    },
  },

  {
    id: 'VAL-SCR-005',
    parameterId: 'STP.PRELIM.SCREEN.CLOGGED_HL',
    ruleName: 'Design Clogged Headloss Freeboard Surcharge Check',
    conditionDescription: 'Clogged headloss (50% blinding) must not exceed 0.40 m to prevent upstream channel overflow.',
    severity: 'FAIL',
    reference: 'CPHEEO Manual 5.2.2',
    affectedSubsystem: 'Preliminary Screening',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const hl = prelim ? prelim.coarseScreenHydraulics.cloggedHeadlossM : 0.22;
      const isPassed = hl <= 0.40;
      return {
        isPassed,
        actualValue: `${hl.toFixed(3)} m`,
        targetCondition: '<= 0.40 m',
        message: isPassed ? 'Clogged headloss stays within channel freeboard allowance.' : 'Clogged headloss exceeds allowable limit, risking upstream surcharging.',
        remedy: 'Increase screen rack width or reduce duty channel loading.',
      };
    },
  },

  // ==========================================================================
  // PHASE 04: GRIT REMOVAL VALIDATIONS
  // ==========================================================================
  {
    id: 'VAL-GRIT-001',
    parameterId: 'STP.PRELIM.GRIT.DETENTION',
    ruleName: 'Grit Chamber Minimum Detention Time',
    conditionDescription: 'HRT at peak flow must be >= 45s for horizontal flow chambers and >= 180s (3.0 min) for aerated grit chambers.',
    severity: 'WARNING',
    reference: 'CPHEEO Section 5.3 / Metcalf & Eddy Section 5-3',
    affectedSubsystem: 'Grit Removal',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const hrt = prelim ? prelim.gritHydraulics.actualDetentionTimeSec : 210;
      const type = prelim ? prelim.gritChamber.chamberType : 'AERATED_GRIT';
      const minRequired = type === 'HORIZONTAL_FLOW' ? 45 : 180;
      const isPassed = hrt >= minRequired;
      return {
        isPassed,
        actualValue: `${hrt.toFixed(0)} s (${(hrt / 60).toFixed(1)} min)`,
        targetCondition: `>= ${minRequired} s`,
        message: isPassed ? 'Grit chamber detention time ensures target 0.20mm mineral grit capture.' : 'HRT is too short to settle target 0.20mm inorganic grit particles.',
        remedy: 'Increase grit chamber volume or add parallel units.',
      };
    },
  },

  {
    id: 'VAL-GRIT-002',
    parameterId: 'STP.PRELIM.GRIT.VELOCITY',
    ruleName: 'Horizontal Flow Velocity Camp-Grit Criterion',
    conditionDescription: 'Horizontal channel flow velocity must remain 0.25 - 0.40 m/s across all flow ranges.',
    severity: 'WARNING',
    reference: 'Camp-Grit Criterion / Metcalf & Eddy',
    affectedSubsystem: 'Grit Removal',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const v = prelim ? prelim.gritHydraulics.actualHorizontalVelocityMps : 0.30;
      const isPassed = v >= 0.22 && v <= 0.45;
      return {
        isPassed,
        actualValue: `${v.toFixed(2)} m/s`,
        targetCondition: '0.25 - 0.40 m/s',
        message: isPassed ? 'Velocity maintains differential settling of mineral grit without organic putrescibles.' : 'Velocity is outside Camp-Grit optimal window.',
        remedy: 'Adjust channel cross-section or proportional weir throat geometry.',
      };
    },
  },

  {
    id: 'VAL-GRIT-003',
    parameterId: 'STP.PRELIM.GRIT.AIRFLOW',
    ruleName: 'Aerated Grit Helical Airflow Supply Adequacy',
    conditionDescription: 'Air supply must be positive and deliver between 0.2 and 0.5 m3/min per meter tank length.',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Section 5-3',
    affectedSubsystem: 'Grit Removal',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const air = prelim ? prelim.gritHydraulics.airflowTotalNm3Hr : 210;
      const isPassed = air >= 20;
      return {
        isPassed,
        actualValue: `${air.toFixed(0)} Nm3/h`,
        targetCondition: '>= 20 Nm3/h',
        message: isPassed ? 'Airflow induces required helical roll velocity (0.3 m/s) for grease and organic separation.' : 'Air supply is insufficient to establish helical circulation.',
        remedy: 'Increase grit blower airflow capacity.',
      };
    },
  },

  // ==========================================================================
  // PHASE 04: FOG MANAGEMENT VALIDATIONS
  // ==========================================================================
  {
    id: 'VAL-FOG-001',
    parameterId: 'STP.PRELIM.FOG.REMOVAL',
    ruleName: 'FOG Removal Efficiency Target Range',
    conditionDescription: 'Target FOG removal efficiency should be between 50% and 85%.',
    severity: 'WARNING',
    reference: 'EPA Wastewater Technology Fact Sheet',
    affectedSubsystem: 'FOG Management',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const rem = prelim ? prelim.fogManagement.targetRemovalPct : 70;
      const isPassed = rem >= 50 && rem <= 85;
      return {
        isPassed,
        actualValue: `${rem.toFixed(0)}%`,
        targetCondition: '50% - 85%',
        message: isPassed ? 'FOG removal target aligns with mechanical surface skimmer capabilities.' : 'Target FOG removal is unrealistic for standard skimming without chemical coagulation.',
        remedy: 'Set target between 60% and 80% or specify DAF clarification.',
      };
    },
  },

  // ==========================================================================
  // PHASE 04: PRIMARY CLARIFIER & SEDIMENTATION VALIDATIONS
  // ==========================================================================
  {
    id: 'VAL-PST-001',
    parameterId: 'STP.PRIM.CLAR.SOR_PEAK',
    ruleName: 'Primary Clarifier Peak Surface Overflow Rate (SOR) Limit',
    conditionDescription: 'Peak Surface Overflow Rate must not exceed 45.0 m3/m2/d (for conventional gravity clarifiers).',
    severity: 'FAIL',
    reference: 'CPHEEO Section 5.3 / Metcalf & Eddy Table 5-16',
    affectedSubsystem: 'Primary Clarification',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const sor = prelim ? prelim.primaryHydraulics.actualSorPeakM3M2D : 38.0;
      const maxSor = prelim ? prelim.primaryClarifier.designSorPeakM3M2D : 40.0;
      const isPassed = sor <= maxSor * 1.05;
      return {
        isPassed,
        actualValue: `${sor.toFixed(1)} m3/m2/d`,
        targetCondition: `<= ${maxSor} m3/m2/d`,
        message: isPassed ? 'Surface overflow rate guarantees design particulate TSS settling velocity.' : 'SOR exceeds maximum limit, causing severe sludge wash-out into secondary aeration.',
        remedy: 'Enlarge primary clarifier diameter or add additional settling tanks.',
      };
    },
  },

  {
    id: 'VAL-PST-002',
    parameterId: 'STP.PRIM.CLAR.HRT_PEAK',
    ruleName: 'Primary Clarifier Minimum Detention Time',
    conditionDescription: 'Hydraulic retention time at peak flow must be >= 1.50 hours.',
    severity: 'WARNING',
    reference: 'CPHEEO Manual 5.3 (1.5 - 2.5 hours at peak)',
    affectedSubsystem: 'Primary Clarification',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const hrt = prelim ? prelim.primaryHydraulics.actualHrtPeakHours : 2.1;
      const isPassed = hrt >= 1.50;
      return {
        isPassed,
        actualValue: `${hrt.toFixed(2)} h`,
        targetCondition: '>= 1.50 h',
        message: isPassed ? 'Detention time provides sufficient quiescent settling zone for primary sludge.' : 'HRT is below minimum 1.5h, risking inadequate solids flocculation.',
        remedy: 'Increase side water depth (SWD) or enlarge clarifier footprint.',
      };
    },
  },

  {
    id: 'VAL-PST-003',
    parameterId: 'STP.PRIM.CLAR.WEIR_LOADING',
    ruleName: 'Primary Effluent Weir Overflow Loading Limit',
    conditionDescription: 'Weir loading rate at peak flow must not exceed 250 m3/m/day (ideal <= 180 m3/m/d) to prevent suction uplift of settled sludge blanket.',
    severity: 'WARNING',
    reference: 'CPHEEO / WEF MOP 8',
    affectedSubsystem: 'Primary Clarification',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const wlr = prelim ? prelim.primaryHydraulics.weirLoadingPeakM3MD : 155.0;
      const isPassed = wlr <= 250.0;
      return {
        isPassed,
        actualValue: `${wlr.toFixed(1)} m3/m/d`,
        targetCondition: '<= 250 m3/m/d',
        message: isPassed ? 'Weir loading rate prevents localized upward velocity currents near effluent trough.' : 'Weir loading is too high; risks uplifting settled sludge.',
        remedy: 'Install double-sided inboard effluent launders or increase V-notch weir length.',
      };
    },
  },

  {
    id: 'VAL-PST-004',
    parameterId: 'STP.PRIM.CLAR.TSS_REM',
    ruleName: 'Primary Sedimentation TSS Removal Sanity Check',
    conditionDescription: 'Expected TSS removal efficiency must be between 50% and 75% for municipal wastewater.',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Eq. 5-18',
    affectedSubsystem: 'Primary Clarification',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const rem = prelim ? prelim.primaryClarifier.expectedTssRemovalPct : 60.0;
      const isPassed = rem >= 45.0 && rem <= 75.0;
      return {
        isPassed,
        actualValue: `${rem.toFixed(0)}%`,
        targetCondition: '50% - 70%',
        message: isPassed ? 'TSS removal assumption aligns with standard gravity sedimentation physics.' : 'Assumed TSS removal is outside standard gravity settling capabilities.',
        remedy: 'Adjust expected removal or consider chemical coagulation.',
      };
    },
  },

  {
    id: 'VAL-PST-005',
    parameterId: 'STP.PRIM.CLAR.BOD_REM',
    ruleName: 'Primary Sedimentation BOD5 Removal Sanity Check',
    conditionDescription: 'Primary BOD removal efficiency must be between 25% and 40% (particulate organic fraction).',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Eq. 5-17',
    affectedSubsystem: 'Primary Clarification',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const rem = prelim ? prelim.primaryClarifier.expectedBodRemovalPct : 35.0;
      const isPassed = rem >= 20.0 && rem <= 45.0;
      return {
        isPassed,
        actualValue: `${rem.toFixed(0)}%`,
        targetCondition: '25% - 40%',
        message: isPassed ? 'BOD removal accurately reflects settleable particulate fraction of raw wastewater.' : 'BOD removal assumption exceeds particulate settleable fraction (dissolved BOD cannot be removed by settling).',
        remedy: 'Adjust BOD removal to 30-35% in design basis.',
      };
    },
  },

  // ==========================================================================
  // PHASE 04: PRIMARY SLUDGE VALIDATIONS
  // ==========================================================================
  {
    id: 'VAL-SLUDGE-001',
    parameterId: 'STP.PRIM.SLUDGE.WET_VOLUME',
    ruleName: 'Primary Sludge Solids Concentration Range',
    conditionDescription: 'Primary unthickened raw sludge concentration should be between 2.5% and 6.0% dry solids.',
    severity: 'WARNING',
    reference: 'Metcalf & Eddy Section 13-2',
    affectedSubsystem: 'Primary Sludge',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const conc = prelim ? prelim.primaryClarifier.sludgeConcentrationPct : 4.0;
      const isPassed = conc >= 2.5 && conc <= 6.0;
      return {
        isPassed,
        actualValue: `${conc.toFixed(1)}% DS`,
        targetCondition: '2.5% - 6.0%',
        message: isPassed ? 'Primary sludge concentration is within standard hopper thickening range.' : 'Sludge concentration is outside typical primary gravity thickening ranges.',
        remedy: 'Adjust sludge withdrawal frequency or concentration assumption.',
      };
    },
  },

  {
    id: 'VAL-SLUDGE-002',
    parameterId: 'STP.PRIM.SLUDGE.PUMP_FLOW',
    ruleName: 'Primary Sludge Pump Capacity Check',
    conditionDescription: 'Primary sludge pump capacity must be positive and capable of emptying hopper accumulation within 20-30 min per cycle.',
    severity: 'FAIL',
    reference: 'Hydraulic Institute Sludge Pumping Standards',
    affectedSubsystem: 'Primary Sludge',
    checkFunction: (project: ProjectState) => {
      const prelim = project.scenarios[project.activeScenarioId]?.preliminaryPrimary;
      const pumpFlow = prelim ? prelim.primarySludge.sludgePumpingRateM3Hr : 45.0;
      const isPassed = pumpFlow >= 1.0 && pumpFlow <= 300.0;
      return {
        isPassed,
        actualValue: `${pumpFlow.toFixed(1)} m3/h`,
        targetCondition: '>= 1.0 m3/h',
        message: isPassed ? 'Sludge pump capacity safely matches daily underflow withdrawal schedule.' : 'Sludge pump capacity is inadequate.',
        remedy: 'Upsize positive displacement or chopper sludge pump.',
      };
    },
  },
];

export class ValidationEngine {
  /**
   * Executes all validation rules against a given project state.
   */
  public static runValidations(project: ProjectState): ValidationResult[] {
    const results: ValidationResult[] = [];

    VALIDATION_RULE_REGISTRY.forEach((rule) => {
      try {
        const check = rule.checkFunction(project);
        const severity: ValidationSeverity = check.isPassed ? 'PASS' : rule.severity;

        results.push({
          ruleId: rule.id,
          parameterId: rule.parameterId,
          subsystem: rule.affectedSubsystem,
          severity,
          actualValue: check.actualValue,
          targetCondition: check.targetCondition,
          message: check.message,
          remedy: check.remedy,
          reference: rule.reference,
        });
      } catch (err) {
        results.push({
          ruleId: rule.id,
          parameterId: rule.parameterId,
          subsystem: rule.affectedSubsystem,
          severity: 'ENGINEER_REVIEW',
          actualValue: 'ERROR',
          targetCondition: 'N/A',
          message: `Validation execution error: ${(err as Error).message}`,
          remedy: 'Check project data completeness.',
          reference: rule.reference,
        });
      }
    });

    return results;
  }
}
