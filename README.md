# vibe-init

[![CI](https://github.com/vishalm/vibe-init/actions/workflows/ci.yml/badge.svg)](https://github.com/vishalm/vibe-init/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vibe-init.svg)](https://www.npmjs.com/package/vibe-init)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Your entire engineering team in one CLI.** Scaffold new projects. Analyze existing ones. Inject features. Score health. Powered by Claude AI.

[Documentation](https://vishalm.github.io/vibe-init) | [npm](https://www.npmjs.com/package/vibe-init) | [GitHub](https://github.com/vishalm/vibe-init)

---

## What is vibe-init?

vibe-init is a project intelligence CLI that works on **any codebase** — greenfield or brownfield. It uses Claude AI for intelligent scaffolding and generation, and pure filesystem analysis for detection and scoring.

```
$ vibe init          # Scaffold a new project from an idea
$ vibe scan          # Analyze any existing project
$ vibe add docker    # Inject features into any project
$ vibe doctor        # Score project health (A+ through F)
$ vibe run "task"    # Code with Claude + project context
$ vibe ask "question" # Ask Claude about your project
```

## Install

```bash
npm install -g vibe-init
```

### Prerequisites

| Requirement | Purpose | Install |
|------------|---------|---------|
| Node.js 20+ | Runtime | [nodejs.org](https://nodejs.org) |
| Claude CLI | AI commands (init, run, ask) | `npm install -g @anthropic-ai/claude-code` |
| ANTHROPIC_API_KEY | ADR + doc generation | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| Docker | Local dev (optional) | [docker.com](https://docker.com) |

> **Note:** `vibe scan` and `vibe doctor` work without any API key — they use pure filesystem analysis.

## Quick Start

### New Project (Greenfield)

```bash
vibe init
# Describe your idea → Claude enriches it → scaffolds 25+ production files
cd my-project && make setup && make dev
```

### Existing Project (Brownfield)

```bash
cd my-existing-app
vibe scan                    # Detect stack + find gaps
vibe add docker              # Add Dockerfile + docker-compose
vibe add ci                  # Add GitHub Actions CI
vibe add testing             # Add Vitest + sample tests
vibe doctor                  # Check your score
```

## Commands

### `vibe init`

Scaffold a new full-stack project from a plain-English idea.

```bash
vibe init                    # Interactive enrichment flow
vibe --dry-run init          # Preview without writing files
```

**What gets generated:**
- Next.js 15 (App Router) + TypeScript (strict mode)
- Prisma ORM + PostgreSQL schema + seed script
- Docker Compose (Postgres + Redis)
- Multi-stage Dockerfile
- GitHub Actions CI pipeline
- Vitest test suite + health check test
- Pino structured JSON logging
- Zod input + environment validation
- Security middleware (headers, request IDs)
- Husky pre-commit hooks + Commitlint
- CLAUDE.md + Architecture Decision Record
- Makefile for developer ergonomics

### `vibe scan [dir]`

Analyze any existing project — detect stack, framework, and missing best practices.

```bash
vibe scan                        # Scan current directory
vibe scan /path/to/project       # Scan specific directory
vibe scan --generate-claude-md   # Generate a CLAUDE.md from analysis
```

**Detects:**
- **Stacks:** Next.js, FastAPI, Go, Node.js (Express, Fastify, NestJS, etc.)
- **Practices:** Docker, CI/CD, Testing, Linting, Env Validation, Logging, Health Checks, Git Hooks, Security, Documentation

### `vibe add <feature>`

Inject production features into any project. Idempotent — safe to run twice.

```bash
# Template-based (instant, no API needed)
vibe add docker          # Dockerfile + docker-compose.yml
vibe add ci              # GitHub Actions CI pipeline
vibe add testing         # Vitest config + sample test
vibe add logging         # Pino (Node) or structlog (Python)
vibe add validation      # Zod environment validation
vibe add health          # /api/health endpoint
vibe add hooks           # Husky + commitlint + lint-staged
vibe add auth            # Authentication setup guidance
vibe add db              # Prisma schema + client

# Claude-powered generators
vibe add api users       # Generate API endpoint + test
vibe add component Card  # Generate React component + test
vibe add model Order     # Generate Prisma model + migration
```

### `vibe doctor`

Score your project against 17 engineering best practices across 7 categories.

```bash
vibe doctor              # Run health checks
vibe --verbose doctor    # Show detailed results
```

**Categories:** Testing (20pts), Security (20pts), CI/CD (15pts), Code Quality (15pts), Containerization (10pts), Documentation (10pts), Observability (10pts)

**Grades:** A+ (95+) → A → A- → B+ → B → B- → C+ → C → C- → D → F (0-39)

### `vibe run <task>`

Execute a coding task with Claude Code, enriched with your project's CLAUDE.md context.

```bash
vibe run "add pagination to the users API endpoint"
vibe run "refactor auth middleware for RBAC"
vibe run "write integration tests for the checkout flow"
```

### `vibe ask <question>`

Ask Claude about your project in read-only advisory mode. No files are changed.

```bash
vibe ask "should I use Redis for session storage or JWT?"
vibe ask "what are the security risks in the current auth implementation?"
vibe ask "which endpoints are likely to have N+1 query problems?"
```

## Architecture

```
vibe-init/
├── src/
│   ├── index.ts                    # CLI entry (Commander.js)
│   ├── commands/                   # 6 command handlers
│   ├── phases/                     # Init phases (ignition, enrichment, ADR, scaffold, scan)
│   ├── analyzers/                  # 14 filesystem detectors
│   │   ├── stack-detectors/        # Next.js, FastAPI, Go, Node.js
│   │   └── practice-detectors/     # Docker, CI, testing, security, etc.
│   ├── features/                   # 12 pluggable feature modules
│   │   ├── docker/                 # vibe add docker
│   │   ├── ci/                     # vibe add ci
│   │   ├── testing/                # vibe add testing
│   │   └── ...                     # logging, validation, health, hooks, auth, db, api, component, model
│   ├── scoring/                    # Doctor health scoring engine
│   ├── claude/                     # Claude CLI + API wrappers + prompt builders
│   ├── templates/stacks/           # EJS templates per stack
│   ├── types/                      # TypeScript interfaces
│   ├── ui/                         # Terminal UI (banner, spinner, prompts, reports)
│   └── utils/                      # Errors, filesystem, validation
├── tests/                          # 43 unit tests (Vitest)
├── docs/                           # GitHub Pages site
└── build/                          # Compiled output
```

## Development

```bash
git clone https://github.com/vishalm/vibe-init.git
cd vibe-init
npm install
npm run build        # Build with esbuild
npm run lint         # TypeScript type check
npm run test         # Run all tests
npm run dev          # Watch mode
```

## How It Works

### Greenfield (`vibe init`)

1. **Ignition** — You describe your idea in plain English
2. **Enrichment** — Claude generates personas, features (P0/P1/P2), architecture
3. **ADR** — Architecture Decision Record auto-generated
4. **Scaffold** — 25+ production files written from EJS templates + Claude docs

### Brownfield (`vibe scan` + `vibe add` + `vibe doctor`)

1. **Scan** — Pure filesystem detection: stack, framework, missing practices
2. **Add** — Inject features one by one, idempotent and stack-aware
3. **Doctor** — Score against 17 checks, get a letter grade and fix suggestions

## Tech Stack

| Component | Technology |
|-----------|-----------|
| CLI Framework | Commander.js |
| Interactive Prompts | Inquirer |
| Template Engine | EJS |
| Validation | Zod |
| AI (Interactive) | Claude CLI |
| AI (Batch) | Anthropic SDK |
| Build | esbuild |
| Tests | Vitest |
| UI | Chalk + Ora |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
4. Push and open a PR

## License

MIT - see [LICENSE](LICENSE)

---

Built by [Vishal Mishra](https://github.com/vishalm) with Claude.
