import type { GovernancePolicy, GovernanceCategory, GovernanceSeverity } from '../types/governance.js';
import { securityPolicies } from './policies/security.js';
import { accessibilityPolicies } from './policies/accessibility.js';
import { reliabilityPolicies } from './policies/reliability.js';
import { performancePolicies } from './policies/performance.js';
import { compliancePolicies } from './policies/compliance.js';
import { cleanCodePolicies } from './policies/clean-code.js';

const ALL_POLICIES: GovernancePolicy[] = [
  ...securityPolicies,
  ...accessibilityPolicies,
  ...reliabilityPolicies,
  ...performancePolicies,
  ...compliancePolicies,
  ...cleanCodePolicies,
];

export const GOVERNANCE_CATEGORIES: GovernanceCategory[] = [
  'security', 'accessibility', 'reliability', 'performance', 'compliance', 'clean-code',
];

export const GOVERNANCE_CATEGORY_LABELS: Record<GovernanceCategory, string> = {
  'security': 'Security',
  'accessibility': 'Accessibility',
  'reliability': 'Reliability',
  'performance': 'Performance',
  'compliance': '12-Factor Compliance',
  'clean-code': 'Clean Code',
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
