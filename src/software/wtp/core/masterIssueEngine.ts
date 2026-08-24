import { CalculatedWtpState } from './dependencyEngine';
import { generateComplianceMatrix } from './complianceEngine';
import { generateMasterQaQcEngine } from './qaQcEngine';

export interface MasterIssue {
  issueId: string;
  severity: 'CRITICAL_ERROR' | 'MAJOR_WARNING' | 'MINOR_WARNING' | 'ENGINEER_INPUT_REQUIRED';
  moduleName: string;
  associatedObjectTag: string;
  description: string;
  sourceSystem: string;
  responsibleRole: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  dueDate: string;
  recommendedResolution: string;
}

export function generateMasterIssueRegister(state: CalculatedWtpState): MasterIssue[] {
  const compliance = generateComplianceMatrix(state);
  const qaqc = generateMasterQaQcEngine(state);

  const issues: MasterIssue[] = [
    {
      issueId: 'ISS-001',
      severity: 'ENGINEER_INPUT_REQUIRED',
      moduleName: 'Raw Water Intake / Geotechnical',
      associatedObjectTag: 'INT-001',
      description: 'Geotechnical Borehole Log & Soil Bearing Capacity Report pending site laboratory sign-off.',
      sourceSystem: 'Civil / Structural Audit',
      responsibleRole: 'Lead Geotechnical Engineer',
      status: 'OPEN',
      dueDate: '2026-08-30',
      recommendedResolution: 'Import final geotechnical borehole report to confirm allowable bearing pressure ≥ 150 kPa.'
    },
    {
      issueId: 'ISS-002',
      severity: 'MINOR_WARNING',
      moduleName: 'Electrical Power Supply',
      associatedObjectTag: 'TR-001',
      description: 'Grid Utility Power Tariff Schedule & Dual-Feeder Switchover Agreement pending power distribution company approval.',
      sourceSystem: 'Electrical Load Audit',
      responsibleRole: 'Principal Electrical Engineer',
      status: 'OPEN',
      dueDate: '2026-09-15',
      recommendedResolution: 'Execute grid interconnection agreement with Bangladesh Power Development Board (BPDB).'
    },
    {
      issueId: 'ISS-003',
      severity: 'MINOR_WARNING',
      moduleName: 'QA/QC Punch List',
      associatedObjectTag: 'RWP-001',
      description: 'Minor paint scratch on suction flange coating during pump rigging.',
      sourceSystem: 'QA/QC Punch List',
      responsibleRole: 'Mechanical Contractor',
      status: 'OPEN',
      dueDate: '2026-08-20',
      recommendedResolution: 'Apply 250 µm high-build epoxy touch-up paint per specification.'
    }
  ];

  // Map any compliance non-pass items
  compliance.filter(c => c.status !== 'PASS').forEach((c, idx) => {
    issues.push({
      issueId: 'ISS-CMP-' + (idx + 10),
      severity: c.status === 'FAIL' ? 'CRITICAL_ERROR' : 'MAJOR_WARNING',
      moduleName: c.discipline,
      associatedObjectTag: c.requirementName,
      description: c.comparisonDetails,
      sourceSystem: 'Compliance Matrix Engine',
      responsibleRole: 'Lead Process Engineer',
      status: 'OPEN',
      dueDate: '2026-08-25',
      recommendedResolution: `Adjust design parameter to comply with standard requirement: ${c.requiredValue}`
    });
  });

  return issues;
}
