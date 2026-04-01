import { scoreProject } from '../scoring/health.js';
import { displayReport } from '../ui/report.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

export async function doctorCommand(config: CLIConfig): Promise<void> {
  try {
    const projectDir = process.cwd();

    if (config.verbose) {
      console.log(theme.dim(`Scanning project at: ${projectDir}\n`));
    }

    console.log(theme.brand('Analyzing project health...\n'));

    const report = scoreProject(projectDir);

    if (config.verbose) {
      console.log(theme.dim(`Checks run: ${report.checks.length}`));
      console.log(theme.dim(`Passed: ${report.checks.filter((c) => c.passed).length}`));
      console.log(theme.dim(`Failed: ${report.checks.filter((c) => !c.passed).length}\n`));
    }

    displayReport(report);
  } catch (error) {
    if (error instanceof VibeError) {
      console.error(theme.error(`\n${error.userMessage}`));
      if (config.verbose && error.debugInfo) {
        console.error(theme.dim(`\nDebug: ${error.debugInfo}`));
      }
      process.exit(1);
    }
    throw error;
  }
}
