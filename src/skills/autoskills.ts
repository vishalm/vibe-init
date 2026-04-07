/**
 * Auto-skills detection and installation.
 * Detects project tech stack and installs matching AI agent skills.
 *
 * Based on the autoskills registry (https://github.com/vishalm/ai-skills-autoskills).
 * Skills are installed as .claude/commands/*.md files.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { readPackageJson } from '../features/base.js';

export interface SkillMapping {
  id: string;
  name: string;
  packages: string[];
  skills: string[];
}

/**
 * Core skills that apply to every project regardless of stack.
 */
const UNIVERSAL_SKILLS: { name: string; filename: string; content: string }[] = [
  {
    name: 'Context Anchor',
    filename: 'anchor.md',
    content: `Create or update a feature context document for persistent decision tracking.

When asked to anchor context for a feature:

1. Check if docs/context/<feature-slug>.md exists
2. If not, create it with this template:

# Feature: <name>

## Decisions
| # | Decision | Reason | Rejected Alternative |
|---|----------|--------|----------------------|

## Constraints
-

## Open Questions
- [ ]

## State
- [ ] Design agreed
- [ ] Core implementation
- [ ] Tests written
- [ ] Code review passed

## Context for AI
<!-- What I need to know when working on this feature -->

3. If it exists, read it and update the "Last updated" date
4. ALWAYS check this file before starting work on a feature
5. After making decisions during a session, UPDATE the decisions table

The goal: you should be able to close this chat and start a new one
without losing any context about this feature.`,
  },
  {
    name: 'Governance Check',
    filename: 'governance.md',
    content: `Run the governance audit and report results.

Steps:
1. Run \`vibe audit\` (or \`vibe doctor\`) in the project root
2. Parse the output and report:
   - Overall score and grade
   - Number of blocking violations
   - Number of warnings
   - Top 3 most impactful fixes
3. If there are blocking violations, list them with their fix commands
4. Suggest running the top fix command first

Do NOT auto-fix anything. Report the results and ask which violations to address.`,
  },
];

/**
 * Stack-specific skill map. Maps detected packages to skill content.
 */
const STACK_SKILLS: SkillMapping[] = [
  {
    id: 'react',
    name: 'React',
    packages: ['react', 'react-dom', 'next', '@remix-run/react'],
    skills: ['react-patterns', 'component-design'],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    packages: ['next'],
    skills: ['nextjs-app-router', 'nextjs-server-components'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    packages: ['typescript'],
    skills: ['typescript-strict'],
  },
  {
    id: 'prisma',
    name: 'Prisma',
    packages: ['@prisma/client', 'prisma'],
    skills: ['prisma-patterns'],
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    packages: ['tailwindcss', '@tailwindcss/forms'],
    skills: ['tailwind-patterns'],
  },
  {
    id: 'express',
    name: 'Express',
    packages: ['express'],
    skills: ['express-patterns'],
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    packages: ['fastapi', 'uvicorn'],
    skills: ['fastapi-patterns'],
  },
  {
    id: 'vitest',
    name: 'Vitest',
    packages: ['vitest'],
    skills: ['vitest-testing'],
  },
  {
    id: 'playwright',
    name: 'Playwright',
    packages: ['@playwright/test', 'playwright'],
    skills: ['playwright-e2e'],
  },
  {
    id: 'docker',
    name: 'Docker',
    packages: [],
    skills: ['docker-patterns'],
  },
];

/**
 * Skill content templates for each stack skill.
 */
const SKILL_CONTENT: Record<string, string> = {
  'react-patterns': `Follow React best practices when working with React components.

Rules:
- Use functional components exclusively (no class components)
- Extract custom hooks for shared logic (prefix with "use")
- Use React.memo() only when profiling proves re-render cost
- Prefer composition over inheritance
- Co-locate component files: Component.tsx, Component.test.tsx, Component.module.css
- Use TypeScript generics for reusable components
- Keep components under 150 lines — extract sub-components if larger
- Event handlers: handleX naming (handleClick, handleSubmit)
- Never mutate state directly — use immutable updates`,

  'component-design': `When creating React components, follow this structure:

1. Types/interfaces at the top
2. Component function
3. Hooks (useState, useEffect, custom)
4. Event handlers
5. Render helpers (if needed)
6. Return JSX

Always include:
- TypeScript props interface (exported)
- Default props where sensible
- Error boundaries for complex components
- Loading and error states
- Accessibility: aria-labels, role attributes, keyboard handlers`,

  'nextjs-app-router': `Follow Next.js App Router conventions.

Rules:
- Server Components by default — add 'use client' only when needed
- Data fetching in Server Components, not client-side useEffect
- Use loading.tsx, error.tsx, not-found.tsx for each route segment
- Metadata via generateMetadata() or static metadata export
- Route handlers in route.ts files (GET, POST, PUT, DELETE exports)
- Use next/image for all images (automatic optimization)
- Use next/link for all internal navigation
- Middleware in middleware.ts at project root
- Parallel routes and intercepting routes for complex UIs`,

  'nextjs-server-components': `Understand the Server/Client Component boundary in Next.js.

Server Components (default):
- Can directly access databases, file system, environment variables
- Cannot use hooks (useState, useEffect), browser APIs, or event handlers
- Import from 'server-only' to prevent accidental client inclusion

Client Components ('use client'):
- Required for: interactivity, hooks, browser APIs, event handlers
- Keep them small — push logic to server components
- Pass server data as props, don't re-fetch on client

Pattern: Server Component wrapper → Client Component leaf
Never: Client Component importing Server Component directly`,

  'typescript-strict': `Enforce TypeScript strict mode conventions.

Rules:
- strict: true in tsconfig.json (non-negotiable)
- Never use \`any\` — use \`unknown\` and narrow with type guards
- Prefer interfaces for object shapes, types for unions/intersections
- Use const assertions for literal types: \`as const\`
- Exhaustive switch checks with \`never\` default
- Prefer \`readonly\` for immutable data
- Use template literal types for string patterns
- Generic constraints: \`<T extends Base>\` not \`<T>\`
- Avoid type assertions (\`as\`) — use type guards instead
- Export types separately: \`export type { MyType }\``,

  'prisma-patterns': `Follow Prisma ORM best practices.

Rules:
- Single PrismaClient instance (singleton pattern in src/lib/db.ts)
- Always use transactions for multi-table writes
- Select only needed fields: \`select: { id: true, name: true }\`
- Use \`include\` sparingly — prefer explicit joins
- Never modify migration files — create new ones
- Use \`@default(uuid())\` for primary keys
- Add \`createdAt\` and \`updatedAt\` to every model
- Index foreign keys and frequently-queried fields
- Use Prisma middleware for audit logging
- Seed data in prisma/seed.ts`,

  'tailwind-patterns': `Follow Tailwind CSS conventions.

Rules:
- Use Tailwind utility classes, not custom CSS
- Extract repeated patterns into components, not @apply
- Use tailwind.config.ts for theme customization
- Design tokens: extend theme, don't override
- Responsive: mobile-first (sm:, md:, lg:)
- Dark mode: class strategy with \`dark:\` variant
- Consistent spacing scale: use Tailwind's default
- Group related utilities: layout → spacing → typography → visual`,

  'express-patterns': `Follow Express.js best practices.

Rules:
- Middleware chain: error handling LAST
- Use express.json() and express.urlencoded() for body parsing
- Validate all inputs with Zod/Joi before processing
- Error handler middleware: (err, req, res, next) signature
- Use helmet() for security headers
- Use cors() with explicit origin configuration
- Use morgan/pino-http for request logging
- Route organization: /api/v1/ prefix, resource-based
- Async route handlers: wrap with try/catch or express-async-errors`,

  'fastapi-patterns': `Follow FastAPI best practices.

Rules:
- Use Pydantic models for all request/response schemas
- Dependency injection via Depends() for shared logic
- Use async def for I/O-bound routes, def for CPU-bound
- Exception handlers for custom error responses
- Use BackgroundTasks for non-blocking operations
- APIRouter for route organization (router per resource)
- Use lifespan context manager for startup/shutdown
- Type hints on everything — FastAPI uses them for validation
- Use HTTPException with appropriate status codes`,

  'vitest-testing': `Follow Vitest testing conventions.

Rules:
- Test files: *.test.ts or *.spec.ts
- Describe blocks for grouping, it() for individual tests
- One assertion focus per test (multiple expects OK if related)
- Use vi.mock() for module mocking, vi.fn() for function mocks
- Prefer vi.spyOn() over full mocks when possible
- Setup/teardown: beforeEach/afterEach, not beforeAll
- Test naming: "should <expected behavior> when <condition>"
- Coverage: aim for 80% lines, focus on critical paths
- Avoid testing implementation details — test behavior`,

  'playwright-e2e': `Follow Playwright E2E testing conventions.

Rules:
- Page Object Model for complex pages
- Use data-testid attributes for selectors (not CSS classes)
- Auto-wait is default — avoid explicit waits
- Use expect(page).toHaveURL() for navigation assertions
- Test user flows, not individual components
- Use test.describe() for grouping related flows
- Screenshots on failure (automatic in CI)
- Use fixtures for shared setup (authentication, data)
- Run tests in CI with --workers=1 for stability`,

  'docker-patterns': `Follow Docker and containerization best practices.

Rules:
- Multi-stage builds to minimize image size
- Non-root user in final stage (USER node / USER appuser)
- .dockerignore to exclude node_modules, .git, .env
- Pin base image versions (node:20-slim, not node:latest)
- COPY package*.json first, then npm ci (layer caching)
- Use HEALTHCHECK instruction
- One process per container
- Environment variables via docker-compose.yml, not Dockerfile
- Use docker-compose for local dev (db, cache, app)`,
};

/**
 * Detect which technologies are in the project and return matching skills.
 */
export function detectProjectSkills(projectDir: string): { id: string; name: string; skills: string[] }[] {
  const pkg = readPackageJson(projectDir);
  const allDeps = pkg
    ? { ...(pkg.dependencies as Record<string, string> ?? {}), ...(pkg.devDependencies as Record<string, string> ?? {}) }
    : {};

  const detected: { id: string; name: string; skills: string[] }[] = [];

  for (const mapping of STACK_SKILLS) {
    const found = mapping.packages.some((p) => p in allDeps);
    // Special case: docker detection by file
    if (mapping.id === 'docker' && existsSync(join(projectDir, 'Dockerfile'))) {
      detected.push(mapping);
      continue;
    }
    if (found) {
      detected.push(mapping);
    }
  }

  return detected;
}

/**
 * Install auto-detected skills as .claude/commands/*.md files.
 * Returns the list of installed skill filenames.
 */
export function installAutoSkills(
  projectDir: string,
  options: { force?: boolean; verbose?: boolean } = {}
): { installed: string[]; skipped: string[] } {
  const commandsDir = join(projectDir, '.claude', 'commands');
  mkdirSync(commandsDir, { recursive: true });

  const installed: string[] = [];
  const skipped: string[] = [];

  // Install universal skills
  for (const skill of UNIVERSAL_SKILLS) {
    const filePath = join(commandsDir, skill.filename);
    if (existsSync(filePath) && !options.force) {
      skipped.push(skill.filename);
      continue;
    }
    writeFileSync(filePath, skill.content, 'utf-8');
    installed.push(skill.filename);
  }

  // Detect and install stack-specific skills
  const detected = detectProjectSkills(projectDir);

  for (const tech of detected) {
    for (const skillId of tech.skills) {
      const content = SKILL_CONTENT[skillId];
      if (!content) continue;

      const filename = `${skillId}.md`;
      const filePath = join(commandsDir, filename);

      if (existsSync(filePath) && !options.force) {
        skipped.push(filename);
        continue;
      }

      writeFileSync(filePath, content, 'utf-8');
      installed.push(filename);
    }
  }

  return { installed, skipped };
}

/**
 * Try running autoskills from npm if available, falls back to built-in skills.
 */
export function tryExternalAutoskills(projectDir: string): boolean {
  try {
    execSync('npx autoskills --help', {
      stdio: 'pipe',
      timeout: 10_000,
      cwd: projectDir,
    });
    // autoskills is available, run it
    execSync('npx autoskills -y', {
      stdio: 'inherit',
      timeout: 60_000,
      cwd: projectDir,
    });
    return true;
  } catch {
    return false;
  }
}
