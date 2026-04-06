import type { GovernancePolicy } from '../../types/governance.js';
import { bundleAnalysisConfigured, imageOptimizationConfigured } from '../detectors.js';
import { fileExists } from '../../features/base.js';

export const performancePolicies: GovernancePolicy[] = [
  {
    id: 'perf-001', category: 'performance', name: 'Structured logging',
    description: 'Structured logging (JSON) must be configured for production observability',
    severity: 'warn', weight: 6, detector: 'logging',
    fix: 'vibe add logging',
  },
  {
    id: 'perf-002', category: 'performance', name: 'Bundle analysis configured',
    description: 'Bundle size analysis tool should be configured to prevent bloat',
    severity: 'info', weight: 4, detector: bundleAnalysisConfigured,
  },
  {
    id: 'perf-003', category: 'performance', name: 'Image optimization',
    description: 'Image optimization should be configured (Next.js Image, sharp, etc.)',
    severity: 'info', weight: 4, detector: imageOptimizationConfigured,
  },
  {
    id: 'perf-004', category: 'performance', name: 'Containerization',
    description: 'Dockerfile should exist for consistent, optimized deployment',
    severity: 'warn', weight: 6,
    detector: (dir) => fileExists(dir, 'Dockerfile'),
    fix: 'vibe add docker',
  },
];
