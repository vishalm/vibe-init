import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { callClaudeCli } from '../../claude/cli.js';
import { buildComponentPrompt } from '../../claude/prompts/add.js';
import { writeFeatureFiles } from '../base.js';

function parseGeneratorResponse(raw: string): { files: { path: string; content: string }[]; instructions: string[] } {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude response did not contain valid JSON');
  return JSON.parse(jsonMatch[0]);
}

export const component: FeatureModule = {
  id: 'component',
  name: 'React Component Generator',
  description: 'Generate a React component with tests using Claude',
  category: 'generator',
  supportedStacks: ['nextjs', 'node'],
  detect() {
    return false;
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const name = options.args?.[0];
    if (!name) throw new Error('Usage: vibe add component <component-name>');
    const prompt = buildComponentPrompt(name, options.stack);
    const raw = await callClaudeCli(prompt, { timeout: 60_000 });
    const result = parseGeneratorResponse(raw);
    const { created } = writeFeatureFiles(projectDir, result.files, options.force);
    return {
      filesCreated: created,
      filesModified: [],
      instructions: result.instructions,
    };
  },
};
