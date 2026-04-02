# vibe-init-cli

[![CI](https://github.com/vishalm/vibe-init/actions/workflows/ci.yml/badge.svg)](https://github.com/vishalm/vibe-init/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vibe-init-cli.svg)](https://www.npmjs.com/package/vibe-init-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/vibe-init-cli.svg)](https://www.npmjs.com/package/vibe-init-cli)

> **The vibe coding framework CLI.** Prepare the room. Build with AI. Ship with confidence. Powered by Claude.

[Documentation](https://vishalm.github.io/vibe-init) · [GitHub](https://github.com/vishalm/vibe-init) · [Report Bug](https://github.com/vishalm/vibe-init/issues) · [Request Feature](https://github.com/vishalm/vibe-init/issues)

---

## Why vibe-init?

Most scaffolding tools generate a starter template and leave you alone. **vibe-init is different** — it's a vibe coding framework that prepares your project for successful AI-assisted development, then builds it with full context:

| Phase | Command | What it does |
|-------|---------|-------------|
| **Prepare** | `vibe init` | Set up the vibe coding framework (CLAUDE.md, skills, guardrails) |
| **Build** | `vibe build` | Describe your idea → Claude builds it using the framework |
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
| **Claude CLI** | AI commands (`init`, `build`, `run`, `ask`) | For AI features | `npm i -g @anthropic-ai/claude-code` |
| **ANTHROPIC_API_KEY** | Faster batch generation (falls back to Claude CLI) | Optional | [console.anthropic.com](https://console.anthropic.com/settings/keys) |

> **Zero API keys needed** for `vibe scan`, `vibe add`, and `vibe doctor` — they use pure filesystem analysis.

---

## Quick Start

### The Vibe Coding Workflow

```bash
# Step 1: Prepare the room — generates CLAUDE.md, skills, guardrails
mkdir my-app && cd my-app
vibe init

# Step 2: Build — describe your idea, Claude builds it
vibe build

# Step 3: Continue building with context
vibe run "add pagination to the users API"

# Step 4: Check health
vibe doctor
```

### Existing Project (Brownfield)

```bash
cd my-existing-app

# Analyze and generate the vibe framework
vibe init

# Add missing features
vibe add docker
vibe add ci
vibe add testing

# Check health score
vibe doctor
```

---

## Commands

### `vibe init` — Prepare the Room

Sets up the vibe coding framework for your project. Generates everything Claude needs to code effectively:

- **CLAUDE.md** — Comprehensive coding instructions, conventions, guardrails
- **.claude/commands/** — Custom skills (test, lint, build, review, commit, add-feature)
- **.claude/settings.json** — Permissions and safety guardrails
- **docs/adr/** — Architecture Decision Record template
- **.gitignore** — Stack-appropriate ignores

```bash
vibe init                    # Interactive setup
vibe --dry-run init          # Preview files without writing
```

For **greenfield** projects: asks your stack preference (Next.js, Express, FastAPI, Go).
For **brownfield** projects: scans your codebase and generates framework from analysis.

### `vibe build` — Build from Your Idea

Takes your idea through enrichment, generates an ADR, then spawns Claude Code to build the project using your CLAUDE.md as the coding bible.

```bash
vibe build                   # Interactive build flow
```

**Requires `vibe init` first** (CLAUDE.md must exist). The flow:

1. **Enrichment** — Describe your idea → Claude generates personas, features (P0/P1/P2), architecture
2. **ADR** — Architecture Decision Record auto-generated
3. **Build** — Claude Code builds the project following CLAUDE.md conventions

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
```

**Grades:** A+ (95+) · A (90-94) · A- (85-89) · B+ (80-84) · B (75-79) · B- (70-74) · C+ (65-69) · C (60-64) · C- (55-59) · D (40-54) · F (0-39)

### `vibe run <task>` — Code with Context

Spawns Claude Code with your project's CLAUDE.md as system context.

```bash
vibe run "add pagination to the users API endpoint"
vibe run "refactor auth middleware for role-based access control"
vibe run "write integration tests for the checkout flow"
```

### `vibe ask <question>` — Advisory Mode

Read-only — Claude analyzes but makes no changes.

```bash
vibe ask "should I use Redis for sessions or stick with JWT?"
vibe ask "what are the security risks in the current auth setup?"
```

---

## Development

```bash
git clone https://github.com/vishalm/vibe-init.git
cd vibe-init
npm install

npm run build        # Build with esbuild
npm run lint         # TypeScript type check
npm run test         # Run all tests
npm run dev          # Watch mode for development

# Run locally without installing globally
node build/index.js --help
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit with [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
4. Push to your branch and open a Pull Request

## License

[MIT](LICENSE) — free for personal and commercial use.

---

<p align="center">
  Built by <a href="https://github.com/vishalm">Vishal Mishra</a> with <a href="https://claude.ai">Claude</a><br>
  <sub>The vibe coding framework CLI.</sub>
</p>
