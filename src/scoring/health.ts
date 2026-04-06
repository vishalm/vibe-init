import { getAllPolicies, GOVERNANCE_CATEGORIES } from '../governance/registry.js';
import { getFeature } from '../features/registry.js';
import { detectStack } from '../features/base.js';
import type { GovernanceReport, GovernanceCategoryScore, GovernanceCategory, PolicyResult } from '../types/governance.js';

const GRADE_THRESHOLDS: [number, string][] = [
  [95, 'A+'], [90, 'A'], [85, 'A-'], [80, 'B+'], [75, 'B'], [70, 'B-'],
  [65, 'C+'], [60, 'C'], [55, 'C-'], [40, 'D'], [0, 'F'],
];

function computeGrade(score: number): string {
  for (const [threshold, grade] of GRADE_THRESHOLDS) {
    if (score >= threshold) return grade;
  }
  return 'F';
}

function runPolicyCheck(projectDir: string, detector: string | ((dir: string) => boolean)): boolean {
  if (typeof detector === 'function') return detector(projectDir);
  const feature = getFeature(detector);
  return feature ? feature.detect(projectDir) : false;
}

/**
 * Score a project against all governance policies.
 * Returns a GovernanceReport with per-category breakdowns.
 */
export function scoreProject(projectDir: string): GovernanceReport {
  const stack = detectStack(projectDir);
  const allPolicies = getAllPolicies();

  const checks: PolicyResult[] = allPolicies.map((policy) => {
    const passed = runPolicyCheck(projectDir, policy.detector);
    return {
      id: policy.id,
      category: policy.category,
      name: policy.name,
      severity: policy.severity,
      weight: policy.weight,
      passed,
      message: passed ? 'Passed' : 'Not met',
      fix: passed ? undefined : policy.fix,
      references: policy.references,
    };
  });

  const categories = {} as Record<GovernanceCategory, GovernanceCategoryScore>;
  for (const cat of GOVERNANCE_CATEGORIES) {
    const catChecks = checks.filter((c) => c.category === cat);
    const maxScore = catChecks.reduce((s, c) => s + c.weight, 0);
    const earned = catChecks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
    categories[cat] = { score: earned, maxScore, policies: catChecks };
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const overallScore = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  const violations = checks.filter((c) => !c.passed);

  return {
    projectDir,
    stack,
    score: overallScore,
    grade: computeGrade(overallScore),
    categories,
    violations,
    checks,
    timestamp: new Date().toISOString(),
  };
}
