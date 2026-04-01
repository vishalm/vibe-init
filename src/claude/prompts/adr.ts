import type { EnrichmentBrief } from '../../types/enrichment.js';

export function buildAdrPrompt(brief: EnrichmentBrief, projectName: string): string {
  return `You are a senior software architect. Generate an Architecture Decision Record (ADR) in Markdown format for the following project.

PROJECT: ${projectName}
VISION: ${brief.vision}
PROBLEM: ${brief.problemStatement}
ARCHITECTURE: ${brief.architecturePattern}
TECH STACK: ${JSON.stringify(brief.techStack, null, 2)}
P0 FEATURES: ${brief.features.p0.map((f) => f.name).join(', ')}

Generate a complete ADR with these sections:
# ADR 001: Initial Architecture for ${projectName}

## Status
Accepted

## Context
[Describe the problem context — what needs to be built and why]

## Decision
[Describe the architecture chosen and the tech stack]

## Options Considered
[List 2-3 alternatives that were considered with brief pros/cons]

## Consequences
### Positive
[List 3-4 positive consequences]
### Negative
[List 2-3 trade-offs accepted]
### Risks
[List 2-3 risks to monitor]

## 12-Factor App Compliance
[Map which of the 12 factors apply and how they are addressed]

## Security Considerations
[Brief threat model: auth, data access, API boundaries, input validation]

Respond with ONLY the Markdown content. No code blocks wrapping the markdown.`;
}
