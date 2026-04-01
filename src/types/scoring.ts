export type ScoreCategory =
  | 'testing'
  | 'ci-cd'
  | 'containerization'
  | 'security'
  | 'code-quality'
  | 'documentation'
  | 'observability';

export interface HealthCheck {
  id: string;
  category: ScoreCategory;
  name: string;
  /** Weight from 1-10 */
  weight: number;
  passed: boolean;
  message: string;
  /** Suggested fix command, e.g., "vibe add testing" */
  fixCommand?: string;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  checks: HealthCheck[];
}

export interface HealthReport {
  projectDir: string;
  stack: string;
  /** 0-100 overall score */
  overallScore: number;
  /** Letter grade: A+ through F */
  grade: string;
  categories: Record<ScoreCategory, CategoryScore>;
  checks: HealthCheck[];
  timestamp: string;
}
