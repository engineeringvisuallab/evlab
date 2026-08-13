/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Engineering Assumption Management Engine
 * @license Apache-2.0
 */

import { EngineeringAssumption, ProjectState } from '../types/stp';
import { IDGenerator } from './idGenerator';

export class AssumptionEngine {
  /**
   * Generates initial baseline assumptions for typical project defaults.
   */
  public static generateDefaultAssumptions(): Record<string, EngineeringAssumption> {
    const assumptions: Record<string, EngineeringAssumption> = {};

    const defaultList: Omit<EngineeringAssumption, 'id' | 'dateAdded'>[] = [
      {
        parameterId: 'STP.DEMO.GR_PCT',
        parameterName: 'Annual Population Growth Rate',
        assumedValue: '2.5%',
        unit: '%',
        reason: 'Local municipal master plan census growth trend extrapolation.',
        source: 'Regional Urban Planning Office Guidelines',
        designer: 'Senior Sanitary Engineer',
        status: 'ACCEPTED',
      },
      {
        parameterId: 'STP.FLOW.INFILTRATION',
        parameterName: 'Groundwater Infiltration Allowance',
        assumedValue: '15.0 L/s',
        unit: 'L/s',
        reason: 'High groundwater table observed during preliminary soil borehole survey.',
        source: 'Preliminary Geotechnical Site Assessment',
        designer: 'Hydraulic Specialist',
        status: 'PENDING_LAB_VERIFICATION',
      },
      {
        parameterId: 'STP.FLOW.COMMERCIAL',
        parameterName: 'Commercial Wastewater Flow',
        assumedValue: '500 m3/day',
        unit: 'm3/day',
        reason: 'Estimated from 200 commercial establishments at 2.5 m3/day per unit.',
        source: 'Commercial Density Estimate',
        designer: 'Process Engineer',
        status: 'PENDING_LAB_VERIFICATION',
      },
      {
        parameterId: 'STP.QUAL.BOD5',
        parameterName: 'Influent BOD5 Concentration',
        assumedValue: '250 mg/L',
        unit: 'mg/L',
        reason: 'Full composite laboratory wastewater characterization pending. Standard domestic sewage average used.',
        source: 'Metcalf & Eddy Table 3-15 Medium Strength Domestic Sewage',
        designer: 'Senior Environmental Engineer',
        status: 'PENDING_LAB_VERIFICATION',
      },
      {
        parameterId: 'STP.COST.ELEC_RATE',
        parameterName: 'Industrial Electricity Tariff Rate',
        assumedValue: '$0.12 / kWh',
        unit: 'USD/kWh',
        reason: 'Commercial industrial power tariff schedule rate.',
        source: 'State Power Supply Board Tariff Schedule',
        designer: 'Electrical & Cost Engineer',
        status: 'ACCEPTED',
      },
    ];

    defaultList.forEach((item) => {
      const id = IDGenerator.assumptionID();
      assumptions[id] = {
        ...item,
        id,
        dateAdded: new Date().toISOString().split('T')[0],
      };
    });

    return assumptions;
  }

  /**
   * Scans project parameters and returns a list of unresolved inputs requiring engineering verification.
   */
  public static getUnresolvedInputs(project: ProjectState): string[] {
    const unresolved: string[] = [];

    // Check influent lab data
    if (project.scenarios[project.activeScenarioId].influentQuality.bod5.isAssumed) {
      unresolved.push('LAB DATA REQUIRED: Influent composite BOD5 sampling report unverified.');
    }
    if (project.scenarios[project.activeScenarioId].influentQuality.cod.isAssumed) {
      unresolved.push('LAB DATA REQUIRED: Influent COD biodegradability ratio needs lab testing.');
    }
    if (project.scenarios[project.activeScenarioId].influentQuality.tp.isAssumed) {
      unresolved.push('LAB DATA REQUIRED: Total Phosphorus concentration unverified (Chemical dosing impact).');
    }

    // Check geotechnical / hydraulic data
    if (project.siteInfo.groundwaterTableDepthM < 2.0) {
      unresolved.push('SITE GEOTECH REQUIRED: High groundwater table (< 2.0m) requires buoyancy calculation check for buried tanks.');
    }

    return unresolved;
  }
}
