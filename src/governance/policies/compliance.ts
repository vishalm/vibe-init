import type { GovernancePolicy } from '../../types/governance.js';
import {
  codebaseInVcs, depsExplicitlyDeclared, configInEnvVars,
  backingServicesAsUrls, portBinding, devProdParity, logsAsStreams,
} from '../detectors.js';

const REF = 'https://12factor.net';

export const compliancePolicies: GovernancePolicy[] = [
  {
    id: '12f-001', category: 'compliance', name: 'I. Codebase in version control',
    description: 'One codebase tracked in revision control',
    severity: 'block', weight: 8, detector: codebaseInVcs,
    references: [`${REF}/codebase`],
  },
  {
    id: '12f-002', category: 'compliance', name: 'II. Dependencies explicitly declared',
    description: 'Explicitly declare and isolate dependencies',
    severity: 'block', weight: 8, detector: depsExplicitlyDeclared,
    references: [`${REF}/dependencies`],
  },
  {
    id: '12f-003', category: 'compliance', name: 'III. Config in environment',
    description: 'Store config in the environment (.env.example must document required vars)',
    severity: 'block', weight: 8, detector: configInEnvVars,
    references: [`${REF}/config`],
  },
  {
    id: '12f-004', category: 'compliance', name: 'IV. Backing services as URLs',
    description: 'Treat backing services as attached resources via URL configuration',
    severity: 'warn', weight: 6, detector: backingServicesAsUrls,
    references: [`${REF}/backing-services`],
  },
  {
    id: '12f-005', category: 'compliance', name: 'VII. Port binding',
    description: 'Export services via port binding (PORT env or Dockerfile EXPOSE)',
    severity: 'warn', weight: 5, detector: portBinding,
    references: [`${REF}/port-binding`],
  },
  {
    id: '12f-006', category: 'compliance', name: 'X. Dev/prod parity',
    description: 'Keep development, staging, and production as similar as possible (Docker Compose)',
    severity: 'warn', weight: 6, detector: devProdParity,
    fix: 'vibe add docker',
    references: [`${REF}/dev-prod-parity`],
  },
  {
    id: '12f-007', category: 'compliance', name: 'XI. Logs as event streams',
    description: 'Treat logs as event streams (structured logging to stdout)',
    severity: 'warn', weight: 5, detector: logsAsStreams,
    fix: 'vibe add logging',
    references: [`${REF}/logs`],
  },
];
