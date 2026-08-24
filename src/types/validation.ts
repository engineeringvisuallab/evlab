/**
 * EV Software Core - Validation Framework Types
 * Strictly decouples Technical Validation (schema, geometry, units, CRS)
 * from Engineering Validation (process, hydraulic, code standards).
 */

export type ValidationCategory = 'technical' | 'engineering';

export type ValidationStatus = 'passed' | 'warning' | 'failed';

export interface ValidationError {
  code: string;
  field?: string;
  entityId?: string;
  message: string;
  severity: 'critical' | 'error';
}

export interface ValidationWarning {
  code: string;
  field?: string;
  entityId?: string;
  message: string;
  recommendation?: string;
}

export interface ValidationRule {
  ruleId: string;
  category: ValidationCategory;
  name: string;
  description: string;
  enabled: boolean;
  standardReference?: string;
}

export interface ValidationResult {
  validationId: string;
  category: ValidationCategory;
  status: ValidationStatus;
  entityType: 'transfer' | 'dataset' | 'revision' | 'manifest';
  entityId: string;
  validatedBy: string; // 'core_technical_engine' | 'domain_validator' | user ID
  validatedAt: string;
  executionTimeMs: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  passedRuleCount: number;
  totalRuleCount: number;
  summary: string;
}
