import type { GovernancePolicy, GovernanceCategory, GovernanceSeverity } from '../types/governance.js';
import { securityPolicies } from './policies/security.js';
import { accessibilityPolicies } from './policies/accessibility.js';
import { reliabilityPolicies } from './policies/reliability.js';
import { performancePolicies } from './policies/performance.js';
import { compliancePolicies } from './policies/compliance.js';
import { cleanCodePolicies } from './policies/clean-code.js';
import { apiGovernancePolicies } from './policies/api-governance.js';
import { dataGovernancePolicies } from './policies/data-governance.js';
import { codeReviewPolicies } from './policies/code-review.js';
import { observabilityPolicies } from './policies/observability.js';

const ALL_POLICIES: GovernancePolicy[] = [
  ...securityPolicies,
  ...accessibilityPolicies,
  ...reliabilityPolicies,
  ...performancePolicies,
  ...compliancePolicies,
  ...cleanCodePolicies,
  ...apiGovernancePolicies,
  ...dataGovernancePolicies,
  ...codeReviewPolicies,
  ...observabilityPolicies,
];

export const GOVERNANCE_CATEGORIES: GovernanceCategory[] = [
  'security', 'accessibility', 'reliability', 'performance', 'compliance',
  'clean-code', 'api-governance', 'data-governance', 'code-review', 'observability',
];

export const GOVERNANCE_CATEGORY_LABELS: Record<GovernanceCategory, string> = {
  'security': 'Security',
  'accessibility': 'Accessibility',
  'reliability': 'Reliability',
  'performance': 'Performance',
  'compliance': '12-Factor Compliance',
  'clean-code': 'Clean Code',
  'api-governance': 'API Governance',
  'data-governance': 'Data Governance',
  'code-review': 'Code Review',
  'observability': 'Observability',
};

export function getAllPolicies(): GovernancePolicy[] {
  return [...ALL_POLICIES];
}

export function getByCategory(category: GovernanceCategory): GovernancePolicy[] {
  return ALL_POLICIES.filter((p) => p.category === category);
}

export function getBySeverity(severity: GovernanceSeverity): GovernancePolicy[] {
  return ALL_POLICIES.filter((p) => p.severity === severity);
}
