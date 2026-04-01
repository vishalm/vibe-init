import { describe, it, expect } from 'vitest';
import {
  VibeError,
  ClaudeCliError,
  ApiKeyMissingError,
  TemplateRenderError,
  ValidationError,
  EnrichmentParseError,
} from '../../../src/utils/errors.js';

describe('Error classes', () => {
  it('VibeError should store userMessage and debugInfo', () => {
    const err = new VibeError('User-facing message', 'debug details');
    expect(err.userMessage).toBe('User-facing message');
    expect(err.debugInfo).toBe('debug details');
    expect(err.name).toBe('VibeError');
    expect(err.message).toBe('User-facing message');
  });

  it('ClaudeCliError should extend VibeError', () => {
    const err = new ClaudeCliError('Claude not found');
    expect(err).toBeInstanceOf(VibeError);
    expect(err.name).toBe('ClaudeCliError');
  });

  it('ApiKeyMissingError should have helpful message', () => {
    const err = new ApiKeyMissingError();
    expect(err.userMessage).toContain('ANTHROPIC_API_KEY');
    expect(err.userMessage).toContain('console.anthropic.com');
  });

  it('TemplateRenderError should include template path', () => {
    const err = new TemplateRenderError('package.json.ejs', 'undefined variable');
    expect(err.userMessage).toContain('package.json.ejs');
    expect(err.debugInfo).toContain('undefined variable');
  });

  it('EnrichmentParseError should truncate raw output', () => {
    const longOutput = 'x'.repeat(1000);
    const err = new EnrichmentParseError(longOutput);
    expect(err.debugInfo!.length).toBeLessThan(600);
  });
});
