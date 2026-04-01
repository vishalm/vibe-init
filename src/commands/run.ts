import { spawnInteractiveClaude } from '../claude/cli.js';
import { buildRunSystemPrompt } from '../claude/prompts/run.js';
import { checkClaudeCli } from '../utils/env.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

export async function runCommand(task: string, config: CLIConfig): Promise<void> {
  try {
    checkClaudeCli();

    const projectDir = process.cwd();
    const systemPrompt = buildRunSystemPrompt(projectDir);

    if (config.verbose) {
      console.log(theme.dim('System prompt loaded from project context'));
      console.log(theme.dim(`Task: "${task}"\n`));
    }

    console.log(theme.brand('🔧 Spawning Claude Code with project context...\n'));

    const exitCode = await spawnInteractiveClaude(systemPrompt, task);

    if (exitCode !== 0) {
      console.log(theme.warning(`\nClaude exited with code ${exitCode}`));
    }
  } catch (error) {
    if (error instanceof VibeError) {
      console.error(theme.error(`\n❌ ${error.userMessage}`));
      process.exit(1);
    }
    throw error;
  }
}
