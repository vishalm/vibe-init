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

    // Note: ANTHROPIC_API_KEY is optional — falls back to Claude CLI
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(
        theme.dim(
          'ℹ  No ANTHROPIC_API_KEY — using Claude CLI for all generation.\n'
        )
      );
    }

    // Phase 0: Ignition
    const { VERSION } = await import('../version.js');
    const { idea, projectName, projectSlug } = await runIgnition(VERSION);

    if (config.verbose) {
      console.log(theme.dim(`\nIdea: "${idea}"`));
      console.log(theme.dim(`Project: ${projectName} (${projectSlug})\n`));
    }

    // Phase 1: Enrichment
    console.log(theme.heading('\n📡 Phase 1: Enriching your idea...\n'));
    const brief = await runEnrichment(idea);

    // Phase 2: ADR Generation (uses API key if available, otherwise Claude CLI)
    console.log(theme.heading('\n📐 Phase 2: Generating Architecture Decision Record...\n'));
    const adr = await runAdrGeneration(brief, projectName);

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
      if (error.debugInfo) {
        console.error(theme.dim(`\n${error.debugInfo}`));
      }
      process.exit(1);
    }
    throw error;
  }
}
