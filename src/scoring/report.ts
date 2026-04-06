import type { GovernanceReport, GovernanceCategory, GovernanceCategoryScore } from '../types/governance.js';
import { GOVERNANCE_CATEGORY_LABELS } from '../governance/registry.js';
import { theme } from '../ui/theme.js';

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

function severityIcon(severity: string): string {
  switch (severity) {
    case 'block': return theme.error('\u2718');
    case 'warn': return theme.warning('\u26A0');
    case 'info': return theme.dim('\u2139');
    default: return theme.dim('\u2022');
  }
}

function formatCategory(cat: GovernanceCategory, catScore: GovernanceCategoryScore): string {
  const lines: string[] = [];
  const label = GOVERNANCE_CATEGORY_LABELS[cat].padEnd(22);
  lines.push(`  ${theme.bold(label)} ${progressBar(catScore.score, catScore.maxScore)}`);
  for (const policy of catScore.policies) {
    const icon = policy.passed ? theme.success('\u2714') : severityIcon(policy.severity);
    const name = policy.passed ? theme.dim(policy.name) : theme.value(policy.name);
    const sev = policy.passed ? '' : theme.dim(` [${policy.severity}]`);
    lines.push(`    ${icon} ${name}${sev}`);
  }
  return lines.join('\n');
}

export function formatReport(report: GovernanceReport): string {
  const lines: string[] = [];

  // Header
  lines.push('');
  lines.push(theme.brand('\u2550'.repeat(56)));
  lines.push(theme.bold(`  Governance Audit Report`));
  lines.push(theme.dim(`  ${report.projectDir}  |  Stack: ${report.stack}`));
  lines.push(theme.brand('\u2550'.repeat(56)));
  lines.push('');

  // Grade badge
  lines.push(`  Score: ${theme.bold(String(report.score))}  Grade: ${gradeColor(report.grade)}`);
  lines.push(`  ${progressBar(report.score, 100, 40)}`);
  lines.push('');

  // Categories
  const cats = Object.keys(report.categories) as GovernanceCategory[];
  for (const cat of cats) {
    lines.push(formatCategory(cat, report.categories[cat]));
    lines.push('');
  }

  // Violations grouped by severity
  const blockers = report.violations.filter((v) => v.severity === 'block');
  const warnings = report.violations.filter((v) => v.severity === 'warn');

  if (blockers.length > 0) {
    lines.push(theme.error('  BLOCKING VIOLATIONS:'));
    for (const v of blockers) {
      lines.push(`    ${theme.error('\u2718')} ${v.name}${v.fix ? `  ${theme.dim('→')} ${theme.info(v.fix)}` : ''}`);
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(theme.warning('  WARNINGS:'));
    for (const v of warnings) {
      lines.push(`    ${theme.warning('\u26A0')} ${v.name}${v.fix ? `  ${theme.dim('→')} ${theme.info(v.fix)}` : ''}`);
    }
    lines.push('');
  }

  // Fix suggestions (deduplicated)
  const fixable = report.violations.filter((v) => v.fix);
  if (fixable.length > 0) {
    const seen = new Set<string>();
    lines.push(theme.heading('  Quick fixes:'));
    for (const v of fixable) {
      if (seen.has(v.fix!)) continue;
      seen.add(v.fix!);
      lines.push(`    ${theme.brand('$')} ${theme.info(v.fix!)}`);
    }
    lines.push('');
  }

  lines.push(theme.dim(`  ${report.checks.length} policies checked | ${report.violations.length} violations | ${report.timestamp}`));
  lines.push('');

  return lines.join('\n');
}
