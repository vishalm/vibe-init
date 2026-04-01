import type { StackDefinition, TemplateManifestEntry } from '../types/template.js';
import { getStackTemplatesDir } from './renderer.js';

// ── Next.js Full-Stack Manifest ──────────────────────────────────
const NEXTJS_MANIFEST: TemplateManifestEntry[] = [
  // Root config files
  { source: 'package.json.ejs', output: 'package.json' },
  { source: 'tsconfig.json.ejs', output: 'tsconfig.json' },
  { source: 'next.config.ts.ejs', output: 'next.config.ts' },
  { source: '.env.example.ejs', output: '.env.example' },
  { source: '.env.example.ejs', output: '.env' },
  { source: '.gitignore.ejs', output: '.gitignore' },
  { source: 'docker-compose.yml.ejs', output: 'docker-compose.yml' },
  { source: 'Dockerfile.ejs', output: 'Dockerfile' },
  { source: 'Makefile.ejs', output: 'Makefile' },
  { source: 'vitest.config.ts.ejs', output: 'vitest.config.ts' },
  { source: 'commitlint.config.js.ejs', output: 'commitlint.config.js' },

  // Prisma
  { source: 'prisma/schema.prisma.ejs', output: 'prisma/schema.prisma' },
  { source: 'prisma/seed.ts.ejs', output: 'prisma/seed.ts' },

  // App source code
  { source: 'src/app/layout.tsx.ejs', output: 'src/app/layout.tsx' },
  { source: 'src/app/page.tsx.ejs', output: 'src/app/page.tsx' },
  { source: 'src/app/api/health/route.ts.ejs', output: 'src/app/api/health/route.ts' },

  // Library code
  { source: 'src/lib/db.ts.ejs', output: 'src/lib/db.ts' },
  { source: 'src/lib/logger.ts.ejs', output: 'src/lib/logger.ts' },
  { source: 'src/lib/env.ts.ejs', output: 'src/lib/env.ts' },

  // Middleware
  { source: 'src/middleware.ts.ejs', output: 'src/middleware.ts' },

  // Tests
  { source: '__tests__/health.test.ts.ejs', output: '__tests__/health.test.ts' },
  { source: '__tests__/setup.ts.ejs', output: '__tests__/setup.ts' },

  // CI/CD
  { source: '.github/workflows/ci.yml.ejs', output: '.github/workflows/ci.yml' },

  // Git hooks
  { source: '.husky/pre-commit.ejs', output: '.husky/pre-commit' },
];

// ── Stack Definitions ────────────────────────────────────────────

const STACKS: StackDefinition[] = [
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack',
    description: 'Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL + Redis',
    language: 'typescript',
    templateDir: getStackTemplatesDir('nextjs-fullstack'),
    manifest: NEXTJS_MANIFEST,
  },
];

// ── Public API ───────────────────────────────────────────────────

/**
 * Get a stack definition by ID. Throws if not found.
 */
export function getStack(stackId: string): StackDefinition {
  const stack = STACKS.find((s) => s.id === stackId);
  if (!stack) {
    const available = STACKS.map((s) => s.id).join(', ');
    throw new Error(`Unknown stack "${stackId}". Available: ${available}`);
  }
  return stack;
}

/**
 * List all available stack definitions.
 */
export function listStacks(): StackDefinition[] {
  return [...STACKS];
}

/**
 * Get the manifest for a stack by ID.
 */
export function getStackManifest(stackId: string): TemplateManifestEntry[] {
  return getStack(stackId).manifest;
}

/**
 * Register a new stack definition (used by plugins/extensions).
 */
export function registerStack(stack: StackDefinition): void {
  if (STACKS.some((s) => s.id === stack.id)) {
    throw new Error(`Stack "${stack.id}" is already registered`);
  }
  STACKS.push(stack);
}
