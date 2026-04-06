import type { GovernancePolicy } from '../../types/governance.js';
import { privacyPolicyDocumented, encryptionLibraryPresent, securityPolicyDocumented } from '../detectors.js';

export const dataGovernancePolicies: GovernancePolicy[] = [
  {
    id: 'data-001', category: 'data-governance', name: 'Privacy policy documented',
    description: 'A privacy policy document must exist for projects handling user data',
    severity: 'warn', weight: 5, detector: privacyPolicyDocumented,
    references: ['https://gdpr.eu/privacy-notice/'],
  },
  {
    id: 'data-002', category: 'data-governance', name: 'Password hashing library',
    description: 'Projects with auth must use bcrypt, argon2, or equivalent for password hashing',
    severity: 'warn', weight: 6, detector: encryptionLibraryPresent,
    references: ['https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/'],
  },
  {
    id: 'data-003', category: 'data-governance', name: 'Security policy documented',
    description: 'A SECURITY.md file must document vulnerability reporting process',
    severity: 'warn', weight: 5, detector: securityPolicyDocumented,
    references: ['https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository'],
  },
  {
    id: 'data-004', category: 'data-governance', name: 'Database ORM configured',
    description: 'Database access must use an ORM to prevent SQL injection and enforce data patterns',
    severity: 'warn', weight: 6, detector: 'db',
    fix: 'vibe add db',
    references: ['https://owasp.org/Top10/A03_2021-Injection/'],
  },
];
