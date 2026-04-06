import type { GovernanceReport } from '../types/governance.js';
import { formatReport } from '../scoring/report.js';

/**
 * Display a governance audit report to the console.
 */
export function displayReport(report: GovernanceReport): void {
  const formatted = formatReport(report);
  console.log(formatted);
}
