import type { GovernancePolicy } from '../../types/governance.js';
import {
  gitignoreExcludesEnv, noHardcodedSecrets, dependencyLockfileExists, inputValidationConfigured,
} from '../detectors.js';

export const securityPolicies: GovernancePolicy[] = [
  {
    id: 'sec-001', category: 'security', name: 'Gitignore excludes .env',
    description: '.gitignore must exclude .env files to prevent secret leaks',
    severity: 'block', weight: 8, detector: gitignoreExcludesEnv,
    fix: 'echo ".env" >> .gitignore',
    references: ['https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/'],
  },
  {
    id: 'sec-002', category: 'security', name: 'Environment validation',
    description: 'Environment variables must be validated at startup (Zod, envalid, Pydantic)',
    severity: 'block', weight: 8, detector: 'validation',
    fix: 'vibe add validation',
    references: ['https://12factor.net/config'],
  },
  {
    id: 'sec-003', category: 'security', name: 'No hardcoded secrets',
    description: 'Source code must not contain hardcoded API keys, passwords, or tokens',
    severity: 'block', weight: 10, detector: noHardcodedSecrets,
    references: ['https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/'],
  },
  {
    id: 'sec-004', category: 'security', name: 'Dependency lockfile present',
    description: 'A dependency lockfile must exist for reproducible builds',
    severity: 'warn', weight: 6, detector: dependencyLockfileExists,
    references: ['https://12factor.net/dependencies'],
  },
  {
    id: 'sec-005', category: 'security', name: 'Input validation library',
    description: 'A schema validation library must be configured (Zod, Joi, Pydantic)',
    severity: 'warn', weight: 7, detector: inputValidationConfigured,
    fix: 'vibe add validation',
    references: ['https://owasp.org/Top10/A03_2021-Injection/'],
  },
  {
    id: 'sec-006', category: 'security', name: 'Authentication configured',
    description: 'An authentication provider must be configured for protected routes',
    severity: 'info', weight: 5, detector: 'auth',
    fix: 'vibe add auth',
    references: ['https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/'],
  },
  {
    id: 'sec-007', category: 'security', name: 'ORM for database access',
    description: 'Database access must use an ORM to prevent SQL injection',
    severity: 'warn', weight: 6, detector: 'db',
    fix: 'vibe add db',
    references: ['https://owasp.org/Top10/A03_2021-Injection/'],
  },
];
