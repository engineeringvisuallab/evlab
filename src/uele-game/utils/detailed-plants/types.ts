// Minimal type definitions, extracted from the standalone
// 3d-water-treatment-plant-visualization app, needed only by the
// detailed equipment model builders (no UI/telemetry types included).

export type PlantType = 'wtp' | 'stp' | 'swm' | 'etp';

export type WtpEquipmentId =
  | 'river_intake'
  | 'coagulation'
  | 'flocculation'
  | 'clarifier_1'
  | 'clarifier_2'
  | 'filtration'
  | 'chlorination'
  | 'storage_tanks'
  | 'sludge_treatment'
  | 'admin_building';

export type StpEquipmentId =
  | 'stp_inlet_screen'
  | 'stp_grit_chamber'
  | 'stp_primary_clarifier'
  | 'stp_aeration_tank'
  | 'stp_secondary_clarifier'
  | 'stp_tertiary_filtration'
  | 'stp_uv_chlorination'
  | 'stp_treated_sump'
  | 'stp_sludge_digester'
  | 'stp_admin_scada';

export type SwmEquipmentId =
  | 'swm_weighbridge_tipping'
  | 'swm_trommel_screen'
  | 'swm_magnetic_separator'
  | 'swm_optical_sorter'
  | 'swm_bailing_compactor'
  | 'swm_organic_composting'
  | 'swm_refuse_derived_fuel'
  | 'swm_biomethanation_plant'
  | 'swm_sanitary_landfill'
  | 'swm_admin_control';

export type EtpEquipmentId =
  | 'etp_equalization_tank'
  | 'etp_chemical_reaction_ph'
  | 'etp_daf_system'
  | 'etp_primary_tube_settler'
  | 'etp_aerobic_mbbr_tank'
  | 'etp_secondary_clarifier'
  | 'etp_tertiary_dual_media'
  | 'etp_sludge_filter_press'
  | 'etp_zero_liquid_discharge_ro'
  | 'etp_admin_scada_lab';

export type EquipmentId = WtpEquipmentId | StpEquipmentId | SwmEquipmentId | EtpEquipmentId;
