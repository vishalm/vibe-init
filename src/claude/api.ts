import Anthropic from '@anthropic-ai/sdk';
import { ApiKeyMissingError, VibeError } from '../utils/errors.js';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ApiKeyMissingError();
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
 * Call the Anthropic API with a prompt and return the text response.
 * Includes retry logic with exponential backoff.
 */
export async function callAnthropicApi(
  userPrompt: string,
  options: ApiCallOptions = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
  } = options;

  const anthropic = getClient();
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

      // Don't retry on auth errors
      if (error instanceof ApiKeyMissingError) throw error;
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
