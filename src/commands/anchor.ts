import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

const CONTEXT_DIR = 'docs/context';

const FEATURE_TEMPLATE = (name: string, timestamp: string) => `# Feature: ${name}

> Created: ${timestamp}
> Last updated: ${timestamp}

## Summary
<!-- 1-2 sentences: what this feature is and why it matters -->

## Decisions

| # | Decision | Reason | Rejected Alternative |
|---|----------|--------|----------------------|
| 1 | | | |

## Constraints
<!-- Hard boundaries for this feature -->
-

## Open Questions
<!-- Unresolved items — check these off as they're answered -->
- [ ]

## State
<!-- Track progress — check off milestones -->
- [ ] Design agreed
- [ ] Core implementation
- [ ] Tests written
- [ ] Edge cases handled
- [ ] Code review passed
- [ ] Documentation updated

## Context for AI
<!-- Anything Claude needs to know when working on this feature -->
<!-- Include: related files, patterns to follow, gotchas, prior decisions that constrain this -->

`;

export async function anchorCommand(
  featureName: string | undefined,
  config: CLIConfig
): Promise<void> {
  try {
    const projectDir = process.cwd();
    const contextDir = join(projectDir, CONTEXT_DIR);

    // List mode: show all anchored features
    if (!featureName) {
      return listAnchors(contextDir);
    }

    const slug = featureName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const filePath = join(contextDir, `${slug}.md`);

    if (existsSync(filePath)) {
      // Update mode: show the file and prompt for what to add
      console.log(theme.info(`\n  Context file exists: ${CONTEXT_DIR}/${slug}.md\n`));
      const content = readFileSync(filePath, 'utf-8');

      // Count open questions and incomplete state items
      const openQuestions = (content.match(/^- \[ \]/gm) || []).length;
      const completedItems = (content.match(/^- \[x\]/gm) || []).length;
      const decisions = (content.match(/^\| \d+/gm) || []).length;

      console.log(theme.label('  Status:'));
      console.log(theme.value(`    ${decisions} decisions recorded`));
      console.log(theme.value(`    ${openQuestions} open questions`));
      console.log(theme.value(`    ${completedItems} milestones completed\n`));

      // Update the "Last updated" timestamp
      const updated = content.replace(
        /^> Last updated: .+$/m,
        `> Last updated: ${new Date().toISOString().split('T')[0]}`
      );
      if (updated !== content && !config.dryRun) {
        writeFileSync(filePath, updated, 'utf-8');
      }

      console.log(theme.dim(`  Edit: ${CONTEXT_DIR}/${slug}.md\n`));
      return;
    }

    // Create mode: new feature context document
    mkdirSync(contextDir, { recursive: true });
    const timestamp = new Date().toISOString().split('T')[0];
    const content = FEATURE_TEMPLATE(featureName, timestamp);

    if (config.dryRun) {
      console.log(theme.warning('\n  DRY RUN — Would create:'));
      console.log(theme.dim(`  ${CONTEXT_DIR}/${slug}.md\n`));
      return;
    }

    writeFileSync(filePath, content, 'utf-8');

    console.log('\n' + theme.brand('═══════════════════════════════════════'));
    console.log(theme.success(`  Context anchored: ${featureName}`));
    console.log(theme.brand('═══════════════════════════════════════\n'));
    console.log(theme.label('  Created:') + theme.value(` ${CONTEXT_DIR}/${slug}.md`));
    console.log(theme.dim('\n  Fill in decisions, constraints, and open questions.'));
    console.log(theme.dim('  This file persists context across AI sessions —'));
    console.log(theme.dim('  you can safely close your chat without losing context.\n'));
    console.log(theme.label('  Litmus test:') + theme.dim(' Can you close your AI chat'));
    console.log(theme.dim('  and start fresh without anxiety? If yes, context is anchored.\n'));
  } catch (error) {
    if (error instanceof VibeError) {
      console.error(theme.error(`\n❌ ${error.userMessage}`));
      process.exit(1);
    }
    throw error;
  }
}

function listAnchors(contextDir: string): void {
  if (!existsSync(contextDir)) {
    console.log(theme.dim('\n  No context anchors found.'));
    console.log(theme.dim('  Create one: vibe anchor "my feature"\n'));
    return;
  }

  const files = readdirSync(contextDir).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.log(theme.dim('\n  No context anchors found.'));
    console.log(theme.dim('  Create one: vibe anchor "my feature"\n'));
    return;
  }

  console.log(theme.heading('\n  Anchored Features:\n'));

  for (const file of files) {
    const content = readFileSync(join(contextDir, file), 'utf-8');
    const name = content.match(/^# Feature: (.+)$/m)?.[1] ?? file.replace('.md', '');
    const openQuestions = (content.match(/^- \[ \]/gm) || []).length;
    const completedItems = (content.match(/^- \[x\]/gm) || []).length;
    const totalItems = openQuestions + completedItems;
    const decisions = (content.match(/^\| \d+/gm) || []).length;

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const icon = progress === 100 ? theme.success('✔') : progress > 0 ? theme.warning('◐') : theme.dim('○');

    console.log(`  ${icon} ${theme.bold(name)}`);
    console.log(theme.dim(`    ${decisions} decisions | ${openQuestions} open questions | ${progress}% complete`));
    console.log(theme.dim(`    ${CONTEXT_DIR}/${file}\n`));
  }
}
