import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { runCommand } from './commands/run.js';
import { askCommand } from './commands/ask.js';
import { scanCommand } from './commands/scan.js';
import { addCommand } from './commands/add.js';
import { doctorCommand } from './commands/doctor.js';
import { theme } from './ui/theme.js';
import type { CLIConfig } from './types/config.js';

const VERSION = '0.2.1';

const MAIN_HELP = `
${theme.brand('╔══════════════════════════════════════════════════════════╗')}
${theme.brand('║')}  🔥 ${theme.bold('VIBE INIT')} — The last CLI you'll ever need           ${theme.brand('║')}
${theme.brand('║')}     Scaffold production-ready projects using Claude AI   ${theme.brand('║')}
${theme.brand('╚══════════════════════════════════════════════════════════╝')}

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe init                        ${theme.dim('Interactive project scaffolding')}
  ${theme.brand('$')} vibe run "add user auth"          ${theme.dim('Run a coding task with Claude')}
  ${theme.brand('$')} vibe ask "how does routing work?"  ${theme.dim('Ask Claude about your project')}
  ${theme.brand('$')} vibe scan .                       ${theme.dim('Scan a project for stack & practices')}
  ${theme.brand('$')} vibe add docker                   ${theme.dim('Add a feature module to your project')}
  ${theme.brand('$')} vibe doctor                       ${theme.dim('Score project health and get fix suggestions')}

${theme.heading('GLOBAL OPTIONS')}

  ${theme.info('-v, --verbose')}    Show detailed output, debug info, and Claude prompts
  ${theme.info('--dry-run')}        Preview generated files without writing to disk
  ${theme.info('-V, --version')}    Print version number
  ${theme.info('-h, --help')}       Show this help message

${theme.heading('COMMANDS')}

  ${theme.brand('init')}             Scaffold a new full-stack project from a plain-English idea
  ${theme.brand('run')} <task>       Execute a coding task with Claude using project context
  ${theme.brand('ask')} <question>   Ask Claude a read-only question about your project
  ${theme.brand('scan')} [dir]       Scan an existing project and detect stack, practices, and gaps
  ${theme.brand('add')} <feature>   Add a feature module (docker, ci, testing, logging, etc.)
  ${theme.brand('doctor')}           Score project health and suggest improvements

${theme.heading('PREREQUISITES')}

  ${theme.label('1.')} Claude CLI installed     ${theme.dim('npm install -g @anthropic-ai/claude-code')}
  ${theme.label('2.')} Anthropic API key set    ${theme.dim('export ANTHROPIC_API_KEY=sk-ant-...')}
  ${theme.label('3.')} Node.js 20+              ${theme.dim('https://nodejs.org')}
  ${theme.label('4.')} Docker (optional)        ${theme.dim('For local Postgres + Redis via docker-compose')}

${theme.heading('QUICKSTART')}

  ${theme.dim('# Install vibe-init globally')}
  ${theme.brand('$')} npm install -g vibe-init

  ${theme.dim('# Scaffold a new project')}
  ${theme.brand('$')} vibe init

  ${theme.dim('# Enter your project and start developing')}
  ${theme.brand('$')} cd my-project && make setup && make dev

  ${theme.dim('# Later: ask Claude about your codebase')}
  ${theme.brand('$')} vibe ask "what is the best way to add caching?"

  ${theme.dim('# Or run a task with full project context')}
  ${theme.brand('$')} vibe run "add pagination to the users API endpoint"

${theme.heading('GENERATED PROJECT STRUCTURE')}

  ${theme.dim('Every scaffolded project includes:')}
  ${theme.success('✔')} Next.js 15 (App Router) + TypeScript (strict)
  ${theme.success('✔')} Prisma ORM + PostgreSQL schema + seed script
  ${theme.success('✔')} Docker Compose (Postgres + Redis)
  ${theme.success('✔')} Multi-stage Dockerfile for production
  ${theme.success('✔')} GitHub Actions CI (lint, test, build)
  ${theme.success('✔')} Vitest test suite with health check test
  ${theme.success('✔')} Pino structured JSON logging
  ${theme.success('✔')} Zod input validation + environment validation
  ${theme.success('✔')} Security middleware (CSRF, headers, request IDs)
  ${theme.success('✔')} Husky pre-commit hooks + Commitlint
  ${theme.success('✔')} CLAUDE.md — AI coding instructions tailored to your project
  ${theme.success('✔')} ADR — Architecture Decision Record
  ${theme.success('✔')} Makefile with developer ergonomics

${theme.heading('EXAMPLES')}

  ${theme.dim('# Scaffold with dry-run to preview files')}
  ${theme.brand('$')} vibe --dry-run init

  ${theme.dim('# Verbose mode for debugging')}
  ${theme.brand('$')} vibe --verbose init

  ${theme.dim('# Run a complex refactor')}
  ${theme.brand('$')} vibe run "refactor the auth middleware to support role-based access control"

  ${theme.dim('# Ask an architecture question')}
  ${theme.brand('$')} vibe ask "should I add Redis caching to the users endpoint? What are the tradeoffs?"

${theme.heading('LEARN MORE')}

  Documentation:  ${theme.info('https://vishalm.github.io/vibe-init')}
  GitHub:         ${theme.info('https://github.com/vishalm/vibe-init')}
  Report issues:  ${theme.info('https://github.com/vishalm/vibe-init/issues')}
`;

const INIT_HELP = `
${theme.brand('vibe init')} — Scaffold a new full-stack project from an idea

${theme.heading('DESCRIPTION')}

  The init command walks you through an interactive 4-phase flow:

  ${theme.label('Phase 0 — Ignition')}
    Shows the Vibe Init banner and prompts you for your product idea.
    Write 1-5 sentences describing what you want to build.

  ${theme.label('Phase 1 — Enrichment')}
    Claude analyzes your idea and generates a structured brief:
    • Vision statement and problem statement
    • 2-3 user personas with pain points and goals
    • Prioritized feature set (P0 must-have / P1 should-have / P2 nice-to-have)
    • Tech stack recommendation (locked to Next.js + Prisma + PostgreSQL for V1)
    • Architecture pattern (Monolith or Modular Monolith)
    • Monetization hypothesis and go-to-market signal

    You review the brief and choose:
      ${theme.success('[Y]')} Accept — proceed to scaffolding
      ${theme.warning('[E]')} Edit — provide feedback to refine the brief
      ${theme.error('[R]')} Restart — start over with a new idea

  ${theme.label('Phase 2 — Architecture Decision Record')}
    An ADR is auto-generated documenting:
    • Architecture decision and rationale
    • Alternatives considered
    • Trade-offs and consequences
    • 12-Factor App compliance mapping
    • Security threat model stub

  ${theme.label('Phase 3 — Scaffold')}
    25+ production-ready files are generated and written to a new directory.
    Includes app code, API routes, database schema, tests, Docker, CI/CD, and docs.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe init
  ${theme.brand('$')} vibe --dry-run init        ${theme.dim('Preview without writing files')}
  ${theme.brand('$')} vibe --verbose init         ${theme.dim('Show debug output')}

${theme.heading('OPTIONS')}

  ${theme.info('--dry-run')}    Show the list of files that would be created without writing them
  ${theme.info('--verbose')}    Show debug info including Claude prompts and raw responses

${theme.heading('ENVIRONMENT')}

  ${theme.info('ANTHROPIC_API_KEY')}   Required for ADR and documentation generation (Anthropic API)
                       If not set, ADR generation is skipped with a warning.
                       Get your key: ${theme.dim('https://console.anthropic.com/settings/keys')}

  ${theme.info('Claude CLI')}          Required. Must be installed and on your PATH.
                       Install: ${theme.dim('npm install -g @anthropic-ai/claude-code')}

${theme.heading('EXAMPLES')}

  ${theme.dim('# Basic usage — interactive flow')}
  ${theme.brand('$')} vibe init
  ${theme.dim('> A marketplace for freelance chefs to offer home-cooked meals')}

  ${theme.dim('# Preview what would be generated')}
  ${theme.brand('$')} vibe --dry-run init
  ${theme.dim('> An AI-powered code review tool for GitHub PRs')}

  ${theme.dim('# With verbose output for debugging')}
  ${theme.brand('$')} ANTHROPIC_API_KEY=sk-ant-... vibe --verbose init

${theme.heading('GENERATED FILES')}

  ${theme.dim('Root:')}        package.json, tsconfig.json, next.config.ts, .env.example,
               .gitignore, docker-compose.yml, Dockerfile, Makefile,
               vitest.config.ts, commitlint.config.js

  ${theme.dim('App:')}         src/app/layout.tsx, src/app/page.tsx,
               src/app/api/health/route.ts, src/lib/db.ts,
               src/lib/logger.ts, src/lib/env.ts, src/middleware.ts

  ${theme.dim('Database:')}    prisma/schema.prisma, prisma/seed.ts

  ${theme.dim('Tests:')}       __tests__/health.test.ts, __tests__/setup.ts

  ${theme.dim('CI/CD:')}       .github/workflows/ci.yml

  ${theme.dim('Docs:')}        README.md, CLAUDE.md, docs/adr/001-initial-architecture.md

  ${theme.dim('Git hooks:')}   .husky/pre-commit
`;

const RUN_HELP = `
${theme.brand('vibe run')} <task> — Execute a coding task with Claude

${theme.heading('DESCRIPTION')}

  Spawns Claude Code with your project's full context injected as a system prompt.
  Claude reads your CLAUDE.md file to understand your architecture, conventions,
  tech stack, and coding standards — then executes the task you describe.

  Claude can:
  • Add features, refactor code, fix bugs
  • Create new API endpoints, components, or services
  • Write tests alongside code changes
  • Update documentation and CHANGELOG

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe run <task>
  ${theme.brand('$')} vibe --verbose run <task>

${theme.heading('ARGUMENTS')}

  ${theme.info('<task>')}   A plain-English description of what you want Claude to do.
            Wrap in quotes if it contains spaces (which it almost always will).

${theme.heading('CONTEXT INJECTION')}

  Before spawning Claude, vibe run:
    1. Reads ${theme.info('CLAUDE.md')} from the current directory
    2. Builds a system prompt with your project's architecture, standards, and patterns
    3. Passes your task as the user prompt
    4. Hands control to Claude Code in interactive mode

  ${theme.warning('Tip:')} Always run vibe run from your project root (where CLAUDE.md lives).

${theme.heading('EXAMPLES')}

  ${theme.dim('# Add a new feature')}
  ${theme.brand('$')} vibe run "add pagination to the users API endpoint with cursor-based pagination"

  ${theme.dim('# Fix a bug')}
  ${theme.brand('$')} vibe run "fix the race condition in the order processing webhook handler"

  ${theme.dim('# Refactor')}
  ${theme.brand('$')} vibe run "extract the email sending logic into a reusable service module"

  ${theme.dim('# Write tests')}
  ${theme.brand('$')} vibe run "write integration tests for the checkout API including edge cases"

  ${theme.dim('# Add a new API endpoint')}
  ${theme.brand('$')} vibe run "create a POST /api/users endpoint with Zod validation and Prisma"

  ${theme.dim('# Database changes')}
  ${theme.brand('$')} vibe run "add soft deletes to the orders table with a new Prisma migration"

  ${theme.dim('# Performance')}
  ${theme.brand('$')} vibe run "add Redis caching to the product listing endpoint with 5-minute TTL"

  ${theme.dim('# Documentation')}
  ${theme.brand('$')} vibe run "update the README with the new API endpoints we added this week"

${theme.heading('EXIT CODES')}

  ${theme.success('0')}   Claude completed successfully
  ${theme.error('1')}   Error (Claude CLI not found, missing CLAUDE.md, or Claude error)
`;

const ASK_HELP = `
${theme.brand('vibe ask')} <question> — Ask Claude about your project (read-only)

${theme.heading('DESCRIPTION')}

  Ask Claude a question about your project without making any changes.
  Claude reads your CLAUDE.md and responds in advisory mode only.
  No files are modified — this is pure analysis and recommendation.

  Use this for:
  • Architecture decisions and trade-off analysis
  • Understanding existing code and patterns
  • Debugging hypotheses ("why might X be happening?")
  • Planning before implementation
  • Getting a second opinion on an approach

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe ask <question>
  ${theme.brand('$')} vibe --verbose ask <question>

${theme.heading('ARGUMENTS')}

  ${theme.info('<question>')}   A plain-English question about your project.
                Wrap in quotes.

${theme.heading('EXAMPLES')}

  ${theme.dim('# Architecture advice')}
  ${theme.brand('$')} vibe ask "should I use Redis for session storage or stick with JWT?"

  ${theme.dim('# Code understanding')}
  ${theme.brand('$')} vibe ask "how does the authentication middleware work in this project?"

  ${theme.dim('# Debugging')}
  ${theme.brand('$')} vibe ask "why might the health check return degraded when postgres is running?"

  ${theme.dim('# Planning')}
  ${theme.brand('$')} vibe ask "what is the best approach to add multi-tenancy to this codebase?"

  ${theme.dim('# Performance')}
  ${theme.brand('$')} vibe ask "which API endpoints are likely to have N+1 query problems?"

  ${theme.dim('# Security')}
  ${theme.brand('$')} vibe ask "what are the security risks in the current auth implementation?"

  ${theme.dim('# Trade-off analysis')}
  ${theme.brand('$')} vibe ask "should I add GraphQL or stick with REST for the public API?"

  ${theme.dim('# Testing strategy')}
  ${theme.brand('$')} vibe ask "what test coverage gaps exist in the current test suite?"

${theme.heading('DIFFERENCE FROM vibe run')}

  ${theme.brand('vibe run')}  → Claude ${theme.success('can modify files')} — use for coding tasks
  ${theme.brand('vibe ask')}  → Claude ${theme.warning('cannot modify files')} — use for questions and advice
`;

const SCAN_HELP = `
${theme.brand('vibe scan')} [dir] — Scan an existing project for stack, practices, and gaps

${theme.heading('DESCRIPTION')}

  Analyzes an existing project directory using pure filesystem detection:
  • Detects the project stack (Next.js, FastAPI, Go, Node.js)
  • Checks for 10 engineering practices (Docker, CI, tests, linting, etc.)
  • Reports a score and actionable recommendations
  • Optionally generates a CLAUDE.md tailored to the detected project

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe scan                           ${theme.dim('Scan current directory')}
  ${theme.brand('$')} vibe scan /path/to/project           ${theme.dim('Scan a specific directory')}
  ${theme.brand('$')} vibe scan --generate-claude-md       ${theme.dim('Scan and generate CLAUDE.md')}
  ${theme.brand('$')} vibe --dry-run scan --generate-claude-md  ${theme.dim('Preview without writing')}

${theme.heading('OPTIONS')}

  ${theme.info('--generate-claude-md')}  Generate a CLAUDE.md file via Claude API (requires ANTHROPIC_API_KEY)
  ${theme.info('--dry-run')}             Preview results without writing files
  ${theme.info('--verbose')}             Show raw analysis data

${theme.heading('DETECTED PRACTICES')}

  ${theme.success('+')} Docker          ${theme.dim('Dockerfile, docker-compose.yml')}
  ${theme.success('+')} CI/CD           ${theme.dim('GitHub Actions, GitLab CI, CircleCI')}
  ${theme.success('+')} Testing         ${theme.dim('Vitest, Jest, pytest, Go tests')}
  ${theme.success('+')} Linting         ${theme.dim('ESLint, Biome, flake8, golangci-lint')}
  ${theme.success('+')} Env Validation  ${theme.dim('Zod schemas, dotenv-safe, Pydantic')}
  ${theme.success('+')} Logging         ${theme.dim('Pino, Winston, structlog, slog')}
  ${theme.success('+')} Health Check    ${theme.dim('/health or /api/health endpoints')}
  ${theme.success('+')} Git Hooks       ${theme.dim('Husky, pre-commit, lefthook')}
  ${theme.success('+')} Security        ${theme.dim('.gitignore with .env exclusion')}
  ${theme.success('+')} Documentation   ${theme.dim('README.md, CLAUDE.md, docs/adr/')}
`;

const program = new Command();

program
  .name('vibe')
  .description('The last CLI you\'ll ever need — scaffolds production-ready projects using Claude')
  .version(VERSION)
  .option('-v, --verbose', 'Enable verbose output', false)
  .option('--dry-run', 'Preview what would be generated without writing files', false)
  .addHelpText('after', MAIN_HELP)
  .helpOption('-h, --help', 'Show detailed help with examples');

program
  .command('init')
  .description('Scaffold a new full-stack project from an idea')
  .addHelpText('after', INIT_HELP)
  .action(async () => {
    const opts = program.opts();
    const config: CLIConfig = {
      verbose: opts.verbose ?? false,
      dryRun: opts.dryRun ?? false,
    };
    await initCommand(config);
  });

program
  .command('run <task>')
  .description('Run a task with Claude Code using your project context')
  .addHelpText('after', RUN_HELP)
  .action(async (task: string) => {
    const opts = program.opts();
    const config: CLIConfig = {
      verbose: opts.verbose ?? false,
      dryRun: false,
    };
    await runCommand(task, config);
  });

program
  .command('ask <question>')
  .description('Ask Claude a question about your project (read-only)')
  .addHelpText('after', ASK_HELP)
  .action(async (question: string) => {
    const opts = program.opts();
    const config: CLIConfig = {
      verbose: opts.verbose ?? false,
      dryRun: false,
    };
    await askCommand(question, config);
  });

program
  .command('scan [dir]')
  .description('Scan an existing project for stack, practices, and gaps')
  .option('--generate-claude-md', 'Generate a CLAUDE.md file via Claude API', false)
  .addHelpText('after', SCAN_HELP)
  .action(async (dir: string | undefined, cmdOpts: { generateClaudeMd: boolean }) => {
    const opts = program.opts();
    await scanCommand(dir ?? '.', {
      verbose: opts.verbose ?? false,
      dryRun: opts.dryRun ?? false,
      generateClaudeMd: cmdOpts.generateClaudeMd,
    });
  });

const ADD_HELP = `
${theme.brand('vibe add')} <feature> — Add a feature module to your project

${theme.heading('DESCRIPTION')}

  Adds production-ready feature modules to an existing project.
  Template features write files directly. Generator features use Claude.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe add <feature> [args...]
  ${theme.brand('$')} vibe add docker                ${theme.dim('Add Dockerfile + docker-compose.yml')}
  ${theme.brand('$')} vibe add ci                    ${theme.dim('Add GitHub Actions CI workflow')}
  ${theme.brand('$')} vibe add testing               ${theme.dim('Add Vitest setup + sample test')}
  ${theme.brand('$')} vibe add api users             ${theme.dim('Generate a users API endpoint via Claude')}
  ${theme.brand('$')} vibe add component UserCard    ${theme.dim('Generate a React component via Claude')}
  ${theme.brand('$')} vibe add --force docker        ${theme.dim('Overwrite existing files')}

${theme.heading('TEMPLATE FEATURES')}

  ${theme.info('docker')}       Dockerfile + docker-compose.yml (Node, Python, Go)
  ${theme.info('ci')}           GitHub Actions CI (lint, test, build)
  ${theme.info('testing')}      Vitest config + sample test + setup
  ${theme.info('logging')}      Pino (Node) or structlog (Python) logger
  ${theme.info('validation')}   Zod-based environment validation
  ${theme.info('health')}       Health check API endpoint
  ${theme.info('hooks')}        Husky pre-commit + commitlint
  ${theme.info('auth')}         Authentication setup guidance
  ${theme.info('db')}           Prisma schema + client setup

${theme.heading('GENERATOR FEATURES')}  ${theme.dim('(require Claude CLI)')}

  ${theme.info('api')} <name>        Generate REST API endpoint + test
  ${theme.info('component')} <name>  Generate React component + test
  ${theme.info('model')} <name>      Generate Prisma model + migration
`;

const DOCTOR_HELP = `
${theme.brand('vibe doctor')} — Score project health and suggest improvements

${theme.heading('DESCRIPTION')}

  Runs 17 health checks across 7 categories to evaluate your project.
  Calculates a weighted score and letter grade (A+ through F).
  Suggests \`vibe add\` commands to fix detected gaps.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe doctor                    ${theme.dim('Run health checks in current directory')}
  ${theme.brand('$')} vibe --verbose doctor           ${theme.dim('Show detailed check results')}

${theme.heading('CATEGORIES')}

  ${theme.info('Testing')}          Test framework, test files, coverage config
  ${theme.info('CI/CD')}            Pipeline configuration
  ${theme.info('Containerization')} Dockerfile, Docker Compose
  ${theme.info('Security')}         Env validation, auth, .gitignore
  ${theme.info('Code Quality')}     Git hooks, TypeScript, linter
  ${theme.info('Documentation')}    README.md, CLAUDE.md
  ${theme.info('Observability')}    Logging, health endpoint, database ORM

${theme.heading('GRADING SCALE')}

  ${theme.success('A+ (95+)')}  ${theme.success('A (90-94)')}  ${theme.success('A- (85-89)')}
  ${theme.info('B+ (80-84)')}  ${theme.info('B (75-79)')}  ${theme.info('B- (70-74)')}
  ${theme.warning('C+ (65-69)')}  ${theme.warning('C (60-64)')}  ${theme.warning('C- (55-59)')}
  ${theme.error('D (40-54)')}   ${theme.error('F (0-39)')}
`;

program
  .command('add <feature> [args...]')
  .description('Add a feature module to your project')
  .option('--force', 'Overwrite existing files', false)
  .addHelpText('after', ADD_HELP)
  .action(async (feature: string, args: string[], cmdOpts: { force: boolean }) => {
    const opts = program.opts();
    await addCommand(feature, args, {
      verbose: opts.verbose ?? false,
      dryRun: opts.dryRun ?? false,
      force: cmdOpts.force,
    });
  });

program
  .command('doctor')
  .description('Score project health and suggest improvements')
  .addHelpText('after', DOCTOR_HELP)
  .action(async () => {
    const opts = program.opts();
    const config: CLIConfig = {
      verbose: opts.verbose ?? false,
      dryRun: false,
    };
    await doctorCommand(config);
  });

// Error handling
program.exitOverride();

async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      // Commander exit codes (help, version) — not real errors
      const code = (error as { code: string }).code;
      if (code === 'commander.helpDisplayed' || code === 'commander.version') {
        process.exit(0);
      }
    }

    console.error(
      theme.error('\n💥 Unexpected error:'),
      error instanceof Error ? error.message : String(error)
    );

    if (program.opts().verbose && error instanceof Error && error.stack) {
      console.error(theme.dim(error.stack));
    }

    process.exit(1);
  }
}

main();
