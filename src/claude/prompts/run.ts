import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Builds a system prompt for `vibe run` by reading the project's CLAUDE.md
 * and injecting it as context for Claude.
 */
export function buildRunSystemPrompt(projectDir: string): string {
  const claudeMdPath = join(projectDir, 'CLAUDE.md');
  let projectContext = '';

  if (existsSync(claudeMdPath)) {
    projectContext = readFileSync(claudeMdPath, 'utf-8');
  }

  return `You are Claude Code, working within a project scaffolded by Vibe Init.

${projectContext ? `## Project Context (from CLAUDE.md)\n\n${projectContext}` : 'No CLAUDE.md found in this project.'}

## Operating Rules
- Follow the project's established patterns and conventions
- Use the project's existing tech stack — do not introduce new dependencies without asking
- Write tests alongside code changes
- Update CLAUDE.md if you make architectural changes
- Follow conventional commits for any git operations`;
}

/**
 * Builds a system prompt for `vibe ask` — read-only advisory mode.
 */
export function buildAskSystemPrompt(projectDir: string): string {
  const base = buildRunSystemPrompt(projectDir);

  return `${base}

## IMPORTANT: Read-Only Mode
You are in ADVISORY mode. Do NOT make any file changes.
Only analyze, explain, and recommend. If the user needs changes made,
tell them to use \`vibe run\` instead.`;
}
