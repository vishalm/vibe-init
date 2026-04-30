import { Command } from 'commander';
import { execFileSync } from 'node:child_process';
import { initCommand } from './commands/init.js';
import { buildCommand } from './commands/build.js';
import { runCommand } from './commands/run.js';
import { askCommand } from './commands/ask.js';
import { scanCommand } from './commands/scan.js';
import { addCommand } from './commands/add.js';
import { doctorCommand } from './commands/doctor.js';
import { anchorCommand } from './commands/anchor.js';
import { codegraphCommand } from './commands/codegraph.js';
import { graphifyCommand } from './commands/graphify.js';
import { agentsCliCommand } from './commands/agents-cli.js';
import { theme } from './ui/theme.js';
import type { CLIConfig } from './types/config.js';
import { VERSION } from './version.js';
import { VibeError } from './utils/errors.js';

const MAIN_HELP = `
${theme.brand('╔══════════════════════════════════════════════════════════════╗')}
${theme.brand('║')}  🔥 ${theme.bold('VIBE INIT')} — Software Engineering Governance Engine      ${theme.brand('║')}
${theme.brand('║')}     59 policies · 10 categories · Agile Vibe Coding         ${theme.brand('║')}
${theme.brand('║')}     Context anchoring · Auto-skills · Powered by Claude AI  ${theme.brand('║')}
${theme.brand('╚══════════════════════════════════════════════════════════════╝')}

${theme.heading('COMMANDS')}

  ${theme.brand('init')}                  Generate governance framework (CLAUDE.md, 59 policies, auto-skills)
  ${theme.brand('build')}                 Describe your idea → Claude builds it with governance
  ${theme.brand('anchor')} [feature]      Create/view persistent feature context documents
  ${theme.brand('audit')} / ${theme.brand('doctor')}       Governance compliance audit (59 policies, 10 categories)
  ${theme.brand('scan')} [dir]            Scan project for stack, practices, and gaps
  ${theme.brand('add')} <feature>         Inject features (docker, ci, testing, logging, health, hooks, etc.)
  ${theme.brand('run')} <task>            Execute coding task with Claude + project context
  ${theme.brand('ask')} <question>        Ask Claude about your project (read-only)
  ${theme.brand('codegraph')} [args...]   Semantic code intelligence (wraps @colbymchenry/codegraph)
  ${theme.brand('graphify')} [args...]    Multi-modal knowledge graph (wraps ai-graphify / graphifyy)
  ${theme.brand('agents-cli')} [args...]  Build/eval/deploy ADK agents on Google Cloud (wraps google-agents-cli)

${theme.heading('THE GOVERNANCE WORKFLOW')}

  ${theme.label('Step 1:')} ${theme.brand('vibe init')}     Prepare the room
           ${theme.dim('CLAUDE.md + .vibe/policies/ (59 YAML) + .claude/commands/ (auto-skills)')}
  ${theme.label('Step 2:')} ${theme.info('vibe avc')}              Plan with Agile Vibe Coding ${theme.dim('(optional)')}
           ${theme.dim('Sponsor Call → Epics → Sprint Planning → Stories with traceability')}
  ${theme.label('Step 3:')} ${theme.brand('vibe build')}    Build from your idea
           ${theme.dim('Enrichment → ADR → Claude Code builds with governance context')}
  ${theme.label('Step 4:')} ${theme.brand('vibe anchor')}   Track decisions
           ${theme.dim('Persistent context docs: decisions, constraints, open questions')}
  ${theme.label('Step 5:')} ${theme.brand('vibe audit')}    Check compliance
           ${theme.dim('Security · Accessibility · Reliability · Performance · 12-Factor')}
           ${theme.dim('Clean Code · API · Data · Code Review · Observability')}

${theme.heading('QUICKSTART')}

  ${theme.dim('# New project')}
  ${theme.brand('$')} mkdir my-app && cd my-app
  ${theme.brand('$')} vibe init                           ${theme.dim('59 policies + auto-skills installed')}
  ${theme.brand('$')} vibe avc                            ${theme.dim('Sponsor Call → Epics → Sprint Planning')}
  ${theme.brand('$')} vibe build                          ${theme.dim('Describe idea → Claude builds it')}
  ${theme.brand('$')} vibe anchor "user authentication"   ${theme.dim('Anchor feature decisions')}
  ${theme.brand('$')} vibe audit                          ${theme.dim('Check governance compliance')}

  ${theme.dim('# Existing project')}
  ${theme.brand('$')} cd my-existing-app
  ${theme.brand('$')} vibe init                           ${theme.dim('Analyze project → generate framework')}
  ${theme.brand('$')} vibe audit                          ${theme.dim('10-category governance scorecard')}
  ${theme.brand('$')} vibe add docker && vibe add ci      ${theme.dim('Fix violations')}

${theme.heading('WHAT vibe init CREATES')}

  ${theme.success('✔')} CLAUDE.md                   AI coding instructions + conventions (incl. CodeGraph + Graphify blocks)
  ${theme.success('✔')} .vibe/policies/*.yaml       59 governance policies (Agent Governance Toolkit format)
  ${theme.success('✔')} .claude/commands/*.md        Auto-detected skills (React, Next.js, Prisma, codegraph, graphify, etc.)
  ${theme.success('✔')} .claude/settings.json        Permission guardrails (incl. codegraph MCP allow-list)
  ${theme.success('✔')} docs/adr/000-template.md     Architecture Decision Record template

${theme.heading('GOVERNANCE CATEGORIES')} ${theme.dim('(59 policies)')}

  ${theme.error('■')} Security (9)       ${theme.warning('■')} Accessibility (2)  ${theme.info('■')} Reliability (8)
  ${theme.success('■')} Performance (4)    ${theme.brand('■')} 12-Factor (7)      ${theme.bold('■')} Clean Code (10)
  ${theme.info('■')} API (5)            ${theme.warning('■')} Data (4)           ${theme.success('■')} Code Review (6)
  ${theme.dim('■')} Observability (4)

${theme.heading('PREREQUISITES')}

  ${theme.label('1.')} Claude CLI     ${theme.dim('npm install -g @anthropic-ai/claude-code')}
  ${theme.label('2.')} Node.js 20+    ${theme.dim('https://nodejs.org')}
  ${theme.label('3.')} API key        ${theme.dim('Optional — falls back to Claude CLI')}
  ${theme.label('4.')} AVC            ${theme.dim('npm install -g @agile-vibe-coding/avc  (optional — agile ceremonies)')}
  ${theme.label('5.')} CodeGraph      ${theme.dim('npm install -g @colbymchenry/codegraph  (optional — semantic code intelligence)')}
  ${theme.label('6.')} Graphify       ${theme.dim('uv tool install graphifyy           (optional — multi-modal knowledge graph; auto-installed by `vibe graphify`)')}
  ${theme.label('7.')} agents-cli     ${theme.dim('uvx google-agents-cli setup        (optional — Google ADK agents; auto-run via uvx by `vibe agents-cli`)')}

${theme.heading('LEARN MORE')}

  ${theme.info('https://vishalm.github.io/vibe-init')}
  ${theme.info('https://github.com/vishalm/vibe-init')}
  ${theme.info('https://agilevibecoding.org')}           ${theme.dim('Agile Vibe Coding Manifesto')}
`;

const INIT_HELP = `
${theme.brand('vibe init')} — Set up the governance framework

${theme.heading('DESCRIPTION')}

  Generates the full governance framework for AI-assisted coding:
  • CLAUDE.md — Comprehensive coding instructions and conventions
  • .vibe/policies/*.yaml — 59 governance policies (10 categories)
  • .claude/commands/*.md — Auto-detected skills (React, Next.js, Prisma, etc.)
  • .claude/settings.json — Permission guardrails
  • docs/adr/000-template.md — ADR template
  • .gitignore — Stack-appropriate ignores (greenfield only)

  ${theme.bold('Greenfield:')} generates fresh framework.
  ${theme.bold('Brownfield:')} scans codebase and generates framework from analysis.
  ${theme.bold('Auto-skills:')} detects your tech stack and installs matching Claude Code skills.
  ${theme.bold('Agile Vibe Coding:')} pair with ${theme.info('vibe avc')} for epics, stories, and sprint planning.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe init                  ${theme.dim('Interactive setup')}
  ${theme.brand('$')} vibe --dry-run init        ${theme.dim('Preview without writing files')}
`;

const BUILD_HELP = `
${theme.brand('vibe build')} — Build a project from your idea using the framework

${theme.heading('DESCRIPTION')}

  Takes your idea through enrichment (personas, features, architecture),
  generates an ADR and README, then spawns Claude Code to build the project
  using your CLAUDE.md framework as the coding bible.

  Requires ${theme.brand('vibe init')} to have been run first (CLAUDE.md must exist).
  For structured planning before building, run ${theme.info('vibe avc')} first (Sponsor Call → Sprint Planning).

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe build                 ${theme.dim('Interactive build flow')}
  ${theme.brand('$')} vibe --verbose build       ${theme.dim('Show debug output')}

${theme.heading('FLOW')}

  ${theme.label('Phase 1 — Enrichment')}
    Describe your idea → Claude generates personas, features, architecture

  ${theme.label('Phase 2 — ADR Generation')}
    Architecture Decision Record auto-generated

  ${theme.label('Phase 3 — Build')}
    Claude Code builds the project following CLAUDE.md conventions
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
  .description('Software engineering governance engine for AI-assisted coding')
  .version(VERSION)
  .option('-v, --verbose', 'Enable verbose output', false)
  .option('--dry-run', 'Preview what would be generated without writing files', false)
  .addHelpText('after', MAIN_HELP)
  .helpOption('-h, --help', 'Show detailed help with examples');

program
  .command('init')
  .description('Set up the vibe coding framework (CLAUDE.md, skills, guardrails)')
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
  .command('build')
  .description('Build a project from your idea using the vibe framework')
  .addHelpText('after', BUILD_HELP)
  .action(async () => {
    const opts = program.opts();
    const config: CLIConfig = {
      verbose: opts.verbose ?? false,
      dryRun: opts.dryRun ?? false,
    };
    await buildCommand(config);
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
${theme.brand('vibe doctor')} / ${theme.brand('vibe audit')} — Governance compliance audit

${theme.heading('DESCRIPTION')}

  Audits your project against governance policies across 10 categories.
  Includes traceability checks when paired with Agile Vibe Coding (avc).
  Policies have severity levels: block (mandatory), warn, info.
  Suggests fixes for violations.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe doctor                    ${theme.dim('Run governance audit')}
  ${theme.brand('$')} vibe audit                     ${theme.dim('Same command (alias)')}
  ${theme.brand('$')} vibe --verbose doctor           ${theme.dim('Show detailed results')}

${theme.heading('GOVERNANCE CATEGORIES')}

  ${theme.info('Security')}          Secrets, env validation, auth, input validation, ORM, lockfile
  ${theme.info('Accessibility')}     A11y linter, lang attribute, WCAG compliance
  ${theme.info('Reliability')}       Health endpoint, CI/CD, testing, error boundaries, graceful shutdown
  ${theme.info('Performance')}       Logging, bundle analysis, image optimization, containerization
  ${theme.info('Compliance')}        12-Factor App — VCS, deps, config, backing services, port binding
  ${theme.info('Clean Code')}        TypeScript strict, linter, formatter, git hooks, test coverage

${theme.heading('SEVERITY LEVELS')}

  ${theme.error('block')}   Mandatory — must be fixed before shipping
  ${theme.warning('warn')}    Should be fixed — impacts quality
  ${theme.dim('info')}    Nice to have — best practice recommendation
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

const doctorAction = async () => {
  const opts = program.opts();
  const config: CLIConfig = {
    verbose: opts.verbose ?? false,
    dryRun: false,
  };
  await doctorCommand(config);
};

program
  .command('doctor')
  .description('Audit project governance compliance')
  .addHelpText('after', DOCTOR_HELP)
  .action(doctorAction);

program
  .command('audit')
  .description('Audit project governance compliance (alias for doctor)')
  .action(doctorAction);

program
  .command('anchor [feature]')
  .description('Create or view feature context anchors for persistent decision tracking')
  .action(async (feature: string | undefined) => {
    const opts = program.opts();
    await anchorCommand(feature, {
      verbose: opts.verbose ?? false,
      dryRun: opts.dryRun ?? false,
    });
  });

const AVC_HELP = `
${theme.brand('vibe avc')} — Run Agile Vibe Coding ceremonies

${theme.heading('DESCRIPTION')}

  Launches the Agile Vibe Coding (AVC) CLI for structured, traceable
  AI-assisted development. Provides agile ceremonies adapted for vibe coding.

  Based on the ${theme.info('Agile Vibe Coding Manifesto')} (agilevibecoding.org).

${theme.heading('CEREMONIES')}

  ${theme.info('Sponsor Call')}      Define project vision, create epics with business context
  ${theme.info('Sprint Planning')}   Break epics into stories with acceptance criteria + traceability

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe avc                   ${theme.dim('Launch AVC interactive ceremonies')}

${theme.heading('INSTALL')}

  ${theme.brand('$')} npm install -g @agile-vibe-coding/avc
`;

// `vibe codegraph [...args]` — pass-through wrapper around @colbymchenry/codegraph.
// All args (including --help) are forwarded verbatim to the underlying CLI so
// users see the canonical codegraph help. If the CLI is missing, the wrapper
// auto-installs it globally (mirrors the `vibe avc` behavior).
program
  .command('codegraph [args...]')
  .description('Semantic code intelligence — wraps @colbymchenry/codegraph (auto-installs)')
  .allowUnknownOption(true)
  .helpOption(false)
  .action((args: string[] = []) => {
    codegraphCommand(args);
  });

const GRAPHIFY_HELP = `
${theme.brand('vibe graphify')} [args...] — Multi-modal knowledge graph (ai-graphify)

${theme.heading('DESCRIPTION')}

  Builds and queries a semantic knowledge graph of your project — code, docs,
  papers, images, audio, and video — and exports it as interactive HTML, queryable
  JSON, and a plain-language audit (${theme.info('graphify-out/GRAPH_REPORT.md')}).

  Wraps the upstream ${theme.info('graphifyy')} Python CLI. Auto-installs via
  ${theme.brand('uv')} → ${theme.brand('pipx')} → ${theme.brand('pip')} on first run.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe graphify .                          ${theme.dim('Build the graph for the current folder')}
  ${theme.brand('$')} vibe graphify --update                   ${theme.dim('Incremental refresh after edits')}
  ${theme.brand('$')} vibe graphify install                    ${theme.dim('Wire up always-on hooks for your AI assistant')}
  ${theme.brand('$')} vibe graphify query "show the auth flow" ${theme.dim('Pull a focused subgraph')}
  ${theme.brand('$')} vibe graphify path NodeA NodeB           ${theme.dim('Trace exact paths between two nodes')}
  ${theme.brand('$')} vibe graphify explain DigestAuth         ${theme.dim('Plain-language node description')}
  ${theme.brand('$')} vibe graphify stats                      ${theme.dim('One-glance summary of the graph')}
  ${theme.brand('$')} vibe graphify clone <github-url>         ${theme.dim('Clone a public repo and graph it')}
  ${theme.brand('$')} vibe graphify merge-graphs ...           ${theme.dim('Combine graphs across repos')}

${theme.heading('OUTPUT')}

  ${theme.success('+')} graphify-out/graph.html       ${theme.dim('Interactive graph (open in any browser)')}
  ${theme.success('+')} graphify-out/GRAPH_REPORT.md  ${theme.dim('God nodes, surprising connections, suggested questions')}
  ${theme.success('+')} graphify-out/graph.json       ${theme.dim('Persistent graph — query weeks later without re-reading')}
  ${theme.success('+')} graphify-out/cache/           ${theme.dim('SHA256 cache — re-runs only process changed files')}

${theme.heading('PAIRS WITH CODEGRAPH')}

  ${theme.brand('codegraph')}  → pure code (callers, callees, impact)
  ${theme.brand('graphify')}   → cross-modal (code + docs + papers + images + audio)

  Both can coexist in the same project. Use ${theme.brand('vibe graphify install')} to
  install always-on hooks so Claude reads ${theme.info('GRAPH_REPORT.md')} before searching files.

${theme.heading('LEARN MORE')}

  ${theme.info('https://github.com/safishamsi/graphify')}
`;

// `vibe graphify [...args]` — pass-through wrapper around the graphifyy PyPI CLI.
// All args (including --help) are forwarded verbatim so users see the canonical
// graphify help. If the binary is missing, the wrapper auto-installs via uv,
// pipx, or pip in that order (mirrors the `vibe codegraph` and `vibe avc`
// behavior).
program
  .command('graphify [args...]')
  .description('Multi-modal knowledge graph — wraps ai-graphify / graphifyy (auto-installs)')
  .allowUnknownOption(true)
  .helpOption(false)
  .addHelpText('after', GRAPHIFY_HELP)
  .action((args: string[] = []) => {
    graphifyCommand(args);
  });

const AGENTS_CLI_HELP = `
${theme.brand('vibe agents-cli')} [args...] — Google Agents CLI (ADK on Google Cloud)

${theme.heading('DESCRIPTION')}

  Pass-through wrapper around ${theme.info('google-agents-cli')}, the Python CLI
  that turns any coding assistant into an expert at creating, evaluating, and
  deploying ADK agents on Google Cloud (Gemini Enterprise Agent Platform).

  All args (including ${theme.brand('--help')}) are forwarded verbatim, so you
  always see the canonical agents-cli help and behavior.

  ${theme.bold('How it runs:')} prefers a globally installed ${theme.brand('agents-cli')} binary;
  if missing, falls back to ${theme.brand('uvx google-agents-cli')} (ephemeral, no global install).
  Requires ${theme.brand('uv')} on PATH for the fallback.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe agents-cli setup                ${theme.dim('Install agents-cli + skills into your coding agents')}
  ${theme.brand('$')} vibe agents-cli scaffold my-agent    ${theme.dim('Create a new ADK agent project')}
  ${theme.brand('$')} vibe agents-cli scaffold enhance     ${theme.dim('Add deploy / CI/CD / RAG to an existing project')}
  ${theme.brand('$')} vibe agents-cli scaffold upgrade     ${theme.dim('Upgrade project to a newer agents-cli version')}
  ${theme.brand('$')} vibe agents-cli run "prompt"         ${theme.dim('Run agent with a single prompt')}
  ${theme.brand('$')} vibe agents-cli eval run             ${theme.dim('Run agent evaluations')}
  ${theme.brand('$')} vibe agents-cli eval compare a b     ${theme.dim('Compare two eval result files')}
  ${theme.brand('$')} vibe agents-cli deploy               ${theme.dim('Deploy to Google Cloud (Agent Runtime / Cloud Run / GKE)')}
  ${theme.brand('$')} vibe agents-cli publish gemini-enterprise   ${theme.dim('Register with Gemini Enterprise')}
  ${theme.brand('$')} vibe agents-cli login --status       ${theme.dim('Show Google Cloud / AI Studio auth status')}
  ${theme.brand('$')} vibe agents-cli info                 ${theme.dim('Show project config and CLI version')}
  ${theme.brand('$')} vibe agents-cli --help               ${theme.dim('Full upstream help (passed through)')}

${theme.heading('PAIRS WITH VIBE-INIT')}

  ${theme.brand('vibe init')}        → governance framework, policies, CLAUDE.md
  ${theme.brand('vibe agents-cli')}  → scaffold + deploy ADK agents under that governance

${theme.heading('PREREQUISITES')}

  ${theme.label('•')} ${theme.brand('uv')}        ${theme.dim('curl -LsSf https://astral.sh/uv/install.sh | sh')}
  ${theme.label('•')} Python 3.11+, Node.js (for some agents-cli flows)
  ${theme.label('•')} Google Cloud project (for deploy / publish flows)

${theme.heading('LEARN MORE')}

  ${theme.info('https://github.com/google/agents-cli')}
  ${theme.info('https://google.github.io/agents-cli/')}
`;

// `vibe agents-cli [...args]` — pass-through wrapper around google-agents-cli.
// All args (including --help) are forwarded verbatim so users see the canonical
// agents-cli help. If the binary is missing, the wrapper falls back to
// `uvx google-agents-cli` (mirrors the upstream's recommended invocation).
program
  .command('agents-cli [args...]')
  .description('Google Agents CLI — wraps google-agents-cli (uvx fallback)')
  .allowUnknownOption(true)
  .helpOption(false)
  .addHelpText('after', AGENTS_CLI_HELP)
  .action((args: string[] = []) => {
    agentsCliCommand(args);
  });

program
  .command('avc')
  .description('Run Agile Vibe Coding ceremonies (epics, stories, sprint planning)')
  .addHelpText('after', AVC_HELP)
  .action(async () => {
    try {
      execFileSync('avc', { stdio: 'inherit', cwd: process.cwd() });
    } catch (error) {
      const isNotFound = error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (isNotFound) {
        console.log(theme.brand('\n📦 AVC CLI not found — installing @agile-vibe-coding/avc...\n'));
        try {
          execFileSync('npm', ['install', '-g', '@agile-vibe-coding/avc'], { stdio: 'inherit' });
          console.log(theme.success('\n✔ AVC installed successfully. Launching...\n'));
          execFileSync('avc', { stdio: 'inherit', cwd: process.cwd() });
        } catch (installError) {
          console.error(theme.error('\n💥 Failed to install AVC.'));
          console.error(`\n  Try manually:\n\n  ${theme.brand('$')} npm install -g @agile-vibe-coding/avc\n`);
          console.error(`  Learn more: ${theme.info('https://agilevibecoding.org')}\n`);
          process.exit(1);
        }
        return;
      }
      // Non-zero exit from avc — just forward the exit code
      const exitCode = error instanceof Error && 'status' in error ? (error as { status: number }).status : 1;
      process.exit(exitCode);
    }
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

    if (error instanceof VibeError) {
      console.error(theme.error('\n💥 Error:'), error.userMessage);
      if (program.opts().verbose && error.debugInfo) {
        console.error(theme.dim(`  Debug: ${error.debugInfo}`));
      }
    } else {
      console.error(
        theme.error('\n💥 Unexpected error:'),
        error instanceof Error ? error.message : String(error)
      );
    }

    if (program.opts().verbose && error instanceof Error && error.stack) {
      console.error(theme.dim(error.stack));
    }

    process.exit(1);
  }
}

main();
