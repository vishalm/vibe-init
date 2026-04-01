import { theme } from './theme.js';
import type { ProjectAnalysis } from '../types/analysis.js';

/**
 * Pretty-prints scan results to the terminal.
 */
export function displayScanResults(analysis: ProjectAnalysis): void {
  const { stack, practices, recommendations } = analysis;

  // Header
  console.log('');
  console.log(theme.brand('  ╔══════════════════════════════════════╗'));
  console.log(theme.brand('  ║') + theme.bold('  Project Scan Results               ') + theme.brand('║'));
  console.log(theme.brand('  ╚══════════════════════════════════════╝'));
  console.log('');

  // Stack Detection
  console.log(theme.heading('  Stack Detection'));
  console.log('');
  if (stack.stack === 'unknown') {
    console.log(`    ${theme.warning('?')} Stack: ${theme.muted('Unknown')}`);
  } else {
    console.log(`    ${theme.success('*')} Stack:           ${theme.value(stack.stack)}`);
    console.log(`    ${theme.success('*')} Framework:       ${theme.value(stack.framework)}`);
    console.log(`    ${theme.success('*')} Language:        ${theme.value(stack.language)}`);
    console.log(`    ${theme.success('*')} Package Manager: ${theme.value(stack.packageManager)}`);
  }
  console.log('');

  // Practices
  console.log(theme.heading('  Practice Detection'));
  console.log('');

  const detected = practices.filter((p) => p.detected);
  const missing = practices.filter((p) => !p.detected);

  for (const p of detected) {
    const conf = p.confidence === 'high' ? theme.success('high') :
                 p.confidence === 'medium' ? theme.warning('med') :
                 theme.muted('low');
    console.log(`    ${theme.success('+')} ${padRight(p.detectorId, 18)} ${conf}  ${theme.dim(p.markers.slice(0, 3).join(', '))}`);
  }

  for (const p of missing) {
    console.log(`    ${theme.error('-')} ${padRight(p.detectorId, 18)} ${theme.muted('not found')}`);
  }

  console.log('');

  // Score
  const score = detected.length;
  const total = practices.length;
  const pct = Math.round((score / total) * 100);
  const scoreColor = pct >= 80 ? theme.success : pct >= 50 ? theme.warning : theme.error;
  console.log(theme.heading('  Score'));
  console.log('');
  console.log(`    ${scoreColor(`${score}/${total}`)} practices detected (${scoreColor(`${pct}%`)})`);
  console.log(`    ${renderBar(pct)}`);
  console.log('');

  // Recommendations
  if (recommendations.length > 0) {
    console.log(theme.heading('  Recommendations'));
    console.log('');
    for (const rec of recommendations) {
      console.log(`    ${theme.info('>')} ${rec}`);
    }
    console.log('');
  }
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function renderBar(pct: number): string {
  const width = 30;
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  const bar = theme.success('#'.repeat(filled)) + theme.muted('-'.repeat(empty));
  return `[${bar}]`;
}
