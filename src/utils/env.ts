import { execSync } from 'node:child_process';
import { ClaudeCliError, ApiKeyMissingError } from './errors.js';

export function checkClaudeCli(): string {
  try {
    const path = execSync('which claude', { encoding: 'utf-8' }).trim();
    if (!path) {
      throw new ClaudeCliError(
        'Claude CLI not found. Install it: npm install -g @anthropic-ai/claude-code'
      );
    }
    return path;
  } catch {
    throw new ClaudeCliError(
      'Claude CLI not found on your PATH.\n' +
        'Install it with: npm install -g @anthropic-ai/claude-code\n' +
        'Or visit: https://docs.anthropic.com/en/docs/claude-code'
    );
  }
}

export function checkAnthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new ApiKeyMissingError();
  }
  return key;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}
