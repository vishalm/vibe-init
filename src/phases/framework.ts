import { existsSync, readdirSync } from 'node:fs';
import { analyzeProject } from '../analyzers/detector.js';
import { callAnthropicApi } from '../claude/api.js';
import { withSpinner } from '../ui/spinner.js';
import { theme } from '../ui/theme.js';
import {
  CODEGRAPH_MCP_PERMISSIONS,
  CODEGRAPH_SKILL,
  injectCodegraphSection,
} from '../skills/codegraph.js';
import {
  GRAPHIFY_SKILL,
  injectGraphifySection,
} from '../skills/graphify.js';
import type { RenderedFile } from '../types/template.js';
import type { ProjectAnalysis } from '../types/analysis.js';

export interface FrameworkOptions {
  projectDir: string;
  projectName: string;
  stack: string;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Detects whether a directory is greenfield (empty/new) or brownfield (existing project).
 */
export function detectProjectType(dir: string): 'greenfield' | 'brownfield' {
  if (!existsSync(dir)) return 'greenfield';
  const entries = readdirSync(dir).filter((e) => !e.startsWith('.git') || e === '.gitignore');
  // If only dotfiles or nothing, it's greenfield
  return entries.length <= 1 ? 'greenfield' : 'brownfield';
}

/**
 * Generates the vibe coding framework — CLAUDE.md, skills, guardrails, ADR template.
 * This is the primary output of `vibe init`.
 */
export async function generateFramework(options: FrameworkOptions): Promise<RenderedFile[]> {
  const { projectDir, projectName, stack, verbose } = options;
  const projectType = detectProjectType(projectDir);

  let analysis: ProjectAnalysis | null = null;
  if (projectType === 'brownfield') {
    analysis = await withSpinner('Analyzing existing project...', async () => {
      return analyzeProject(projectDir);
    });
    if (verbose) {
      console.log(theme.dim(`  Detected stack: ${analysis.stack.framework} (${analysis.stack.language})`));
      console.log(theme.dim(`  Practices found: ${analysis.practices.filter((p) => p.detected).length}/${analysis.practices.length}`));
    }
  }

  // Generate CLAUDE.md via Claude (context-aware for brownfield, stack-specific for greenfield)
  const claudeMdBase = await withSpinner('Generating CLAUDE.md...', async () => {
    const prompt = buildClaudeMdFrameworkPrompt(projectName, stack, projectType, analysis);
    return callAnthropicApi(prompt, { maxTokens: 6000, temperature: 0.3 });
  });
  // Always append the CodeGraph and Graphify guidance blocks — deterministic,
  // marker-fenced, and safe for the upstream installers to update later
  // (idempotent on re-run).
  const claudeMd = injectGraphifySection(injectCodegraphSection(claudeMdBase));

  // Generate project skills for Claude Code
  const skills = generateSkills(stack);

  // Generate Claude Code settings
  const settings = generateSettings();

  // Generate ADR template
  const adrTemplate = generateAdrTemplate(projectName);

  // Generate .gitignore (greenfield only)
  const files: RenderedFile[] = [
    { path: 'CLAUDE.md', content: claudeMd },
    { path: '.claude/commands/test.md', content: skills.test },
    { path: '.claude/commands/lint.md', content: skills.lint },
    { path: '.claude/commands/build.md', content: skills.build },
    { path: '.claude/commands/commit.md', content: skills.commit },
    { path: '.claude/commands/review.md', content: skills.review },
    { path: '.claude/commands/add-feature.md', content: skills.addFeature },
    { path: '.claude/commands/codegraph.md', content: CODEGRAPH_SKILL },
    { path: '.claude/commands/graphify.md', content: GRAPHIFY_SKILL },
    { path: '.claude/settings.json', content: settings },
    { path: 'docs/adr/000-template.md', content: adrTemplate },
  ];

  // Only add .gitignore for greenfield projects (don't overwrite existing)
  if (projectType === 'greenfield') {
    files.push({ path: '.gitignore', content: generateGitignore(stack) });
  }

  return files;
}

// ── Prompt builders ─────────────────────────────────────────────

function buildClaudeMdFrameworkPrompt(
  projectName: string,
  stack: string,
  projectType: 'greenfield' | 'brownfield',
  analysis: ProjectAnalysis | null
): string {
  const brownfieldContext = analysis
    ? `
EXISTING PROJECT ANALYSIS:
- Detected Stack: ${analysis.stack.framework} (${analysis.stack.language})
- Package Manager: ${analysis.stack.packageManager}
- Practices Found: ${analysis.practices.filter((p) => p.detected).map((p) => p.detectorId).join(', ')}
- Practices Missing: ${analysis.missingPractices.join(', ')}
- Recommendations: ${analysis.recommendations.join('; ')}
`
    : '';

  return `Generate a comprehensive CLAUDE.md file for a ${projectType} project. This file is the primary instruction set for AI-assisted (vibe) coding with Claude Code. It must be thorough, opinionated, and actionable.

PROJECT: ${projectName}
STACK: ${stack}
TYPE: ${projectType}
${brownfieldContext}

The CLAUDE.md must include ALL of the following sections. Be specific and prescriptive — not generic. Tailor everything to the ${stack} stack.

Respond with ONLY the raw markdown content.

# ${projectName}

## Project Overview
[1-2 sentences: what this project is and its primary purpose]

## Tech Stack (Locked)
[List the exact technologies. Claude should NOT change these without explicit approval.]
- Framework, language, runtime version
- ORM, database, cache
- Testing framework
- Logging library
- Validation library
- Auth approach
- Deployment target

## Architecture
[Describe the architecture pattern — monolith, modular monolith, microservices, etc.]
[Key principles: separation of concerns, where business logic lives, data flow]

## Directory Structure
[Define the canonical directory layout. Be prescriptive about where things go.]
[Include src/, tests/, prisma/ (or equivalent), docs/, .github/, etc.]

## Coding Standards
[Be opinionated and specific to the stack]
- TypeScript strict mode (if applicable)
- Maximum function length
- Naming conventions (files, functions, variables, types)
- Import ordering
- No magic numbers / strings
- Error handling patterns
- Async/await patterns

## API Design Rules
[REST conventions, route naming, HTTP methods, status codes]
- Input validation approach
- Error response format (standardized)
- Authentication / authorization patterns
- Rate limiting approach
- Versioning strategy

## Database Conventions
[ORM usage, migration strategy, naming conventions]
- Table/column naming (snake_case, camelCase)
- Primary key strategy (UUID, auto-increment)
- Required fields on every table (created_at, updated_at)
- Soft deletes vs hard deletes
- Migration rules (never edit, always create new)
- Seeding strategy

## Testing Strategy
[Be thorough — testing is non-negotiable]
- Unit test approach and location
- Integration test approach
- E2E test approach (if applicable)
- Minimum coverage target (e.g., 80%)
- What MUST be tested (API endpoints, business logic, edge cases)
- What can be skipped (simple getters, framework boilerplate)
- Test naming conventions
- Mock strategy

## Security Guardrails
[Hardcoded rules Claude must always follow]
- Never commit secrets, API keys, or credentials
- Always validate and sanitize user input
- Use parameterized queries (never raw SQL)
- CORS configuration rules
- Authentication requirements for routes
- Rate limiting requirements
- CSRF protection approach

## Performance Guidelines
[Concrete rules, not vague advice]
- Database query optimization rules (avoid N+1)
- Caching strategy and TTL defaults
- Image/asset optimization approach
- Bundle size awareness
- Pagination requirements for list endpoints

## Git & Commit Conventions
- Conventional commits (feat:, fix:, docs:, chore:, test:, refactor:)
- Branch naming convention
- PR size guidelines
- What goes in one commit vs. multiple

## Things Claude Should NEVER Do
[Explicit prohibitions — be very clear]
- Never modify migration files (create new ones instead)
- Never edit .env files (only .env.example)
- Never modify package-lock.json / yarn.lock manually
- Never skip tests when adding features
- Never use \`any\` type (TypeScript)
- Never commit commented-out code
- Never add dependencies without justification

## Things Claude Should ALWAYS Do
[Explicit requirements]
- Run tests before considering work complete
- Add tests for new features
- Update types/interfaces when changing data structures
- Handle error cases explicitly
- Use the project's logging library (not console.log)
- Follow existing patterns in the codebase

## Common Tasks
\`\`\`bash
# Development
make dev          # Start development server
make test         # Run all tests
make lint         # Run linter + type check
make build        # Production build

# Database
make db-migrate   # Run migrations
make db-seed      # Seed database
make db-reset     # Reset database

# Docker
make docker-up    # Start all services
make docker-down  # Stop all services

# Quality
make check        # Run all checks (lint + test + build)
\`\`\``;
}

// ── Skill generators ────────────────────────────────────────────

interface Skills {
  test: string;
  lint: string;
  build: string;
  commit: string;
  review: string;
  addFeature: string;
}

function generateSkills(stack: string): Skills {
  const isNode = ['nextjs', 'node', 'typescript', 'react'].some((s) => stack.toLowerCase().includes(s));
  const isPython = stack.toLowerCase().includes('python') || stack.toLowerCase().includes('fastapi');
  const isGo = stack.toLowerCase().includes('go');

  const testCmd = isNode ? 'npm run test' : isPython ? 'pytest' : isGo ? 'go test ./...' : 'npm run test';
  const lintCmd = isNode ? 'npm run lint' : isPython ? 'ruff check . && mypy .' : isGo ? 'golangci-lint run' : 'npm run lint';
  const buildCmd = isNode ? 'npm run build' : isPython ? 'python -m build' : isGo ? 'go build ./...' : 'npm run build';

  return {
    test: `Run the test suite and report results.

Steps:
1. Run \`${testCmd}\`
2. If tests fail, analyze the failures
3. Report: total tests, passed, failed, coverage if available
4. If any tests fail, suggest fixes but do NOT auto-fix without asking

Do not modify test files unless explicitly asked.`,

    lint: `Run linting and type checking.

Steps:
1. Run \`${lintCmd}\`
2. If there are errors, categorize them (type errors, style issues, unused imports)
3. Report the total count and most critical issues
4. Auto-fix simple issues (unused imports, formatting) only if there are fewer than 5
5. For complex issues, report them and ask before fixing

Never disable lint rules to make errors go away.`,

    build: `Build the project for production.

Steps:
1. Run \`${lintCmd}\` first — do not build if lint fails
2. Run \`${testCmd}\` — do not build if tests fail
3. Run \`${buildCmd}\`
4. Report: build success/failure, output size, any warnings

If build fails, diagnose the root cause. Do not add workarounds.`,

    commit: `Create a well-formatted git commit.

Steps:
1. Run \`git status\` to see changes
2. Run \`git diff --staged\` to review staged changes
3. If nothing is staged, suggest what to stage based on logical change units
4. Write a conventional commit message:
   - feat: for new features
   - fix: for bug fixes
   - docs: for documentation changes
   - test: for test additions/changes
   - refactor: for code restructuring
   - chore: for maintenance tasks
5. Keep the first line under 72 characters
6. Add a body if the change is non-trivial
7. Show me the commit message and ask for approval before committing

Never use --no-verify. Never amend the previous commit unless explicitly asked.`,

    review: `Review the current changes for quality and correctness.

Steps:
1. Run \`git diff\` to see all uncommitted changes
2. Check each file for:
   - Logic errors or bugs
   - Missing error handling
   - Missing tests for new functionality
   - Security issues (hardcoded secrets, SQL injection, XSS)
   - DRY violations
   - Naming consistency
   - Type safety issues
3. Report findings organized by severity:
   - CRITICAL: Must fix before merging
   - WARNING: Should fix, but not blocking
   - SUGGESTION: Nice to have improvements
4. For each finding, explain WHY it's an issue and suggest a fix

Do not auto-fix anything. This is a read-only review.`,

    addFeature: `Add a new feature to the project following all conventions.

When adding a feature:
1. Read CLAUDE.md to understand project conventions
2. Create the implementation following existing patterns
3. Add input validation (Zod or equivalent)
4. Add error handling with proper status codes
5. Add tests (unit + integration where applicable)
6. Update types/interfaces as needed
7. Run lint and tests to verify nothing is broken
8. Summarize what was created and any follow-up tasks

Always follow the project's directory structure and naming conventions.
Never skip tests. Never use \`any\` types. Never hardcode values.`,
  };
}

// ── Settings generator ──────────────────────────────────────────

function generateSettings(): string {
  return JSON.stringify(
    {
      permissions: {
        allow: [
          'Read',
          'Glob',
          'Grep',
          'Bash(npm run test)',
          'Bash(npm run lint)',
          'Bash(npm run build)',
          'Bash(git status)',
          'Bash(git diff*)',
          'Bash(git log*)',
          ...CODEGRAPH_MCP_PERMISSIONS,
        ],
        deny: [
          'Bash(rm -rf *)',
          'Bash(git push --force*)',
          'Bash(git reset --hard*)',
        ],
      },
    },
    null,
    2
  );
}

// ── ADR template ────────────────────────────────────────────────

function generateAdrTemplate(projectName: string): string {
  return `# ADR {NUMBER}: {TITLE}

## Status
{Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Options Considered

### Option A: {Name}
- **Pros:** ...
- **Cons:** ...
- **Effort:** Low / Medium / High

### Option B: {Name}
- **Pros:** ...
- **Cons:** ...
- **Effort:** Low / Medium / High

### Option C: Do Nothing
- **Pros:** No effort, no risk
- **Cons:** Problem persists

## Consequences

### Positive
- ...

### Negative
- ...

### Risks
- ...

## Notes
- Date: {YYYY-MM-DD}
- Author: {name}
- Project: ${projectName}
`;
}

// ── Gitignore generator ─────────────────────────────────────────

function generateGitignore(stack: string): string {
  const base = `# Dependencies
node_modules/
vendor/
.venv/
__pycache__/

# Build
build/
dist/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Coverage
coverage/
.nyc_output/

# Docker
docker-compose.override.yml

# CodeGraph (semantic index — local cache, regenerable)
.codegraph/

# Graphify (knowledge graph — local cache & manifest; commit graph.json/GRAPH_REPORT.md)
graphify-out/cache/
graphify-out/manifest.json
graphify-out/cost.json
`;

  if (stack.toLowerCase().includes('go')) {
    return base + `\n# Go\n*.exe\n*.test\n*.out\n`;
  }
  if (stack.toLowerCase().includes('python')) {
    return base + `\n# Python\n*.pyc\n*.pyo\n*.egg-info/\ndist/\n.eggs/\n`;
  }
  return base;
}
