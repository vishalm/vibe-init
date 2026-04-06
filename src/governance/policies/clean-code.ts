import type { GovernancePolicy } from '../../types/governance.js';
import {
  typescriptStrictMode, noAnyUsage, formatterConfigured,
  conventionalCommitsConfigured, testCoverageThreshold, noConsoleLogInSrc,
} from '../detectors.js';
import { fileExists } from '../../features/base.js';

export const cleanCodePolicies: GovernancePolicy[] = [
  {
    id: 'cc-001', category: 'clean-code', name: 'TypeScript strict mode',
    description: 'TypeScript must be configured with strict: true',
    severity: 'block', weight: 8,
    detector: typescriptStrictMode,
  },
  {
    id: 'cc-002', category: 'clean-code', name: 'No implicit any',
    description: 'TypeScript noImplicitAny or strict must be enabled',
    severity: 'warn', weight: 6,
    detector: noAnyUsage,
  },
  {
    id: 'cc-003', category: 'clean-code', name: 'Linter configured',
    description: 'A code linter must be configured (ESLint, Biome, etc.)',
    severity: 'block', weight: 7,
    detector: (dir) => fileExists(dir, '.eslintrc.js', '.eslintrc.json', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts', 'biome.json'),
  },
  {
    id: 'cc-004', category: 'clean-code', name: 'Formatter configured',
    description: 'A code formatter must be configured (Prettier, Biome, EditorConfig)',
    severity: 'warn', weight: 5,
    detector: formatterConfigured,
  },
  {
    id: 'cc-005', category: 'clean-code', name: 'Git hooks configured',
    description: 'Pre-commit hooks must enforce linting before commits',
    severity: 'warn', weight: 6, detector: 'hooks',
    fix: 'vibe add hooks',
  },
  {
    id: 'cc-006', category: 'clean-code', name: 'Conventional commits',
    description: 'Commitlint must be configured for conventional commit messages',
    severity: 'info', weight: 4,
    detector: conventionalCommitsConfigured,
  },
  {
    id: 'cc-007', category: 'clean-code', name: 'Test coverage threshold',
    description: 'Test coverage thresholds should be configured to enforce minimum coverage',
    severity: 'warn', weight: 5,
    detector: testCoverageThreshold,
  },
  {
    id: 'cc-008', category: 'clean-code', name: 'No console.log in production',
    description: 'Production source code should use structured logging, not console.log',
    severity: 'info', weight: 4,
    detector: noConsoleLogInSrc,
    fix: 'vibe add logging',
  },
  {
    id: 'cc-009', category: 'clean-code', name: 'README present',
    description: 'Project must have a README.md documenting setup and usage',
    severity: 'block', weight: 6,
    detector: (dir) => fileExists(dir, 'README.md', 'readme.md'),
  },
  {
    id: 'cc-010', category: 'clean-code', name: 'CLAUDE.md present',
    description: 'AI coding instructions file must exist for consistent AI-assisted development',
    severity: 'warn', weight: 5,
    detector: (dir) => fileExists(dir, 'CLAUDE.md'),
  },
];
