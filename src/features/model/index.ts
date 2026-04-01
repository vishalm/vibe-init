import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { callClaudeCli } from '../../claude/cli.js';
import { buildModelPrompt } from '../../claude/prompts/add.js';
import { writeFeatureFiles } from '../base.js';

function parseGeneratorResponse(raw: string): { files: { path: string; content: string }[]; instructions: string[] } {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude response did not contain valid JSON');
  return JSON.parse(jsonMatch[0]);
}

export const model: FeatureModule = {
  id: 'model',
  name: 'Prisma Model Generator',
  description: 'Generate a Prisma model with migration using Claude',
  category: 'generator',
  supportedStacks: ['nextjs', 'node'],
  detect() {
    return false;
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const name = options.args?.[0];
    if (!name) throw new Error('Usage: vibe add model <model-name>');
    const prompt = buildModelPrompt(name, options.stack);
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
