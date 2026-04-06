import type { GovernancePolicy } from '../../types/governance.js';
import { tracingConfigured, metricsConfigured, errorTrackingConfigured } from '../detectors.js';

export const observabilityPolicies: GovernancePolicy[] = [
  {
    id: 'obs-001', category: 'observability', name: 'Structured logging',
    description: 'Structured logging (JSON) must be configured for production observability',
    severity: 'warn', weight: 6, detector: 'logging',
    fix: 'vibe add logging',
  },
  {
    id: 'obs-002', category: 'observability', name: 'Distributed tracing',
    description: 'Distributed tracing should be configured (OpenTelemetry, Sentry, Datadog)',
    severity: 'info', weight: 5, detector: tracingConfigured,
    references: ['https://opentelemetry.io/docs/'],
  },
  {
    id: 'obs-003', category: 'observability', name: 'Application metrics',
    description: 'Application metrics should be configured (Prometheus, OpenTelemetry, Datadog)',
    severity: 'info', weight: 4, detector: metricsConfigured,
  },
  {
    id: 'obs-004', category: 'observability', name: 'Error tracking',
    description: 'Error tracking service should be configured (Sentry, Bugsnag, Rollbar)',
    severity: 'warn', weight: 6, detector: errorTrackingConfigured,
  },
];
