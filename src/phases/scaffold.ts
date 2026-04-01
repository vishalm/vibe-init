import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { getStack } from '../templates/registry.js';
import { renderTemplates } from '../templates/renderer.js';
import { writeFileTree, isEmptyDir } from '../utils/fs.js';
import { callAnthropicApi } from '../claude/api.js';
import { buildReadmePrompt, buildClaudeMdPrompt } from '../claude/prompts/scaffold.js';
import { withSpinner } from '../ui/spinner.js';
import { theme } from '../ui/theme.js';
import type { EnrichmentBrief } from '../types/enrichment.js';
import type { TemplateContext, RenderedFile } from '../types/template.js';
import { VibeError } from '../utils/errors.js';

export interface ScaffoldOptions {
  projectName: string;
  projectSlug: string;
  brief: EnrichmentBrief;
  adr: string;
  outputDir: string;
  stackId?: string;
  dryRun?: boolean;
}

export async function runScaffold(options: ScaffoldOptions): Promise<string> {
  const {
    projectName,
    projectSlug,
    brief,
    adr,
    outputDir,
    stackId = 'nextjs-fullstack',
    dryRun,
  } = options;

  const targetDir = join(outputDir, projectSlug);

  // Safety check: target directory
  if (!isEmptyDir(targetDir)) {
    throw new VibeError(
      `Directory "${targetDir}" already exists and is not empty. Choose a different name or remove it.`
    );
  }

  mkdirSync(targetDir, { recursive: true });

  const stack = getStack(stackId);
  const dbName = projectSlug.replace(/-/g, '_');
  const timestamp = new Date().toISOString();

  const context: TemplateContext = {
    projectName,
    projectSlug,
    brief,
    adr,
    timestamp,
    dbName,
    stack: stackId,
  };

  // Step 1: Render EJS templates using the selected stack
  const templateFiles = await withSpinner(
    `Rendering ${stack.name} templates...`,
    async () => renderTemplates(stack.manifest, context, stack.templateDir)
  );

  // Step 2: Generate Claude-powered docs (README.md, CLAUDE.md)
  const generatedDocs = await withSpinner(
    'Generating documentation with Claude...',
    async () => {
      const [readme, claudeMd] = await Promise.all([
        callAnthropicApi(buildReadmePrompt(brief, projectName, projectSlug), {
          maxTokens: 4096,
          temperature: 0.4,
        }),
        callAnthropicApi(buildClaudeMdPrompt(brief, projectName, projectSlug), {
          maxTokens: 3000,
          temperature: 0.3,
        }),
      ]);

      return [
        { path: 'README.md', content: readme },
        { path: 'CLAUDE.md', content: claudeMd },
      ] as RenderedFile[];
    }
  );

  // Step 3: Add the ADR
  const adrFile: RenderedFile = {
    path: 'docs/adr/001-initial-architecture.md',
    content: adr,
  };

  // Combine all files
  const allFiles = [...templateFiles, ...generatedDocs, adrFile];

  if (dryRun) {
    console.log(theme.warning('\nDRY RUN — Files that would be created:'));
    for (const file of allFiles) {
      console.log(theme.dim(`  ${file.path}`));
    }
    return targetDir;
  }

  // Step 4: Write everything to disk
  await withSpinner(
    `Writing ${allFiles.length} files to ${projectSlug}/...`,
    async () => writeFileTree(targetDir, allFiles)
  );

  // Summary
  console.log('\n' + theme.brand('═══════════════════════════════════════'));
  console.log(theme.success('  PROJECT SCAFFOLDED SUCCESSFULLY!'));
  console.log(theme.brand('═══════════════════════════════════════\n'));
  console.log(theme.label('  Location: ') + theme.value(targetDir));
  console.log(theme.label('  Stack:    ') + theme.value(stack.name));
  console.log(theme.label('  Files:    ') + theme.value(`${allFiles.length} files created`));
  console.log(
    theme.label('\n  Next steps:\n') +
      theme.value(`  cd ${projectSlug}\n`) +
      theme.value('  make setup\n') +
      theme.value('  make dev\n')
  );

  return targetDir;
}
