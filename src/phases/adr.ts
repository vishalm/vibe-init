import { callAnthropicApi } from '../claude/api.js';
import { buildAdrPrompt } from '../claude/prompts/adr.js';
import { withSpinner } from '../ui/spinner.js';
import type { EnrichmentBrief } from '../types/enrichment.js';

export async function runAdrGeneration(
  brief: EnrichmentBrief,
  projectName: string
): Promise<string> {
  const adr = await withSpinner('Generating Architecture Decision Record...', async () => {
    const prompt = buildAdrPrompt(brief, projectName);
    return callAnthropicApi(prompt, {
      maxTokens: 4096,
      temperature: 0.3,
      systemPrompt:
        'You are a senior software architect. Generate clear, well-structured Architecture Decision Records.',
    });
  });

  return adr;
}
