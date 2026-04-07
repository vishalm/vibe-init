import { generateFramework, detectProjectType } from '../phases/framework.js';
import { generatePolicyYamlFiles } from '../governance/yaml-generator.js';
import { installAutoSkills, detectProjectSkills } from '../skills/autoskills.js';
import { writeFileTree } from '../utils/fs.js';
import { checkClaudeCli } from '../utils/env.js';
import { theme } from '../ui/theme.js';
import { showBanner } from '../ui/banner.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';
import { VERSION } from '../version.js';
import { promptText } from '../ui/prompts.js';

export async function initCommand(config: CLIConfig): Promise<void> {
  try {
    checkClaudeCli();

    showBanner(VERSION);

    const projectDir = process.cwd();
    const projectType = detectProjectType(projectDir);

    if (projectType === 'brownfield') {
      console.log(theme.info('  Detected existing project — generating governance framework from analysis.\n'));
    } else {
      console.log(theme.info('  Setting up vibe coding governance framework.\n'));
    }

    // Ask for project name only — stack is auto-detected from the problem
    const projectName = await promptText('Project name', {
      defaultValue: projectDir.split('/').pop() ?? 'my-project',
    });

    // Stack is 'auto' — the enrichment phase (in vibe build) will choose the right stack
    const stack = 'auto';

    // Step 1: Generate the vibe coding framework (CLAUDE.md, skills, settings, ADR template)
    console.log(theme.heading('\n🔧 Generating vibe coding governance framework...\n'));

    const frameworkFiles = await generateFramework({
      projectDir,
      projectName,
      stack,
      dryRun: config.dryRun,
      verbose: config.verbose,
    });

    // Step 2: Generate governance policy YAML files
    const policyFiles = generatePolicyYamlFiles();

    const allFiles = [...frameworkFiles, ...policyFiles];

    if (config.dryRun) {
      console.log(theme.warning('\nDRY RUN — Files that would be created:'));
      for (const file of allFiles) {
        console.log(theme.dim(`  ${file.path}`));
      }
      const detected = detectProjectSkills(projectDir);
      if (detected.length > 0) {
        console.log(theme.dim('\n  Auto-detected skills: ' + detected.map((d) => d.name).join(', ')));
      }
    } else {
      writeFileTree(projectDir, allFiles);
    }

    // Step 3: Auto-install stack-specific skills
    let skillResult = { installed: [] as string[], skipped: [] as string[] };
    if (!config.dryRun) {
      skillResult = installAutoSkills(projectDir, { force: false, verbose: config.verbose });
    }

    // Summary
    console.log('\n' + theme.brand('═══════════════════════════════════════'));
    console.log(theme.success('  GOVERNANCE FRAMEWORK INITIALIZED'));
    console.log(theme.brand('═══════════════════════════════════════\n'));

    console.log(theme.label('  Framework:'));
    for (const file of frameworkFiles) {
      console.log(theme.success('    ✔ ') + theme.value(file.path));
    }

    console.log(theme.label('\n  Governance Policies:'));
    for (const file of policyFiles) {
      console.log(theme.success('    ✔ ') + theme.value(file.path));
    }

    if (skillResult.installed.length > 0) {
      console.log(theme.label('\n  Auto-installed Skills:'));
      for (const skill of skillResult.installed) {
        console.log(theme.success('    ✔ ') + theme.value(`.claude/commands/${skill}`));
      }
    }

    console.log(
      theme.label('\n  Next steps:\n') +
        theme.value('  1. Review CLAUDE.md and .vibe/policies/ for your project\n') +
        theme.value('  2. Run `vibe anchor "feature name"` to track feature decisions\n') +
        theme.value('  3. Run `vibe build` to build your project with Claude\n') +
        theme.value('  4. Run `vibe audit` to check governance compliance\n')
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
