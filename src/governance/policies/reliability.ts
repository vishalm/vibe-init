import type { GovernancePolicy } from '../../types/governance.js';
import { gracefulShutdownHandler, errorBoundaryPresent, databaseMigrationsVersioned } from '../detectors.js';

export const reliabilityPolicies: GovernancePolicy[] = [
  {
    id: 'rel-001', category: 'reliability', name: 'Health check endpoint',
    description: 'A /health or /api/health endpoint must exist for load balancer integration',
    severity: 'block', weight: 8, detector: 'health',
    fix: 'vibe add health',
  },
  {
    id: 'rel-002', category: 'reliability', name: 'Graceful shutdown handler',
    description: 'Process must handle SIGTERM/SIGINT for graceful shutdown',
    severity: 'warn', weight: 6, detector: gracefulShutdownHandler,
  },
  {
    id: 'rel-003', category: 'reliability', name: 'Error boundaries',
    description: 'Error boundary or error page must exist to handle runtime failures gracefully',
    severity: 'warn', weight: 5, detector: errorBoundaryPresent,
  },
  {
    id: 'rel-004', category: 'reliability', name: 'Test framework configured',
    description: 'A test framework must be configured for regression prevention',
    severity: 'block', weight: 9, detector: 'testing',
    fix: 'vibe add testing',
  },
  {
    id: 'rel-005', category: 'reliability', name: 'Database migrations versioned',
    description: 'Database schema changes must be managed via versioned migrations',
    severity: 'warn', weight: 5, detector: databaseMigrationsVersioned,
  },
  {
    id: 'rel-006', category: 'reliability', name: 'CI/CD pipeline configured',
    description: 'Automated CI/CD pipeline must exist for consistent builds and deployments',
    severity: 'block', weight: 8, detector: 'ci',
    fix: 'vibe add ci',
  },
];
