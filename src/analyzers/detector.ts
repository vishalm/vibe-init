import type { DetectionResult, StackDetection, ProjectAnalysis } from '../types/analysis.js';

export interface Detector {
  id: string;
  name: string;
  detect(projectDir: string): DetectionResult;
}

export interface StackDetector {
  id: string;
  name: string;
  detect(projectDir: string): StackDetection | null;
}

// Import stack detectors
import { nextjsDetector } from './stack-detectors/nextjs.js';
import { pythonFastapiDetector } from './stack-detectors/python-fastapi.js';
import { goDetector } from './stack-detectors/go.js';
import { genericNodeDetector } from './stack-detectors/generic-node.js';

// Import practice detectors
import { dockerDetector } from './practice-detectors/docker.js';
import { ciDetector } from './practice-detectors/ci.js';
import { testingDetector } from './practice-detectors/testing.js';
import { lintingDetector } from './practice-detectors/linting.js';
import { envValidationDetector } from './practice-detectors/env-validation.js';
import { loggingDetector } from './practice-detectors/logging.js';
import { healthCheckDetector } from './practice-detectors/health-check.js';
import { gitHooksDetector } from './practice-detectors/git-hooks.js';
import { securityDetector } from './practice-detectors/security.js';
import { documentationDetector } from './practice-detectors/documentation.js';

/** Stack detectors ordered by specificity (most specific first, generic last) */
const STACK_DETECTORS: StackDetector[] = [
  nextjsDetector,
  pythonFastapiDetector,
  goDetector,
  genericNodeDetector,
];

/** All practice detectors */
const PRACTICE_DETECTORS: Detector[] = [
  dockerDetector,
  ciDetector,
  testingDetector,
  lintingDetector,
  envValidationDetector,
  loggingDetector,
  healthCheckDetector,
  gitHooksDetector,
  securityDetector,
  documentationDetector,
];

const UNKNOWN_STACK: StackDetection = {
  stack: 'unknown',
  framework: 'Unknown',
  language: 'unknown',
  packageManager: 'unknown',
  details: {},
};

/**
 * Runs all stack detectors in priority order. Returns the first match or 'unknown'.
 */
export function runStackDetection(dir: string): StackDetection {
  for (const detector of STACK_DETECTORS) {
    try {
      const result = detector.detect(dir);
      if (result) return result;
    } catch {
      // Detector failed — skip silently
    }
  }
  return UNKNOWN_STACK;
}

/**
 * Runs all practice detectors and returns their results.
 */
export function runPracticeDetection(dir: string): DetectionResult[] {
  const results: DetectionResult[] = [];
  for (const detector of PRACTICE_DETECTORS) {
    try {
      results.push(detector.detect(dir));
    } catch {
      results.push({
        detectorId: detector.id,
        detected: false,
        confidence: 'low',
        details: { error: 'Detector threw an exception' },
        markers: [],
      });
    }
  }
  return results;
}

/**
 * Full project analysis: stack detection + practice detection + recommendations.
 */
export function analyzeProject(dir: string): ProjectAnalysis {
  const stack = runStackDetection(dir);
  const practices = runPracticeDetection(dir);

  const missingPractices = practices
    .filter((p) => !p.detected)
    .map((p) => p.detectorId);

  const recommendations = buildRecommendations(missingPractices, stack);

  return {
    projectDir: dir,
    stack,
    practices,
    missingPractices,
    recommendations,
  };
}

function buildRecommendations(missing: string[], stack: StackDetection): string[] {
  const recs: string[] = [];

  const recMap: Record<string, string> = {
    docker: 'Add Docker support with a Dockerfile and docker-compose.yml for reproducible environments.',
    ci: 'Set up CI/CD with GitHub Actions, GitLab CI, or CircleCI for automated testing and deployment.',
    testing: 'Add a test framework and write unit/integration tests to catch regressions early.',
    linting: 'Configure a linter (ESLint, Biome, flake8, golangci-lint) to enforce code quality.',
    'env-validation': 'Add runtime environment validation (Zod, dotenv-safe, Pydantic BaseSettings) to fail fast on misconfiguration.',
    logging: 'Add structured logging (Pino, Winston, structlog, slog) for production observability.',
    'health-check': 'Add a /health endpoint for load balancer and monitoring integration.',
    'git-hooks': 'Set up Git hooks (Husky, pre-commit) to run linting and tests before commits.',
    security: 'Ensure .gitignore exists and excludes .env files to prevent secret leaks.',
    documentation: 'Add a README.md and CLAUDE.md to document your project for humans and AI assistants.',
  };

  for (const id of missing) {
    const rec = recMap[id];
    if (rec) recs.push(rec);
  }

  if (stack.stack === 'unknown') {
    recs.unshift('Could not detect a known stack. Consider adding standard project configuration files.');
  }

  return recs;
}
