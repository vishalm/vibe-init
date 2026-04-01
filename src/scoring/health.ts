import { ALL_CHECKS } from './checks.js';
import { getFeature } from '../features/registry.js';
import { detectStack } from '../features/base.js';
import type { HealthCheck, HealthReport, ScoreCategory, CategoryScore } from '../types/scoring.js';

const CATEGORIES: ScoreCategory[] = [
  'testing', 'ci-cd', 'containerization', 'security', 'code-quality', 'documentation', 'observability',
];

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

function runCheck(projectDir: string, detector: string | ((dir: string) => boolean)): boolean {
  if (typeof detector === 'function') return detector(projectDir);
  const feature = getFeature(detector);
  return feature ? feature.detect(projectDir) : false;
}

const FIX_MAP: Record<string, string> = {
  'test-framework': 'vibe add testing', 'ci-config': 'vibe add ci',
  'dockerfile': 'vibe add docker', 'compose': 'vibe add docker',
  'env-validation': 'vibe add validation', 'auth-setup': 'vibe add auth',
  'git-hooks': 'vibe add hooks', 'logging': 'vibe add logging',
  'health-endpoint': 'vibe add health', 'db-setup': 'vibe add db',
};

export function scoreProject(projectDir: string): HealthReport {
  const stack = detectStack(projectDir);
  const checks: HealthCheck[] = ALL_CHECKS.map((def) => {
    const passed = runCheck(projectDir, def.detector);
    return {
      id: def.id, category: def.category, name: def.name, weight: def.weight, passed,
      message: passed ? 'Detected' : 'Not found',
      fixCommand: passed ? undefined : FIX_MAP[def.id],
    };
  });

  const categories = {} as Record<ScoreCategory, CategoryScore>;
  for (const cat of CATEGORIES) {
    const cc = checks.filter((c) => c.category === cat);
    const maxScore = cc.reduce((s, c) => s + c.weight, 0);
    const score = cc.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
    categories[cat] = { score, maxScore, checks: cc };
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const overallScore = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  return {
    projectDir, stack, overallScore, grade: computeGrade(overallScore),
    categories, checks, timestamp: new Date().toISOString(),
  };
}
