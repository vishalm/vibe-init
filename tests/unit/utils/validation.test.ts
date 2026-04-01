import { describe, it, expect } from 'vitest';
import { parseEnrichmentBrief, EnrichmentBriefSchema } from '../../../src/utils/validation.js';

const VALID_BRIEF = {
  vision: 'A platform for managing pet health records and vet appointments',
  problemStatement:
    'Pet owners struggle to keep track of vaccination schedules, vet visits, and medical records across multiple pets and vets',
  personas: [
    {
      name: 'Sarah the Pet Mom',
      role: 'Pet owner with multiple pets',
      painPoints: ['Loses paper records', 'Forgets vaccination dates'],
      goals: ['Keep all pet records in one place', 'Get reminders for vet visits'],
    },
    {
      name: 'Dr. Chen',
      role: 'Veterinarian',
      painPoints: ['Incomplete patient history', 'Owner miscommunication'],
      goals: ['Access complete pet history', 'Streamline follow-ups'],
    },
  ],
  features: {
    p0: [
      { name: 'Pet profiles', description: 'Create and manage pet profiles with basic info' },
      { name: 'Health records', description: 'Log vet visits, vaccinations, and medications' },
      { name: 'Appointment scheduling', description: 'Book and manage vet appointments' },
    ],
    p1: [
      { name: 'Reminders', description: 'Push notifications for upcoming vaccinations and visits' },
      { name: 'Vet directory', description: 'Search and connect with local veterinarians' },
    ],
    p2: [{ name: 'Pet social', description: 'Share pet updates with friends and family' }],
  },
  techStack: {
    frontend: 'Next.js 15 (App Router) with TypeScript',
    backend: 'Next.js API Routes + Prisma ORM',
    database: 'PostgreSQL',
    cache: 'Redis',
    auth: 'NextAuth.js v5',
    testing: 'Vitest + React Testing Library',
    deployment: 'Docker + GitHub Actions',
    rationale: 'Full-stack TypeScript for type safety across the entire stack',
  },
  architecturePattern: 'Modular Monolith',
  monetizationHypothesis: 'Freemium model with premium vet-sharing features',
  goToMarketSignal: 'Pet owner communities on Reddit and Facebook',
};

describe('EnrichmentBriefSchema', () => {
  it('should validate a valid enrichment brief', () => {
    const result = EnrichmentBriefSchema.safeParse(VALID_BRIEF);
    expect(result.success).toBe(true);
  });

  it('should reject a brief with missing vision', () => {
    const invalid = { ...VALID_BRIEF, vision: '' };
    const result = EnrichmentBriefSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject a brief with no personas', () => {
    const invalid = { ...VALID_BRIEF, personas: [] };
    const result = EnrichmentBriefSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject a brief with no P0 features', () => {
    const invalid = {
      ...VALID_BRIEF,
      features: { p0: [], p1: [], p2: [] },
    };
    const result = EnrichmentBriefSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject a brief with too many P0 features', () => {
    const tooMany = Array.from({ length: 8 }, (_, i) => ({
      name: `Feature ${i}`,
      description: `Description ${i}`,
    }));
    const invalid = {
      ...VALID_BRIEF,
      features: { ...VALID_BRIEF.features, p0: tooMany },
    };
    const result = EnrichmentBriefSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('parseEnrichmentBrief', () => {
  it('should parse valid JSON string', () => {
    const result = parseEnrichmentBrief(JSON.stringify(VALID_BRIEF));
    expect(result.vision).toBe(VALID_BRIEF.vision);
    expect(result.personas).toHaveLength(2);
    expect(result.features.p0).toHaveLength(3);
  });

  it('should extract JSON from markdown code blocks', () => {
    const wrapped = '```json\n' + JSON.stringify(VALID_BRIEF) + '\n```';
    const result = parseEnrichmentBrief(wrapped);
    expect(result.vision).toBe(VALID_BRIEF.vision);
  });

  it('should extract JSON from code blocks without language tag', () => {
    const wrapped = '```\n' + JSON.stringify(VALID_BRIEF) + '\n```';
    const result = parseEnrichmentBrief(wrapped);
    expect(result.vision).toBe(VALID_BRIEF.vision);
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseEnrichmentBrief('not json')).toThrow();
  });

  it('should throw on valid JSON but invalid schema', () => {
    expect(() => parseEnrichmentBrief('{"foo": "bar"}')).toThrow();
  });
});
