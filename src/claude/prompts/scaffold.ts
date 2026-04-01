import type { EnrichmentBrief } from '../../types/enrichment.js';

export function buildReadmePrompt(
  brief: EnrichmentBrief,
  projectName: string,
  projectSlug: string
): string {
  return `Generate a README.md for a new project. Respond with ONLY the raw markdown content.

PROJECT: ${projectName}
SLUG: ${projectSlug}
VISION: ${brief.vision}
PROBLEM: ${brief.problemStatement}
ARCHITECTURE: ${brief.architecturePattern}
TECH STACK:
- Frontend: ${brief.techStack.frontend}
- Backend: ${brief.techStack.backend}
- Database: ${brief.techStack.database}
- Cache: ${brief.techStack.cache}
- Auth: ${brief.techStack.auth}

P0 FEATURES: ${brief.features.p0.map((f) => `${f.name}: ${f.description}`).join('\n')}

Include these sections:
1. Project title + one-line description + badges (build, coverage, license)
2. Architecture overview with a Mermaid diagram (flowchart showing key components)
3. Prerequisites (Node.js 20+, Docker, PostgreSQL)
4. Quick Start (clone, install, setup env, docker compose up, dev server)
5. Project Structure (brief directory overview)
6. Development (how to run tests, lint, build)
7. API Endpoints (list the key routes with methods)
8. Deployment (Docker build + deploy)
9. Contributing (link to CONTRIBUTING.md)
10. License (MIT)

Keep it practical and scannable. No fluff.`;
}

export function buildClaudeMdPrompt(
  brief: EnrichmentBrief,
  projectName: string,
  projectSlug: string
): string {
  return `Generate a CLAUDE.md file — this is an AI coding instructions file that tells Claude Code how to work within this specific codebase. Respond with ONLY the raw markdown content.

PROJECT: ${projectName}
SLUG: ${projectSlug}
VISION: ${brief.vision}
ARCHITECTURE: ${brief.architecturePattern}
TECH STACK:
- Frontend: ${brief.techStack.frontend}
- Backend: ${brief.techStack.backend}
- Database: ${brief.techStack.database}
- Cache: ${brief.techStack.cache}
- Auth: ${brief.techStack.auth}
- Testing: ${brief.techStack.testing}

P0 FEATURES: ${brief.features.p0.map((f) => f.name).join(', ')}

Include these sections:
# Project: ${projectName}

## Architecture Overview
[Brief description of the architecture and key components]

## Tech Stack (Locked)
[List the exact versions/tools — Claude should not change these without asking]

## Directory Structure
[Key directories and what goes where]

## Coding Standards
- TypeScript strict mode
- Functions ≤ 20 lines
- No magic numbers
- Zod for all validation
- Prisma for all DB access
- Pino for all logging (structured JSON)

## API Design Rules
- REST with /api/ prefix
- Zod input validation on every endpoint
- Consistent error response format: { error: string, code: string }
- Health check at /api/health

## Database Conventions
- snake_case table names
- UUID primary keys
- created_at/updated_at on every table
- Prisma migrations for all schema changes

## Testing Strategy
- Vitest for all tests
- Unit tests co-located or in __tests__/
- Integration tests test full API routes
- Test coverage target: 80%

## Things Claude Should Never Change
- Database migration files (create new ones instead)
- .env files (only .env.example)
- package-lock.json manually

## Common Tasks
\`\`\`bash
make dev          # Start development server
make test         # Run all tests
make lint         # Run linter
make build        # Production build
make db-migrate   # Run database migrations
make db-seed      # Seed database
make docker-up    # Start all services
make docker-down  # Stop all services
\`\`\`

Keep it concise and actionable.`;
}
