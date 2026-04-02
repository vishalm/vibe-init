import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { runIgnition } from '../phases/ignition.js';
import { runEnrichment } from '../phases/enrichment.js';
import { runAdrGeneration } from '../phases/adr.js';
import { callAnthropicApi } from '../claude/api.js';
import { spawnInteractiveClaude } from '../claude/cli.js';
import { checkClaudeCli } from '../utils/env.js';
import { withSpinner } from '../ui/spinner.js';
import { writeFileTree } from '../utils/fs.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';
import type { EnrichmentBrief } from '../types/enrichment.js';
import type { RenderedFile } from '../types/template.js';

export async function buildCommand(config: CLIConfig): Promise<void> {
  try {
    checkClaudeCli();

    const projectDir = process.cwd();

    // Check that vibe init has been run
    const claudeMdPath = join(projectDir, 'CLAUDE.md');
    if (!existsSync(claudeMdPath)) {
      console.error(
        theme.error('\n❌ No CLAUDE.md found in current directory.\n') +
          theme.dim('  Run `vibe init` first to set up the vibe coding framework.\n') +
          theme.dim('  Then run `vibe build` to build your project.\n')
      );
      process.exit(1);
    }

    const claudeMd = readFileSync(claudeMdPath, 'utf-8');

    // Phase 1: Ignition — capture the idea
    const { VERSION } = await import('../version.js');
    const { idea, projectName, projectSlug } = await runIgnition(VERSION);

    if (config.verbose) {
      console.log(theme.dim(`\nIdea: "${idea}"`));
      console.log(theme.dim(`Project: ${projectName} (${projectSlug})\n`));
    }

    // Phase 2: Enrichment — Claude generates the brief
    console.log(theme.heading('\n📡 Phase 1: Enriching your idea...\n'));
    const brief = await runEnrichment(idea);

    // Phase 3: ADR generation
    console.log(theme.heading('\n📐 Phase 2: Generating Architecture Decision Record...\n'));
    const adr = await runAdrGeneration(brief, projectName);

    // Write ADR to docs/
    const adrFile: RenderedFile = {
      path: 'docs/adr/001-initial-architecture.md',
      content: adr,
    };
    if (!config.dryRun) {
      writeFileTree(projectDir, [adrFile]);
      console.log(theme.success('  ✔ ADR written to docs/adr/001-initial-architecture.md\n'));
    }

    // Phase 4: Generate README
    const readme = await withSpinner('Generating README.md...', async () => {
      return callAnthropicApi(buildReadmePromptFromBrief(brief, projectName, projectSlug), {
        maxTokens: 4096,
        temperature: 0.4,
      });
    });

    if (!config.dryRun) {
      writeFileTree(projectDir, [{ path: 'README.md', content: readme }]);
      console.log(theme.success('  ✔ README.md generated\n'));
    }

    // Phase 5: Spawn Claude Code to build the project using the framework
    console.log(theme.heading('\n🏗️  Phase 3: Building with Claude Code...\n'));
    console.log(theme.dim('  Claude Code will use your CLAUDE.md framework, enrichment brief,'));
    console.log(theme.dim('  and ADR to build the project. You can guide it interactively.\n'));

    const buildPrompt = buildProjectPrompt(claudeMd, brief, adr, projectName);

    const exitCode = await spawnInteractiveClaude(buildPrompt);

    if (exitCode === 0) {
      console.log('\n' + theme.brand('═══════════════════════════════════════'));
      console.log(theme.success('  BUILD SESSION COMPLETE'));
      console.log(theme.brand('═══════════════════════════════════════\n'));
      console.log(theme.dim('  Run `vibe doctor` to check project health.'));
      console.log(theme.dim('  Run `vibe run "<task>"` to continue building with context.\n'));
    }
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

function buildProjectPrompt(
  claudeMd: string,
  brief: EnrichmentBrief,
  adr: string,
  projectName: string,
): string {
  const features = [
    ...brief.features.p0.map((f) => `[P0] ${f.name}: ${f.description}`),
    ...brief.features.p1.map((f) => `[P1] ${f.name}: ${f.description}`),
  ].join('\n');

  return `You are building the project "${projectName}" from scratch. Follow the CLAUDE.md framework below as your coding bible — every convention, pattern, and guardrail in it is law.

===== CLAUDE.md (PROJECT FRAMEWORK) =====
${claudeMd}
===== END CLAUDE.md =====

===== ENRICHMENT BRIEF =====
Vision: ${brief.vision}
Problem: ${brief.problemStatement}
Architecture: ${brief.architecturePattern}
Tech Stack:
- Frontend: ${brief.techStack.frontend}
- Backend: ${brief.techStack.backend}
- Database: ${brief.techStack.database}
- Cache: ${brief.techStack.cache}
- Auth: ${brief.techStack.auth}
- Testing: ${brief.techStack.testing}

Personas:
${brief.personas.map((p) => `- ${p.name} (${p.role}): ${p.painPoints[0]}`).join('\n')}

Features:
${features}
===== END BRIEF =====

===== ARCHITECTURE DECISION RECORD =====
${adr}
===== END ADR =====

BUILD THIS PROJECT NOW. Follow these steps in order:

1. **Project setup**: Initialize package.json (or equivalent), configure TypeScript/linting, set up the project structure per CLAUDE.md conventions
2. **Database schema**: Set up the ORM and define the data models for P0 features
3. **Core infrastructure**: Logging, env validation, error handling, health check endpoint
4. **P0 features**: Implement all P0 (must-have) features with full CRUD where applicable
5. **Testing**: Write tests for all P0 features — unit tests and integration tests
6. **Docker**: Add Dockerfile + docker-compose.yml for local development
7. **CI/CD**: Add GitHub Actions CI pipeline (lint, test, build)
8. **Documentation**: Update README.md with setup instructions and API reference

For each step:
- Follow CLAUDE.md conventions exactly
- Add proper error handling and input validation
- Write tests alongside implementation
- Use the project's chosen libraries (not alternatives)

Start building now. Begin with project setup and work through the steps.`;
}

function buildReadmePromptFromBrief(
  brief: EnrichmentBrief,
  projectName: string,
  projectSlug: string
): string {
  return `Generate a README.md for a new project. Respond with ONLY the raw markdown content.

PROJECT: ${projectName}
SLUG: ${projectSlug}
VISION: ${brief.vision}
PROBLEM: ${brief.problemStatement}
ARCHITECTURE: ${brief.architecturePattern}
TECH STACK:
- Frontend: ${brief.techStack.frontend}
- Backend: ${brief.techStack.backend}
- Database: ${brief.techStack.database}
- Cache: ${brief.techStack.cache}
- Auth: ${brief.techStack.auth}

P0 FEATURES: ${brief.features.p0.map((f) => `${f.name}: ${f.description}`).join('\n')}

Include these sections:
1. Project title + one-line description + badges (build, coverage, license)
2. Architecture overview with a Mermaid diagram
3. Prerequisites (Node.js 20+, Docker, PostgreSQL)
4. Quick Start (clone, install, setup env, docker compose up, dev server)
5. Project Structure (brief directory overview)
6. Development (how to run tests, lint, build)
7. API Endpoints (list the key routes with methods)
8. Deployment (Docker build + deploy)
9. Contributing
10. License (MIT)

Keep it practical and scannable.`;
}
