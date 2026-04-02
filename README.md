# vibe-init-cli

[![CI](https://github.com/vishalm/vibe-init/actions/workflows/ci.yml/badge.svg)](https://github.com/vishalm/vibe-init/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vibe-init-cli.svg)](https://www.npmjs.com/package/vibe-init-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/vibe-init-cli.svg)](https://www.npmjs.com/package/vibe-init-cli)

> **Your entire engineering team in one CLI.** Scaffold new projects. Analyze existing ones. Inject features. Score health. Ship with confidence. Powered by Claude AI.

[Documentation](https://vishalm.github.io/vibe-init) · [GitHub](https://github.com/vishalm/vibe-init) · [Report Bug](https://github.com/vishalm/vibe-init/issues) · [Request Feature](https://github.com/vishalm/vibe-init/issues)

---

## Why vibe-init?

Most scaffolding tools generate a starter template and leave you alone. **vibe-init is different** — it's a project intelligence platform that works on **any codebase** (greenfield or brownfield) across the entire project lifecycle:

| Phase | Command | What it does |
|-------|---------|-------------|
| **Create** | `vibe init` | Scaffold a production-ready project from a plain-English idea |
| **Analyze** | `vibe scan` | Detect stack, framework, and missing best practices |
| **Enhance** | `vibe add <feature>` | Inject features (Docker, CI, tests, logging, etc.) |
| **Score** | `vibe doctor` | Grade project health A+ through F with fix suggestions |
| **Code** | `vibe run <task>` | Execute coding tasks with Claude + full project context |
| **Advise** | `vibe ask <question>` | Ask Claude about your project (read-only) |

---

## Install

```bash
npm install -g vibe-init-cli
```

After installation, the `vibe` command is available globally:

```bash
vibe --help
vibe --version
```

### Prerequisites

| Requirement | Purpose | Required? | Install |
|------------|---------|-----------|---------|
| **Node.js 20+** | Runtime | Yes | [nodejs.org](https://nodejs.org) |
| **Claude CLI** | AI commands (`init`, `run`, `ask`) | For AI features | `npm i -g @anthropic-ai/claude-code` |
| **ANTHROPIC_API_KEY** | Faster batch generation (falls back to Claude CLI) | Optional | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **Docker** | Local dev stack | Optional | [docker.com](https://docker.com) |

> **Zero API keys needed** for `vibe scan`, `vibe add`, and `vibe doctor` — they use pure filesystem analysis.

---

## Quick Start

### New Project (Greenfield)

```bash
# 1. Scaffold a project from an idea
vibe init
# → Describe your idea → Claude enriches it → 25+ production files generated

# 2. Enter the project and start developing
cd my-project
make setup    # Install deps, start Docker, run migrations
make dev      # Start Next.js dev server
```

### Existing Project (Brownfield)

```bash
cd my-existing-app

# 1. Scan to understand what you have and what's missing
vibe scan

# 2. Add missing features one-by-one
vibe add docker          # Dockerfile + docker-compose
vibe add ci              # GitHub Actions pipeline
vibe add testing         # Vitest + sample tests
vibe add logging         # Pino structured logging

# 3. Check your project health score
vibe doctor              # Get a letter grade (A+ through F)
```

---

## Commands

### `vibe init` — Scaffold from an Idea

Walks you through an interactive 4-phase flow:

1. **Ignition** — Describe your idea in 1-5 sentences
2. **Enrichment** — Claude generates personas, prioritized features (P0/P1/P2), architecture
3. **ADR** — Architecture Decision Record auto-generated
4. **Scaffold** — 25+ production files written to a new directory

```bash
vibe init                    # Interactive flow
vibe --dry-run init          # Preview files without writing
vibe --verbose init          # Debug output
```

**Generated stack:** Next.js 15 (App Router) · TypeScript (strict) · Prisma · PostgreSQL · Redis · Docker · GitHub Actions CI · Vitest · Pino logging · Zod validation · Husky hooks · Commitlint

### `vibe scan [dir]` — Analyze Any Project

Pure filesystem detection — no API calls, no external dependencies.

```bash
vibe scan                        # Scan current directory
vibe scan /path/to/project       # Scan specific directory
vibe scan --generate-claude-md   # Also generate a CLAUDE.md
```

**Detects stacks:** Next.js, FastAPI, Go (Gin/Echo/Fiber/Chi), Node.js (Express/Fastify/NestJS/Hono)

**Checks 10 practices:** Docker · CI/CD · Testing · Linting · Env Validation · Logging · Health Checks · Git Hooks · Security · Documentation

### `vibe add <feature>` — Inject Features

Idempotent and stack-aware. Safe to run multiple times.

```bash
# Template-based features (instant, no API key needed)
vibe add docker          # Dockerfile + docker-compose.yml
vibe add ci              # GitHub Actions CI pipeline
vibe add testing         # Vitest config + sample test
vibe add logging         # Pino (Node) or structlog (Python)
vibe add validation      # Zod environment validation
vibe add health          # /api/health endpoint
vibe add hooks           # Husky + commitlint + lint-staged
vibe add auth            # Authentication setup guidance
vibe add db              # Prisma schema + client

# Claude-powered generators (require Claude CLI)
vibe add api users       # Generate REST API endpoint + test
vibe add component Card  # Generate React component + test
vibe add model Order     # Generate Prisma model + migration
```

### `vibe doctor` — Health Score

17 weighted checks across 7 categories. Suggests `vibe add` commands to fix gaps.

```bash
vibe doctor              # Run health checks
vibe --verbose doctor    # Show detailed results
```

| Category | Weight | Checks |
|----------|--------|--------|
| Testing | 20 pts | Framework config, test files, coverage |
| Security | 20 pts | .gitignore, no leaked secrets, env validation |
| CI/CD | 15 pts | Pipeline config, runs tests |
| Code Quality | 15 pts | Linter, TypeScript strict, git hooks |
| Containerization | 10 pts | Dockerfile, Docker Compose |
| Documentation | 10 pts | README, CLAUDE.md |
| Observability | 10 pts | Structured logging, health endpoint |

**Grades:** A+ (95+) · A (90-94) · A- (85-89) · B+ (80-84) · B (75-79) · B- (70-74) · C+ (65-69) · C (60-64) · C- (55-59) · D (40-54) · F (0-39)

### `vibe run <task>` — Code with Context

Spawns Claude Code with your project's CLAUDE.md as system context.

```bash
vibe run "add pagination to the users API endpoint"
vibe run "refactor auth middleware for role-based access control"
vibe run "write integration tests for the checkout flow"
vibe run "add Redis caching to the product listing with 5-minute TTL"
```

### `vibe ask <question>` — Advisory Mode

Read-only — Claude analyzes but makes no changes.

```bash
vibe ask "should I use Redis for sessions or stick with JWT?"
vibe ask "what are the security risks in the current auth setup?"
vibe ask "which endpoints might have N+1 query problems?"
vibe ask "what's the best approach to add multi-tenancy?"
```

---

## Project Architecture

```
vibe-init/
├── src/
│   ├── index.ts                    # CLI entry (Commander.js) + extensive help
│   ├── commands/                   # 6 command handlers (init, scan, add, doctor, run, ask)
│   ├── phases/                     # Init phases (ignition → enrichment → ADR → scaffold)
│   ├── analyzers/                  # 14 pure filesystem detectors
│   │   ├── stack-detectors/        # Next.js, FastAPI, Go, Node.js
│   │   └── practice-detectors/     # Docker, CI, testing, linting, security, etc.
│   ├── features/                   # 12 pluggable feature modules
│   │   ├── docker/ci/testing/...   # 9 template-based
│   │   └── api/component/model/    # 3 Claude-powered generators
│   ├── scoring/                    # Doctor health scoring engine
│   ├── claude/                     # Claude CLI + API wrappers + prompt builders
│   ├── templates/stacks/           # EJS templates organized by stack
│   ├── types/                      # TypeScript interfaces
│   ├── ui/                         # Terminal UI (banner, spinner, prompts, reports)
│   └── utils/                      # Errors, filesystem, Zod validation
├── tests/                          # 43 unit tests (Vitest)
├── docs/                           # GitHub Pages documentation site
└── scripts/build.js                # esbuild bundler + template copier
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| CLI Framework | [Commander.js](https://github.com/tj/commander.js) |
| Interactive Prompts | [Inquirer](https://github.com/SBoudrias/Inquirer.js) |
| Template Engine | [EJS](https://ejs.co) |
| Validation | [Zod](https://zod.dev) |
| AI (Interactive) | [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) |
| AI (Batch) | [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-node) |
| Build | [esbuild](https://esbuild.github.io) |
| Tests | [Vitest](https://vitest.dev) |
| UI | [Chalk](https://github.com/chalk/chalk) + [Ora](https://github.com/sindresorhus/ora) |

---

## Development

```bash
git clone https://github.com/vishalm/vibe-init.git
cd vibe-init
npm install

npm run build        # Build with esbuild
npm run lint         # TypeScript type check
npm run test         # Run all 43 tests
npm run dev          # Watch mode for development

# Run locally without installing globally
node build/index.js --help
node build/index.js init
node build/index.js scan .
node build/index.js doctor
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit with [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
4. Push to your branch and open a Pull Request

See the [GitHub Issues](https://github.com/vishalm/vibe-init/issues) for planned features and known bugs.

## License

[MIT](LICENSE) — free for personal and commercial use.

---

<p align="center">
  Built by <a href="https://github.com/vishalm">Vishal Mishra</a> with <a href="https://claude.ai">Claude</a><br>
  <sub>The last CLI you'll ever need.</sub>
</p>
