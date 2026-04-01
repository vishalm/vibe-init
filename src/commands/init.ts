import { runIgnition } from '../phases/ignition.js';
import { runEnrichment } from '../phases/enrichment.js';
import { runAdrGeneration } from '../phases/adr.js';
import { runScaffold } from '../phases/scaffold.js';
import { checkClaudeCli } from '../utils/env.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

export async function initCommand(config: CLIConfig): Promise<void> {
  try {
    // Precondition: Claude CLI must be available
    checkClaudeCli();

    // Precondition: ANTHROPIC_API_KEY for batch generation
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(
        theme.warning(
          '⚠️  ANTHROPIC_API_KEY not set. ADR and doc generation will be skipped.\n' +
            '   Set it with: export ANTHROPIC_API_KEY=your-key-here\n'
        )
      );
    }

    // Phase 0: Ignition
    const { idea, projectName, projectSlug } = await runIgnition('0.1.0');

    if (config.verbose) {
      console.log(theme.dim(`\nIdea: "${idea}"`));
      console.log(theme.dim(`Project: ${projectName} (${projectSlug})\n`));
    }

    // Phase 1: Enrichment
    console.log(theme.heading('\n📡 Phase 1: Enriching your idea...\n'));
    const brief = await runEnrichment(idea);

    // Phase 2: ADR Generation
    let adr = '# ADR 001: Initial Architecture\n\n_To be written._';
    if (process.env.ANTHROPIC_API_KEY) {
      console.log(theme.heading('\n📐 Phase 2: Generating Architecture Decision Record...\n'));
      adr = await runAdrGeneration(brief, projectName);
    } else {
      console.log(theme.dim('\nSkipping ADR generation (no ANTHROPIC_API_KEY).\n'));
    }

    // Phase 3: Scaffold
    console.log(theme.heading('\n🏗️  Phase 3: Scaffolding your project...\n'));
    await runScaffold({
      projectName,
      projectSlug,
      brief,
      adr,
      outputDir: process.cwd(),
      dryRun: config.dryRun,
    });
  } catch (error) {
    if (error instanceof VibeError) {
      console.error(theme.error(`\n❌ ${error.userMessage}`));
      if (config.verbose && error.debugInfo) {
        console.error(theme.dim(`\nDebug: ${error.debugInfo}`));
      }
      process.exit(1);
    }
    throw error;
  }
}
