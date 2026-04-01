import { callClaudeCli } from '../claude/cli.js';
import { buildAskSystemPrompt } from '../claude/prompts/run.js';
import { checkClaudeCli } from '../utils/env.js';
import { theme } from '../ui/theme.js';
import { VibeError } from '../utils/errors.js';
import type { CLIConfig } from '../types/config.js';

export async function askCommand(question: string, config: CLIConfig): Promise<void> {
  try {
    checkClaudeCli();

    const projectDir = process.cwd();
    const systemPrompt = buildAskSystemPrompt(projectDir);

    if (config.verbose) {
      console.log(theme.dim('System prompt loaded from project context'));
      console.log(theme.dim(`Question: "${question}"\n`));
    }

    console.log(theme.brand('🤔 Asking Claude...\n'));

    const prompt = `${systemPrompt}\n\nUSER QUESTION:\n${question}`;
    const response = await callClaudeCli(prompt);

    console.log(response);
  } catch (error) {
    if (error instanceof VibeError) {
      console.error(theme.error(`\n❌ ${error.userMessage}`));
      process.exit(1);
    }
    throw error;
  }
}
