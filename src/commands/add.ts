import { getFeature, listFeatures } from '../features/registry.js';
import { detectStack } from '../features/base.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

export async function addCommand(
  featureId: string,
  args: string[],
  config: CLIConfig & { force?: boolean }
): Promise<void> {
  try {
    const projectDir = process.cwd();
    const feature = getFeature(featureId);

    if (!feature) {
      const available = listFeatures().map((f) => f.id).join(', ');
      console.error(theme.error(`Unknown feature: "${featureId}"`));
      console.log(theme.dim(`Available features: ${available}`));
      process.exit(1);
    }

    const stack = detectStack(projectDir);
    if (config.verbose) {
      console.log(theme.dim(`Detected stack: ${stack}`));
      console.log(theme.dim(`Feature: ${feature.name} (${feature.id})\n`));
    }

    // Check if already installed
    const alreadyInstalled = feature.detect(projectDir);
    if (alreadyInstalled && !config.force) {
      console.log(theme.warning(`${feature.name} is already detected in this project.`));
      console.log(theme.dim('Use --force to overwrite existing files.'));
      return;
    }

    console.log(theme.brand(`Adding ${feature.name}...\n`));

    const result = await feature.apply(projectDir, {
      dryRun: config.dryRun,
      verbose: config.verbose,
      force: config.force ?? false,
      stack,
      args,
    });

    // Print results
    if (result.filesCreated.length > 0) {
      console.log(theme.success('Files created:'));
      for (const f of result.filesCreated) console.log(theme.dim(`  + ${f}`));
    }
    if (result.filesModified.length > 0) {
      console.log(theme.info('\nFiles modified:'));
      for (const f of result.filesModified) console.log(theme.dim(`  ~ ${f}`));
    }
    if (result.instructions.length > 0) {
      console.log(theme.heading('\nNext steps:'));
      for (const i of result.instructions) console.log(`  ${theme.label('>')} ${i}`);
    }
    console.log('');
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
