import type { ScoreCategory } from '../types/scoring.js';
import {
  testFilesExist, coverageConfigured, dockerfileExists, composeExists,
  gitignoreExists, typescriptConfigured, linterConfigured, readmeExists, claudeMdExists,
} from './detectors.js';

export interface HealthCheckDef {
  id: string;
  category: ScoreCategory;
  name: string;
  weight: number;
  /** Feature detector ID or a custom detector function */
  detector: string | ((projectDir: string) => boolean);
}

export const ALL_CHECKS: HealthCheckDef[] = [
  // Testing
  { id: 'test-framework', category: 'testing', name: 'Test framework configured', weight: 8, detector: 'testing' },
  { id: 'test-files', category: 'testing', name: 'Test files exist', weight: 7, detector: testFilesExist },
  { id: 'test-coverage', category: 'testing', name: 'Coverage configuration', weight: 5, detector: coverageConfigured },
  // CI/CD
  { id: 'ci-config', category: 'ci-cd', name: 'CI/CD pipeline configured', weight: 10, detector: 'ci' },
  // Containerization
  { id: 'dockerfile', category: 'containerization', name: 'Dockerfile present', weight: 6, detector: dockerfileExists },
  { id: 'compose', category: 'containerization', name: 'Docker Compose configured', weight: 5, detector: composeExists },
  // Security
  { id: 'env-validation', category: 'security', name: 'Environment validation', weight: 8, detector: 'validation' },
  { id: 'auth-setup', category: 'security', name: 'Authentication configured', weight: 7, detector: 'auth' },
  { id: 'gitignore', category: 'security', name: '.gitignore present', weight: 4, detector: gitignoreExists },
  // Code Quality
  { id: 'git-hooks', category: 'code-quality', name: 'Git hooks configured', weight: 6, detector: 'hooks' },
  { id: 'typescript', category: 'code-quality', name: 'TypeScript configured', weight: 7, detector: typescriptConfigured },
  { id: 'linter', category: 'code-quality', name: 'Linter configured', weight: 6, detector: linterConfigured },
  // Documentation
  { id: 'readme', category: 'documentation', name: 'README.md present', weight: 5, detector: readmeExists },
  { id: 'claude-md', category: 'documentation', name: 'CLAUDE.md present', weight: 4, detector: claudeMdExists },
  // Observability
  { id: 'logging', category: 'observability', name: 'Structured logging', weight: 6, detector: 'logging' },
  { id: 'health-endpoint', category: 'observability', name: 'Health check endpoint', weight: 7, detector: 'health' },
  { id: 'db-setup', category: 'observability', name: 'Database ORM configured', weight: 5, detector: 'db' },
];
