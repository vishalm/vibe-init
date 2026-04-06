export type GovernanceCategory =
  | 'security'
  | 'accessibility'
  | 'reliability'
  | 'performance'
  | 'compliance'
  | 'clean-code'
  | 'api-governance'
  | 'data-governance'
  | 'code-review'
  | 'observability';

export type GovernanceSeverity = 'block' | 'warn' | 'info';

export interface GovernancePolicy {
  /** Unique ID, e.g. "sec-001" */
  id: string;
  category: GovernanceCategory;
  name: string;
  description: string;
  severity: GovernanceSeverity;
  /** Weight for scoring (1-10) */
  weight: number;
  /** Feature detector ID or custom detector function */
  detector: string | ((projectDir: string) => boolean);
  /** Suggested fix command */
  fix?: string;
  /** Reference URLs (OWASP, WCAG, 12-factor, etc.) */
  references?: string[];
}

export interface PolicyResult {
  id: string;
  category: GovernanceCategory;
  name: string;
  severity: GovernanceSeverity;
  weight: number;
  passed: boolean;
  message: string;
  fix?: string;
  references?: string[];
}

export interface GovernanceCategoryScore {
  score: number;
  maxScore: number;
  policies: PolicyResult[];
}

export interface GovernanceReport {
  projectDir: string;
  stack: string;
  score: number;
  grade: string;
  categories: Record<GovernanceCategory, GovernanceCategoryScore>;
  violations: PolicyResult[];
  checks: PolicyResult[];
  timestamp: string;
}
