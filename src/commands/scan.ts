import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runScan } from '../phases/scan.js';
import { displayScanResults } from '../ui/scan-display.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

export interface ScanCommandOptions extends CLIConfig {
  /** Generate CLAUDE.md from scan results */
  generateClaudeMd: boolean;
}

export async function scanCommand(
  projectDir: string,
  options: ScanCommandOptions
): Promise<void> {
  try {
    const dir = resolve(projectDir);

    console.log(theme.heading('\nScanning project...\n'));

    const { analysis, claudeMd } = await runScan({
      projectDir: dir,
      generateClaudeMd: options.generateClaudeMd,
      verbose: options.verbose,
    });

    // Display results
    displayScanResults(analysis);

    // Verbose: show raw analysis
    if (options.verbose) {
      console.log(theme.dim('\n--- Raw Analysis ---'));
      console.log(theme.dim(JSON.stringify(analysis, null, 2)));
    }

    // Write CLAUDE.md if generated
    if (claudeMd && !options.dryRun) {
      const claudeMdPath = join(dir, 'CLAUDE.md');
      writeFileSync(claudeMdPath, claudeMd, 'utf-8');
      console.log(theme.success(`  CLAUDE.md written to ${claudeMdPath}\n`));
    } else if (claudeMd && options.dryRun) {
      console.log(theme.info('  [dry-run] Would write CLAUDE.md:\n'));
      console.log(theme.dim(claudeMd.slice(0, 500) + (claudeMd.length > 500 ? '\n  ...' : '')));
      console.log('');
    } else if (!options.generateClaudeMd) {
      console.log(theme.dim('  Tip: Use --generate-claude-md to auto-generate a CLAUDE.md file.\n'));
    } else if (!process.env.ANTHROPIC_API_KEY) {
      console.log(theme.warning('  ANTHROPIC_API_KEY not set — skipped CLAUDE.md generation.\n'));
    }
  } catch (error) {
    if (error instanceof VibeError) {
      console.error(theme.error(`\n${error.userMessage}`));
      if (options.verbose && error.debugInfo) {
        console.error(theme.dim(`\nDebug: ${error.debugInfo}`));
      }
      process.exit(1);
    }
    throw error;
  }
}
