export interface ProcessRecommendation {
  processName: string;
  category: 'Conventional' | 'Advanced' | 'Special Treatment';
  status: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL' | 'NOT_REQUIRED';
  triggerReason: string;
  targetPollutant: string;
}

export function evaluateProcessSelectionRules(
  rawWaterQuality: Record<string, number>
): ProcessRecommendation[] {
  const recommendations: ProcessRecommendation[] = [];

  const turbidity = rawWaterQuality['turbidity'] || 120;
  const fe = rawWaterQuality['fe'] || 1.8;
  const mn = rawWaterQuality['mn'] || 0.25;
  const as = rawWaterQuality['as'] || 0.04;
  const ecoli = rawWaterQuality['ecoli'] || 450;
  const tds = rawWaterQuality['tds'] || 250;
  const hardness = rawWaterQuality['hardness'] || 180;
  const color = rawWaterQuality['color'] || 25;
  const ammonia = rawWaterQuality['ammonia'] || 1.2;

  // 1. Aeration
  if (fe > 0.3 || mn > 0.1 || ammonia > 0.5) {
    recommendations.push({
      processName: 'Cascade Aerator / Diffused Aeration',
      category: 'Special Treatment',
      status: 'REQUIRED',
      triggerReason: `High Iron (${fe} mg/L), Manganese (${mn} mg/L), or Ammonia (${ammonia} mg/L). Aeration oxidizes Fe2+ -> Fe3+ and strips dissolved CO2.`,
      targetPollutant: 'Iron, Manganese, CO2, Hydrogen Sulfide'
    });
  } else {
    recommendations.push({
      processName: 'Cascade Aerator',
      category: 'Conventional',
      status: 'OPTIONAL',
      triggerReason: 'Raw water iron & manganese are within standard limits. Aeration provides oxygenation.',
      targetPollutant: 'Dissolved Oxygen enhancement'
    });
  }

  // 2. Coagulation & Rapid Mix
  if (turbidity > 5 || color > 15) {
    recommendations.push({
      processName: 'Coagulation & Rapid Mixing (Alum / Polyaluminum Chloride PAC)',
      category: 'Conventional',
      status: 'REQUIRED',
      triggerReason: `Elevated Turbidity (${turbidity} NTU) and Color (${color} Pt-Co). Coagulant destabilizes colloidal particles.`,
      targetPollutant: 'Colloidal Turbidity, Color, Organic Matter'
    });
  } else {
    recommendations.push({
      processName: 'Direct Filtration / Coagulation',
      category: 'Conventional',
      status: 'RECOMMENDED',
      triggerReason: 'Low turbidity water can utilize direct filtration with low coagulant dose.',
      targetPollutant: 'Fine Suspended Solids'
    });
  }

  // 3. Flocculation
  recommendations.push({
    processName: '3-Stage Tapered Flocculation (Mechanical Hydraulic Paddles)',
    category: 'Conventional',
    status: 'REQUIRED',
    triggerReason: 'Promotes inter-particle collisions to form heavy, settleable pin-floc.',
    targetPollutant: 'Coagulated Micro-floc'
  });

  // 4. Sedimentation / Tube Settler
  if (turbidity > 20) {
    recommendations.push({
      processName: 'Clarification / High-Rate Tube Settler / Lamella Clarifier',
      category: 'Conventional',
      status: 'REQUIRED',
      triggerReason: `High Turbidity (${turbidity} NTU) requires gravity sedimentation prior to filtration to protect filter beds from rapid blinding.`,
      targetPollutant: 'Settleable Floc, Bulk Suspended Solids'
    });
  } else {
    recommendations.push({
      processName: 'Plain Sedimentation Basin',
      category: 'Conventional',
      status: 'OPTIONAL',
      triggerReason: 'Low raw turbidity.',
      targetPollutant: 'Coarse Sand/Silt'
    });
  }

  // 5. Rapid Gravity Sand / Multi-Media Filtration
  recommendations.push({
    processName: 'Rapid Gravity Sand & Anthracite Dual-Media Filtration',
    category: 'Conventional',
    status: 'REQUIRED',
    triggerReason: 'Mandatory physical barrier to achieve final turbidity < 0.2 - 0.5 NTU.',
    targetPollutant: 'Residual Floc, Cryptosporidium Oocysts, Fine Particulates'
  });

  // 6. Arsenic Co-Precipitation / Adsorption Media
  if (as > 0.01) {
    recommendations.push({
      processName: 'Arsenic Co-Precipitation with Ferric Chloride & Adsorption Filter',
      category: 'Special Treatment',
      status: 'REQUIRED',
      triggerReason: `Raw Arsenic (${as} mg/L) exceeds WHO limit of 0.01 mg/L. Requires Fe(OH)3 co-precipitation or activated alumina.`,
      targetPollutant: 'Arsenic (As III / As V)'
    });
  }

  // 7. Powdered / Granular Activated Carbon (PAC / GAC)
  if (color > 30 || rawWaterQuality['pfas'] > 0.0001) {
    recommendations.push({
      processName: 'Granular Activated Carbon (GAC) Contactor',
      category: 'Advanced',
      status: 'RECOMMENDED',
      triggerReason: 'High organic color, pesticides, taste & odor compounds, or PFAS chemicals.',
      targetPollutant: 'Taste, Odor, SOCs, VOCs, PFAS, Color'
    });
  }

  // 8. Desalination / Reverse Osmosis (RO)
  if (tds > 1000) {
    recommendations.push({
      processName: 'Brackish Water Reverse Osmosis (BWRO)',
      category: 'Advanced',
      status: 'REQUIRED',
      triggerReason: `High Total Dissolved Solids (${tds} mg/L) exceeds 500-1000 mg/L limit.`,
      targetPollutant: 'Salinity, Dissolved Ions, Sodium, Chloride'
    });
  }

  // 9. Disinfection (Chlorination & UV)
  recommendations.push({
    processName: 'Post-Chlorination & Gas Chlorine / Sodium Hypochlorite Contact Basin',
    category: 'Conventional',
    status: 'REQUIRED',
    triggerReason: `Raw E. coli (${ecoli} CFU/100mL). Mandatory for primary pathogen log reduction and residual distribution protection.`,
    targetPollutant: 'E. coli, Bacteria, Viruses, Waterborne Pathogens'
  });

  return recommendations;
}
