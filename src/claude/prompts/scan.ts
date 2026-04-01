import type { ProjectAnalysis } from '../../types/analysis.js';

/**
 * Builds a prompt for Claude to generate a CLAUDE.md based on project analysis.
 */
export function buildScanPrompt(analysis: ProjectAnalysis): string {
  const { stack, practices, missingPractices, recommendations } = analysis;

  const detectedPractices = practices
    .filter((p) => p.detected)
    .map((p) => `- ${p.detectorId} (confidence: ${p.confidence}, markers: ${p.markers.join(', ')})`)
    .join('\n');

  const missingList = missingPractices.map((id) => `- ${id}`).join('\n');
  const recList = recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

  return `Analyze the following project scan results and generate a comprehensive CLAUDE.md file.

## Detected Stack
- Stack: ${stack.stack}
- Framework: ${stack.framework}
- Language: ${stack.language}
- Package Manager: ${stack.packageManager}
${stack.details ? `- Details: ${JSON.stringify(stack.details)}` : ''}

## Detected Practices
${detectedPractices || '(none detected)'}

## Missing Practices
${missingList || '(all practices detected)'}

## Recommendations
${recList || '(no recommendations)'}

## Instructions

Generate a CLAUDE.md file with these sections:

1. **Project Overview** — What this project is (infer from stack, framework, and structure).
2. **Tech Stack** — Exact technologies detected.
3. **Development Commands** — Common commands for this stack (build, test, lint, dev server). Use the detected package manager.
4. **Architecture** — Infer likely architecture patterns from the stack.
5. **Code Standards** — Infer from detected linting/testing/hooks configuration.
6. **Key Conventions** — File structure patterns, naming conventions for this framework.
7. **Known Gaps** — List missing practices as areas that need attention.

Keep the output in Markdown format. Be specific to the detected stack — do not be generic.
Do NOT wrap the output in a code fence. Output raw Markdown directly.`;
}
