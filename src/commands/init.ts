import { generateFramework, detectProjectType } from '../phases/framework.js';
import { writeFileTree } from '../utils/fs.js';
import { checkClaudeCli } from '../utils/env.js';
import { theme } from '../ui/theme.js';
import { showBanner } from '../ui/banner.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';
import { VERSION } from '../version.js';
import { promptText, promptSelect } from '../ui/prompts.js';

const STACK_CHOICES = [
  { name: 'Next.js 15 (TypeScript, App Router, Prisma, PostgreSQL)', value: 'nextjs-fullstack' },
  { name: 'Node.js + Express (TypeScript, Prisma, PostgreSQL)', value: 'node-express' },
  { name: 'Python + FastAPI (SQLAlchemy, PostgreSQL)', value: 'python-fastapi' },
  { name: 'Go (Gin/Chi, PostgreSQL)', value: 'go-api' },
];

export async function initCommand(config: CLIConfig): Promise<void> {
  try {
    checkClaudeCli();

    showBanner(VERSION);

    const projectDir = process.cwd();
    const projectType = detectProjectType(projectDir);

    if (projectType === 'brownfield') {
      console.log(theme.info('  Detected existing project — generating framework from analysis.\n'));
    } else {
      console.log(theme.info('  Setting up vibe coding framework for a new project.\n'));
    }

    // Ask for project name
    const projectName = await promptText('Project name', {
      defaultValue: projectDir.split('/').pop() ?? 'my-project',
    });

    // Ask for stack (greenfield only — brownfield auto-detects)
    let stack = 'nextjs-fullstack';
    if (projectType === 'greenfield') {
      stack = await promptSelect('What stack are you building with?', STACK_CHOICES);
    }

    // Generate the framework
    console.log(theme.heading('\n🔧 Generating vibe coding framework...\n'));

    const files = await generateFramework({
      projectDir,
      projectName,
      stack,
      dryRun: config.dryRun,
      verbose: config.verbose,
    });

    if (config.dryRun) {
      console.log(theme.warning('\nDRY RUN — Files that would be created:'));
      for (const file of files) {
        console.log(theme.dim(`  ${file.path}`));
      }
    } else {
      writeFileTree(projectDir, files);
    }

    // Summary
    console.log('\n' + theme.brand('═══════════════════════════════════════'));
    console.log(theme.success('  VIBE FRAMEWORK INITIALIZED'));
    console.log(theme.brand('═══════════════════════════════════════\n'));
    console.log(theme.label('  Created:'));
    for (const file of files) {
      console.log(theme.success('    ✔ ') + theme.value(file.path));
    }
    console.log(
      theme.label('\n  Next steps:\n') +
        theme.value('  1. Review CLAUDE.md and customize for your project\n') +
        theme.value('  2. Run `vibe build` to build your project with Claude\n') +
        theme.value('  3. Or start coding with `vibe run "<task>"`\n')
    );
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
