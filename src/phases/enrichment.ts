import { callClaudeCli } from '../claude/cli.js';
import {
  buildEnrichmentPrompt,
  buildRefinementPrompt,
} from '../claude/prompts/enrichment.js';
import { parseEnrichmentBrief } from '../utils/validation.js';
import {
  displayEnrichmentBrief,
  promptEnrichmentConfirmation,
  promptEditFeedback,
} from '../ui/prompts.js';
import { withSpinner } from '../ui/spinner.js';
import { theme } from '../ui/theme.js';
import type { EnrichmentBrief } from '../types/enrichment.js';
import { EnrichmentParseError } from '../utils/errors.js';

const MAX_PARSE_RETRIES = 2;

async function generateEnrichment(prompt: string): Promise<EnrichmentBrief> {
  let lastRaw = '';

  for (let attempt = 0; attempt <= MAX_PARSE_RETRIES; attempt++) {
    const currentPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour previous response was not valid JSON. Here is what you returned:\n${lastRaw.slice(0, 500)}\n\nPlease respond with ONLY valid JSON matching the schema. No markdown, no explanation.`;

    const raw = await callClaudeCli(currentPrompt);
    lastRaw = raw;

    try {
      return parseEnrichmentBrief(raw);
    } catch (error) {
      if (attempt === MAX_PARSE_RETRIES) {
        throw new EnrichmentParseError(lastRaw);
      }
      console.log(theme.warning(`\n⚠️  Parse attempt ${attempt + 1} failed, retrying...`));
    }
  }

  // Unreachable, but TypeScript needs it
  throw new EnrichmentParseError(lastRaw);
}

export async function runEnrichment(idea: string): Promise<EnrichmentBrief> {
  let brief: EnrichmentBrief | null = null;

  // Initial enrichment
  brief = await withSpinner('Enriching your idea with Claude...', async () => {
    const prompt = buildEnrichmentPrompt(idea);
    return generateEnrichment(prompt);
  });

  // Y/E/R loop
  while (true) {
    displayEnrichmentBrief(brief);
    const action = await promptEnrichmentConfirmation();

    switch (action) {
      case 'yes':
        return brief;

      case 'edit': {
        const feedback = await promptEditFeedback();
        brief = await withSpinner('Refining enrichment...', async () => {
          const prompt = buildRefinementPrompt(idea, brief!, feedback);
          return generateEnrichment(prompt);
        });
        break;
      }

      case 'restart':
        console.log(theme.info('\n🔄 Starting over...\n'));
        return runEnrichment(idea); // Recursive restart
    }
  }
}
