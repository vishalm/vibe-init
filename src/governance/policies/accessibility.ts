import type { GovernancePolicy } from '../../types/governance.js';
import { a11yLinterConfigured, langAttributePresent } from '../detectors.js';

export const accessibilityPolicies: GovernancePolicy[] = [
  {
    id: 'a11y-001', category: 'accessibility', name: 'Accessibility linter configured',
    description: 'An a11y linting plugin must be configured (eslint-plugin-jsx-a11y, axe-core, pa11y)',
    severity: 'warn', weight: 7, detector: a11yLinterConfigured,
    references: ['https://www.w3.org/WAI/standards-guidelines/wcag/'],
  },
  {
    id: 'a11y-002', category: 'accessibility', name: 'HTML lang attribute',
    description: 'Root HTML element must include a lang attribute for screen readers',
    severity: 'warn', weight: 5, detector: langAttributePresent,
    references: ['https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html'],
  },
];
