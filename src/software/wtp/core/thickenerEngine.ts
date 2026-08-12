/**
 * WTP Engineering Suite - Phase 09
 * Sludge Thickening, Conditioning & Dewatering Engine
 * Supports Gravity Thickener, DAF, Filter Press, Belt Press, Centrifuge, Screw Press, Drying Bed & Geobags
 */

export interface GravityThickenerResult {
  feedFlowM3Day: number;
  feedSolidsPercent: number;
  drySolidsKgDay: number;
  designSolidsLoadingRateKgM2Day: number;
  requiredSurfaceAreaM2: number;
  calculatedDiameterM: number;
  recommendedDiameterM: number;
  sideWaterDepthM: number;
  totalVolumeM3: number;
  hydraulicDetentionHours: number;
  underflowSolidsPercent: number;
  underflowSludgeM3Day: number;
  overflowFlowM3Day: number;
  solidsCapturePercent: number;
}

export interface DafThickenerResult {
  feedFlowM3Day: number;
  drySolidsKgDay: number;
  airToSolidsRatio: number;
  recycleRatioPercent: number;
  saturationPressureBar: number;
  requiredTankAreaM2: number;
  hydraulicLoadingM3M2Hr: number;
  floatSolidsPercent: number;
  floatSludgeM3Day: number;
  subnatantFlowM3Day: number;
}

export interface DewateringResult {
  technologyType: 'FILTER_PRESS' | 'BELT_FILTER_PRESS' | 'CENTRIFUGE' | 'SCREW_PRESS' | 'DRYING_BED' | 'GEOBAG';
  feedFlowM3Day: number;
  feedSolidsPercent: number;
  drySolidsKgDay: number;
  cakeSolidsPercent: number;
  dailyCakeMassKgDay: number;
  dailyCakeVolumeM3Day: number;
  filtrateFlowM3Day: number;
  polymerDoseKgPerTonDs: number;
  dailyPolymerConsumptionKgDay: number;
  solidsCapturePercent: number;
  operatingHoursPerDay: number;
  numberOfUnits: number;
  sizingDetails: string;
}

/**
 * 1. Calculate Gravity Thickener Dimensions and Performance
 */
export function calculateGravityThickener(
  feedFlowM3Day: number,
  feedSolidsPercent: number = 2.5,
  solidsLoadingRateKgM2Day: number = 35.0,
  targetUnderflowSolidsPercent: number = 4.5,
  solidsCapturePercent: number = 92.0
): GravityThickenerResult {
  const drySolidsKgDay = feedFlowM3Day * (feedSolidsPercent / 100) * 1000;
  const requiredArea = drySolidsKgDay / solidsLoadingRateKgM2Day;
  const rawDia = Math.sqrt((4 * requiredArea) / Math.PI);
  const recommendedDia = Math.ceil(rawDia * 2) / 2; // round to nearest 0.5m
  const actualArea = (Math.PI * Math.pow(recommendedDia, 2)) / 4;

  const sideWaterDepthM = 3.5;
  const totalVolumeM3 = actualArea * sideWaterDepthM;
  const hydraulicDetentionHours = (totalVolumeM3 / feedFlowM3Day) * 24;

  const capturedSolidsKgDay = drySolidsKgDay * (solidsCapturePercent / 100);
  const underflowSludgeM3Day = capturedSolidsKgDay / (targetUnderflowSolidsPercent / 100 * 1000);
  const overflowFlowM3Day = Math.max(0, feedFlowM3Day - underflowSludgeM3Day);

  return {
    feedFlowM3Day,
    feedSolidsPercent,
    drySolidsKgDay: Number(drySolidsKgDay.toFixed(1)),
    designSolidsLoadingRateKgM2Day: solidsLoadingRateKgM2Day,
    requiredSurfaceAreaM2: Number(requiredArea.toFixed(1)),
    calculatedDiameterM: Number(rawDia.toFixed(2)),
    recommendedDiameterM: recommendedDia,
    sideWaterDepthM,
    totalVolumeM3: Number(totalVolumeM3.toFixed(1)),
    hydraulicDetentionHours: Number(hydraulicDetentionHours.toFixed(1)),
    underflowSolidsPercent: targetUnderflowSolidsPercent,
    underflowSludgeM3Day: Number(underflowSludgeM3Day.toFixed(1)),
    overflowFlowM3Day: Number(overflowFlowM3Day.toFixed(1)),
    solidsCapturePercent
  };
}

/**
 * 2. Calculate Dissolved Air Flotation (DAF) Thickener Framework
 */
export function calculateDafThickener(
  feedFlowM3Day: number,
  feedSolidsPercent: number = 1.0,
  airToSolidsRatio: number = 0.03,
  recycleRatioPercent: number = 30.0,
  saturationPressureBar: number = 5.0
): DafThickenerResult {
  const drySolidsKgDay = feedFlowM3Day * (feedSolidsPercent / 100) * 1000;
  const hydraulicLoading = 4.0; // m3/m2-hr
  const totalHydraulicFlowM3Hr = (feedFlowM3Day * (1 + recycleRatioPercent / 100)) / 24;
  const requiredTankAreaM2 = totalHydraulicFlowM3Hr / hydraulicLoading;

  const floatSolidsPercent = 5.0;
  const floatSludgeM3Day = drySolidsKgDay / (floatSolidsPercent / 100 * 1000);
  const subnatantFlowM3Day = Math.max(0, feedFlowM3Day - floatSludgeM3Day);

  return {
    feedFlowM3Day,
    drySolidsKgDay: Number(drySolidsKgDay.toFixed(1)),
    airToSolidsRatio,
    recycleRatioPercent,
    saturationPressureBar,
    requiredTankAreaM2: Number(requiredTankAreaM2.toFixed(1)),
    hydraulicLoadingM3M2Hr: hydraulicLoading,
    floatSolidsPercent,
    floatSludgeM3Day: Number(floatSludgeM3Day.toFixed(1)),
    subnatantFlowM3Day: Number(subnatantFlowM3Day.toFixed(1))
  };
}

/**
 * 3. Calculate Dewatering Equipment (Filter Press, Belt Press, Centrifuge, Screw Press, Drying Bed, Geobag)
 */
export function calculateDewateringEquipment(
  tech: 'FILTER_PRESS' | 'BELT_FILTER_PRESS' | 'CENTRIFUGE' | 'SCREW_PRESS' | 'DRYING_BED' | 'GEOBAG',
  feedFlowM3Day: number,
  feedSolidsPercent: number = 4.0,
  operatingHoursPerDay: number = 8
): DewateringResult {
  const drySolidsKgDay = feedFlowM3Day * (feedSolidsPercent / 100) * 1000;
  let cakeSolidsPercent = 30.0;
  let polymerDose = 3.5; // kg/tDS
  let solidsCapture = 98.0;
  let numberOfUnits = 2;
  let sizingDetails = '';

  switch (tech) {
    case 'FILTER_PRESS':
      cakeSolidsPercent = 32.0;
      polymerDose = 2.5;
      solidsCapture = 98.5;
      numberOfUnits = Math.max(2, Math.ceil(drySolidsKgDay / 3000));
      sizingDetails = `${numberOfUnits} Duty Recessed Chamber Filter Presses (1200mm x 1200mm plate size, 80 chambers, 2.4 m³ cake capacity per cycle)`;
      break;

    case 'BELT_FILTER_PRESS':
      cakeSolidsPercent = 22.0;
      polymerDose = 4.0;
      solidsCapture = 95.0;
      numberOfUnits = Math.max(2, Math.ceil(drySolidsKgDay / 2500));
      sizingDetails = `${numberOfUnits} x 2.0m Belt Width Continuous Belt Filter Presses @ 300 kg/m·hr solids loading`;
      break;

    case 'CENTRIFUGE':
      cakeSolidsPercent = 28.0;
      polymerDose = 4.5;
      solidsCapture = 97.0;
      numberOfUnits = Math.max(2, Math.ceil(drySolidsKgDay / 4000));
      sizingDetails = `${numberOfUnits} x High G-Force Solid Bowl Decanter Centrifuges (3200 RPM, 2500 G acceleration)`;
      break;

    case 'SCREW_PRESS':
      cakeSolidsPercent = 25.0;
      polymerDose = 3.5;
      solidsCapture = 96.0;
      numberOfUnits = Math.max(2, Math.ceil(drySolidsKgDay / 2000));
      sizingDetails = `${numberOfUnits} x Multi-Disk Screw Dewatering Presses (Slow 3-5 RPM rotation, low energy)`;
      break;

    case 'DRYING_BED':
      cakeSolidsPercent = 40.0;
      polymerDose = 0.0;
      solidsCapture = 90.0;
      numberOfUnits = Math.max(4, Math.ceil(drySolidsKgDay / 500));
      sizingDetails = `${numberOfUnits} x Open Sludge Drying Beds (15m x 8m area, 250mm layer thickness, 14-day drying cycle)`;
      break;

    case 'GEOBAG':
      cakeSolidsPercent = 30.0;
      polymerDose = 3.0;
      solidsCapture = 95.0;
      numberOfUnits = Math.max(2, Math.ceil(drySolidsKgDay / 1500));
      sizingDetails = `${numberOfUnits} x High-Strength Geotextile Dewatering Tubes (15m circumference, 30m length, 120 m³ capacity)`;
      break;
  }

  const drySolidsTonneDay = drySolidsKgDay / 1000;
  const dailyPolymerConsumptionKgDay = drySolidsTonneDay * polymerDose;
  const dailyCakeMassKgDay = drySolidsKgDay / (cakeSolidsPercent / 100);
  const dailyCakeVolumeM3Day = dailyCakeMassKgDay / 1100;
  const filtrateFlowM3Day = Math.max(0, feedFlowM3Day - dailyCakeVolumeM3Day);

  return {
    technologyType: tech,
    feedFlowM3Day,
    feedSolidsPercent,
    drySolidsKgDay: Number(drySolidsKgDay.toFixed(1)),
    cakeSolidsPercent,
    dailyCakeMassKgDay: Number(dailyCakeMassKgDay.toFixed(1)),
    dailyCakeVolumeM3Day: Number(dailyCakeVolumeM3Day.toFixed(2)),
    filtrateFlowM3Day: Number(filtrateFlowM3Day.toFixed(1)),
    polymerDoseKgPerTonDs: polymerDose,
    dailyPolymerConsumptionKgDay: Number(dailyPolymerConsumptionKgDay.toFixed(2)),
    solidsCapturePercent: solidsCapture,
    operatingHoursPerDay,
    numberOfUnits,
    sizingDetails
  };
}
