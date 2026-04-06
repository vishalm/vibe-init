import type { GovernancePolicy } from '../../types/governance.js';
import {
  prTemplateExists, codeOwnersExists, issueTemplatesExist,
  contributingGuideExists, changelogMaintained, architectureDocumented,
} from '../detectors.js';

export const codeReviewPolicies: GovernancePolicy[] = [
  {
    id: 'cr-001', category: 'code-review', name: 'PR template exists',
    description: 'A pull request template must exist to standardize code review submissions',
    severity: 'warn', weight: 5, detector: prTemplateExists,
  },
  {
    id: 'cr-002', category: 'code-review', name: 'CODEOWNERS file',
    description: 'CODEOWNERS must define who reviews changes to critical paths',
    severity: 'warn', weight: 5, detector: codeOwnersExists,
  },
  {
    id: 'cr-003', category: 'code-review', name: 'Issue templates',
    description: 'GitHub issue templates should exist for bug reports and feature requests',
    severity: 'info', weight: 3, detector: issueTemplatesExist,
  },
  {
    id: 'cr-004', category: 'code-review', name: 'Contributing guide',
    description: 'CONTRIBUTING.md must document how to contribute, branch naming, and review process',
    severity: 'warn', weight: 5, detector: contributingGuideExists,
  },
  {
    id: 'cr-005', category: 'code-review', name: 'Changelog maintained',
    description: 'A CHANGELOG.md must track notable changes between versions',
    severity: 'info', weight: 4, detector: changelogMaintained,
  },
  {
    id: 'cr-006', category: 'code-review', name: 'Architecture documented',
    description: 'Architecture decisions and diagrams must be documented (ADRs, C4 model)',
    severity: 'warn', weight: 5, detector: architectureDocumented,
  },
];
