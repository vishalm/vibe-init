import type { EnrichmentBrief } from '../../types/enrichment.js';

const ENRICHMENT_SYSTEM_PROMPT = `You are a senior product architect and technical co-founder. Your job is to take a raw product idea and enrich it into a buildable MVP specification.

You MUST respond with ONLY valid JSON — no markdown, no code blocks, no explanation text. Just the JSON object.

The JSON must match this exact schema:
{
  "vision": "One crisp sentence of what this product is",
  "problemStatement": "What pain this solves and for whom",
  "personas": [
    {
      "name": "A realistic persona name",
      "role": "Their role/title",
      "painPoints": ["specific pain 1", "specific pain 2"],
      "goals": ["goal 1", "goal 2"]
    }
  ],
  "features": {
    "p0": [{"name": "Feature name", "description": "What it does"}],
    "p1": [{"name": "Feature name", "description": "What it does"}],
    "p2": [{"name": "Feature name", "description": "What it does"}]
  },
  "techStack": {
    "frontend": "Next.js 15 (App Router) with TypeScript",
    "backend": "Next.js API Routes + Prisma ORM",
    "database": "PostgreSQL",
    "cache": "Redis",
    "auth": "NextAuth.js v5",
    "testing": "Vitest + React Testing Library",
    "deployment": "Docker + GitHub Actions",
    "rationale": "Why this stack fits"
  },
  "architecturePattern": "Modular monolith or Monolith — pick the right one",
  "monetizationHypothesis": "How this could make money",
  "goToMarketSignal": "Who to launch to first"
}

CONSTRAINTS:
- Tech stack is locked to TypeScript + Next.js (App Router) + Prisma + PostgreSQL + Redis
- Limit P0 to 3-5 features (core MVP only)
- Limit P1 to 3-5 features
- Limit P2 to 2-3 features
- Create 2-3 realistic personas (not generic)
- Architecture pattern must be "Modular Monolith" or "Monolith" for MVP
- Be specific and actionable — not vague buzzwords`;

export function buildEnrichmentPrompt(idea: string): string {
  return `${ENRICHMENT_SYSTEM_PROMPT}

USER'S RAW IDEA:
${idea}

Respond with the JSON object only.`;
}

export function buildRefinementPrompt(
  idea: string,
  previousBrief: EnrichmentBrief,
  feedback: string
): string {
  return `${ENRICHMENT_SYSTEM_PROMPT}

USER'S ORIGINAL IDEA:
${idea}

PREVIOUS ENRICHMENT (to be refined):
${JSON.stringify(previousBrief, null, 2)}

USER'S FEEDBACK / ADJUSTMENTS:
${feedback}

Apply the user's feedback to refine the enrichment. Respond with the complete updated JSON object only.`;
}
