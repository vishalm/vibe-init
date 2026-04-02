import Anthropic from '@anthropic-ai/sdk';
import { VibeError } from '../utils/errors.js';
import { callClaudeCli } from './cli.js';

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  client = new Anthropic({ apiKey });
  return client;
}

export interface ApiCallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.3;
const MAX_RETRIES = 2;

/**
 * Call Claude with a prompt and return the text response.
 * Uses the Anthropic API if ANTHROPIC_API_KEY is set, otherwise falls back
 * to Claude CLI (works with Claude Pro subscription).
 */
export async function callAnthropicApi(
  userPrompt: string,
  options: ApiCallOptions = {}
): Promise<string> {
  const anthropic = getClient();

  // Fall back to Claude CLI when no API key is available
  if (!anthropic) {
    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${userPrompt}`
      : userPrompt;
    return callClaudeCli(fullPrompt, { timeout: 180_000 });
  }

  const {
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [{ role: 'user', content: userPrompt }],
      });

      // Extract text from content blocks
      const textBlocks = message.content.filter(
        (block) => block.type === 'text'
      );
      if (textBlocks.length === 0) {
        throw new VibeError('Claude returned no text content');
      }

      return textBlocks.map((b) => b.text).join('\n');
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Anthropic.AuthenticationError) {
        throw new VibeError(
          'Invalid ANTHROPIC_API_KEY. Check your key at https://console.anthropic.com/settings/keys'
        );
      }

      // Retry on rate limits and server errors
      if (attempt < MAX_RETRIES) {
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
    }
  }

  throw new VibeError(
    `Failed to call Anthropic API after ${MAX_RETRIES + 1} attempts`,
    lastError?.message
  );
}
