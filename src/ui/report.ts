import type { HealthReport } from '../types/scoring.js';
import { formatReport } from '../scoring/report.js';

/**
 * Display a health report to the console with themed output.
 */
export function displayReport(report: HealthReport): void {
  const formatted = formatReport(report);
  console.log(formatted);
}
