import type { GovernancePolicy } from '../../types/governance.js';
import { openApiSpecExists, apiVersioningDetected, rateLimitingConfigured } from '../detectors.js';
import { inputValidationConfigured } from '../detectors.js';

export const apiGovernancePolicies: GovernancePolicy[] = [
  {
    id: 'api-001', category: 'api-governance', name: 'OpenAPI/Swagger spec',
    description: 'API must have an OpenAPI or Swagger specification document',
    severity: 'warn', weight: 7, detector: openApiSpecExists,
    references: ['https://swagger.io/specification/'],
  },
  {
    id: 'api-002', category: 'api-governance', name: 'API versioning strategy',
    description: 'API routes should include version prefix (e.g., /v1/) for backward compatibility',
    severity: 'info', weight: 4, detector: apiVersioningDetected,
  },
  {
    id: 'api-003', category: 'api-governance', name: 'Rate limiting configured',
    description: 'API endpoints must have rate limiting to prevent abuse',
    severity: 'warn', weight: 6, detector: rateLimitingConfigured,
    references: ['https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/'],
  },
  {
    id: 'api-004', category: 'api-governance', name: 'Input schema validation',
    description: 'API inputs must be validated with a schema library (Zod, Joi, Pydantic)',
    severity: 'block', weight: 8, detector: inputValidationConfigured,
    fix: 'vibe add validation',
    references: ['https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/'],
  },
  {
    id: 'api-005', category: 'api-governance', name: 'Health check endpoint',
    description: 'A health check endpoint must exist for load balancer and monitoring integration',
    severity: 'block', weight: 7, detector: 'health',
    fix: 'vibe add health',
  },
];
