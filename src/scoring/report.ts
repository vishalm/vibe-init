import type { HealthReport, ScoreCategory, CategoryScore } from '../types/scoring.js';
import { theme } from '../ui/theme.js';

const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  'testing': 'Testing',
  'ci-cd': 'CI/CD',
  'containerization': 'Containerization',
  'security': 'Security',
  'code-quality': 'Code Quality',
  'documentation': 'Documentation',
  'observability': 'Observability',
};

function progressBar(score: number, max: number, width: number = 20): string {
  const ratio = max > 0 ? score / max : 0;
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const bar = theme.success('\u2588'.repeat(filled)) + theme.dim('\u2591'.repeat(empty));
  const pct = max > 0 ? Math.round(ratio * 100) : 0;
  return `${bar} ${pct}%`;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return theme.success(grade);
  if (grade.startsWith('B')) return theme.info(grade);
  if (grade.startsWith('C')) return theme.warning(grade);
  return theme.error(grade);
}

function formatCategory(cat: ScoreCategory, catScore: CategoryScore): string {
  const lines: string[] = [];
  const label = CATEGORY_LABELS[cat].padEnd(18);
  lines.push(`  ${theme.bold(label)} ${progressBar(catScore.score, catScore.maxScore)}`);
  for (const check of catScore.checks) {
    const icon = check.passed ? theme.success('\u2714') : theme.error('\u2718');
    const name = check.passed ? theme.dim(check.name) : theme.value(check.name);
    lines.push(`    ${icon} ${name}`);
  }
  return lines.join('\n');
}

export function formatReport(report: HealthReport): string {
  const lines: string[] = [];

  // Header
  lines.push('');
  lines.push(theme.brand('\u2550'.repeat(56)));
  lines.push(theme.bold(`  Project Health Report`));
  lines.push(theme.dim(`  ${report.projectDir}  |  Stack: ${report.stack}`));
  lines.push(theme.brand('\u2550'.repeat(56)));
  lines.push('');

  // Grade badge
  lines.push(`  Overall Score: ${theme.bold(String(report.overallScore))}  Grade: ${gradeColor(report.grade)}`);
  lines.push(`  ${progressBar(report.overallScore, 100, 40)}`);
  lines.push('');

  // Categories
  const cats = Object.keys(report.categories) as ScoreCategory[];
  for (const cat of cats) {
    lines.push(formatCategory(cat, report.categories[cat]));
    lines.push('');
  }

  // Fix suggestions (deduplicated by command)
  const fixable = report.checks.filter((c) => !c.passed && c.fixCommand);
  if (fixable.length > 0) {
    const seen = new Set<string>();
    lines.push(theme.heading('  Suggested fixes:'));
    for (const check of fixable) {
      if (seen.has(check.fixCommand!)) continue;
      seen.add(check.fixCommand!);
      const related = fixable.filter((c) => c.fixCommand === check.fixCommand);
      const names = related.map((c) => c.name).join(', ');
      lines.push(`    ${theme.brand('$')} ${theme.info(check.fixCommand!)}  ${theme.dim(`(${names})`)}`);
    }
    lines.push('');
  }

  lines.push(theme.dim(`  Scanned at ${report.timestamp}`));
  lines.push('');

  return lines.join('\n');
}
