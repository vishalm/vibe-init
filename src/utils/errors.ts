export class VibeError extends Error {
  public readonly userMessage: string;
  public readonly debugInfo?: string;

  constructor(userMessage: string, debugInfo?: string) {
    super(userMessage);
    this.name = 'VibeError';
    this.userMessage = userMessage;
    this.debugInfo = debugInfo;
  }
}

export class ClaudeCliError extends VibeError {
  constructor(message: string, debugInfo?: string) {
    super(message, debugInfo);
    this.name = 'ClaudeCliError';
  }
}

export class ApiKeyMissingError extends VibeError {
  constructor() {
    super(
      'ANTHROPIC_API_KEY environment variable is not set.\n' +
        'Set it with: export ANTHROPIC_API_KEY=your-key-here\n' +
        'Get your key at: https://console.anthropic.com/settings/keys'
    );
    this.name = 'ApiKeyMissingError';
  }
}

export class TemplateRenderError extends VibeError {
  constructor(templatePath: string, cause: string) {
    super(
      `Failed to render template: ${templatePath}`,
      `Cause: ${cause}`
    );
    this.name = 'TemplateRenderError';
  }
}

export class ValidationError extends VibeError {
  constructor(message: string, debugInfo?: string) {
    super(message, debugInfo);
    this.name = 'ValidationError';
  }
}

export class EnrichmentParseError extends VibeError {
  constructor(rawOutput: string) {
    super(
      'Failed to parse enrichment response from Claude. Retrying...',
      `Raw output (first 500 chars): ${rawOutput.slice(0, 500)}`
    );
    this.name = 'EnrichmentParseError';
  }
}
