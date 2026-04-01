import { resolve } from 'node:path';
import { analyzeProject } from '../analyzers/detector.js';
import { buildScanPrompt } from '../claude/prompts/scan.js';
import { callAnthropicApi } from '../claude/api.js';
import { withSpinner } from '../ui/spinner.js';
import type { ProjectAnalysis } from '../types/analysis.js';

export interface ScanOptions {
  projectDir: string;
  generateClaudeMd: boolean;
  verbose: boolean;
}

export interface ScanResult {
  analysis: ProjectAnalysis;
  claudeMd: string | null;
}

/**
 * Runs the scan phase: detects stack, checks practices, optionally generates CLAUDE.md.
 */
export async function runScan(options: ScanOptions): Promise<ScanResult> {
  const dir = resolve(options.projectDir);

  // Step 1: Analyze the project (pure filesystem, no API)
  const analysis = await withSpinner('Analyzing project structure', async () => {
    return analyzeProject(dir);
  });

  // Step 2: Optionally generate CLAUDE.md via Claude API
  let claudeMd: string | null = null;
  if (options.generateClaudeMd && process.env.ANTHROPIC_API_KEY) {
    claudeMd = await withSpinner('Generating CLAUDE.md with Claude', async () => {
      const prompt = buildScanPrompt(analysis);
      return callAnthropicApi(prompt, {
        systemPrompt: 'You are an expert software architect. Generate a CLAUDE.md file that helps AI coding assistants understand and work effectively with this project. Be specific, practical, and concise.',
        maxTokens: 4096,
        temperature: 0.2,
      });
    });
  }

  return { analysis, claudeMd };
}
