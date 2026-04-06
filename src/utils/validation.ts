import { z } from 'zod';

const PersonaSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  painPoints: z.array(z.string()).min(1),
  goals: z.array(z.string()).min(1),
});

const FeatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

const TechStackSchema = z.object({
  frontend: z.string(),
  backend: z.string(),
  database: z.string(),
  cache: z.string(),
  auth: z.string(),
  testing: z.string(),
  deployment: z.string(),
  rationale: z.string(),
});

const GovernanceProfileSchema = z.object({
  securityLevel: z.enum(['standard', 'elevated', 'strict']).default('standard'),
  complianceNeeds: z.array(z.string()).default(['12-factor']),
  accessibilityTarget: z.string().default('WCAG-AA'),
}).optional();

export const EnrichmentBriefSchema = z.object({
  vision: z.string().min(10),
  problemStatement: z.string().min(10),
  personas: z.array(PersonaSchema).min(1).max(5),
  features: z.object({
    p0: z.array(FeatureSchema).min(1).max(7),
    p1: z.array(FeatureSchema).max(7),
    p2: z.array(FeatureSchema).max(7),
  }),
  techStack: TechStackSchema,
  architecturePattern: z.string().min(1),
  monetizationHypothesis: z.string().min(1),
  goToMarketSignal: z.string().min(1),
  governanceProfile: GovernanceProfileSchema,
});

/**
 * Parse and validate an enrichment brief from raw JSON string.
 * Throws ZodError on validation failure.
 */
export function parseEnrichmentBrief(raw: string): z.infer<typeof EnrichmentBriefSchema> {
  // Try to extract JSON from markdown code blocks if present
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();

  const parsed = JSON.parse(jsonStr);
  return EnrichmentBriefSchema.parse(parsed);
}
