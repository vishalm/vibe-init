import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { buildCommand } from './commands/build.js';
import { runCommand } from './commands/run.js';
import { askCommand } from './commands/ask.js';
import { scanCommand } from './commands/scan.js';
import { addCommand } from './commands/add.js';
import { doctorCommand } from './commands/doctor.js';
import { theme } from './ui/theme.js';
import type { CLIConfig } from './types/config.js';
import { VERSION } from './version.js';

const MAIN_HELP = `
${theme.brand('╔══════════════════════════════════════════════════════════╗')}
${theme.brand('║')}  🔥 ${theme.bold('VIBE INIT')} — The vibe coding framework CLI            ${theme.brand('║')}
${theme.brand('║')}     Prepare. Build. Ship. Powered by Claude AI.          ${theme.brand('║')}
${theme.brand('╚══════════════════════════════════════════════════════════╝')}

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe init                        ${theme.dim('Set up the vibe coding framework')}
  ${theme.brand('$')} vibe build                       ${theme.dim('Build a project from your idea + framework')}
  ${theme.brand('$')} vibe run "add user auth"          ${theme.dim('Run a coding task with Claude')}
  ${theme.brand('$')} vibe ask "how does routing work?"  ${theme.dim('Ask Claude about your project')}
  ${theme.brand('$')} vibe scan .                       ${theme.dim('Scan a project for stack & practices')}
  ${theme.brand('$')} vibe add docker                   ${theme.dim('Add a feature module to your project')}
  ${theme.brand('$')} vibe doctor                       ${theme.dim('Score project health and get fix suggestions')}

${theme.heading('COMMANDS')}

  ${theme.brand('init')}             Set up the vibe coding framework (CLAUDE.md, skills, guardrails)
  ${theme.brand('build')}            Build a project from your idea using the framework
  ${theme.brand('run')} <task>       Execute a coding task with Claude using project context
  ${theme.brand('ask')} <question>   Ask Claude a read-only question about your project
  ${theme.brand('scan')} [dir]       Scan an existing project and detect stack, practices, and gaps
  ${theme.brand('add')} <feature>   Add a feature module (docker, ci, testing, logging, etc.)
  ${theme.brand('doctor')}           Score project health and suggest improvements

${theme.heading('THE VIBE CODING WORKFLOW')}

  ${theme.label('Step 1:')} ${theme.brand('vibe init')}   — Prepare the room: CLAUDE.md, skills, guardrails, conventions
  ${theme.label('Step 2:')} ${theme.brand('vibe build')}  — Describe your idea, Claude builds it following the framework
  ${theme.label('Step 3:')} ${theme.brand('vibe run')}    — Continue building features with full project context
  ${theme.label('Step 4:')} ${theme.brand('vibe doctor')} — Check project health and fix gaps

${theme.heading('PREREQUISITES')}

  ${theme.label('1.')} Claude CLI installed     ${theme.dim('npm install -g @anthropic-ai/claude-code')}
  ${theme.label('2.')} Node.js 20+              ${theme.dim('https://nodejs.org')}
  ${theme.label('3.')} API key (optional)       ${theme.dim('export ANTHROPIC_API_KEY=sk-ant-... (faster, falls back to CLI)')}

${theme.heading('QUICKSTART')}

  ${theme.dim('# New project')}
  ${theme.brand('$')} mkdir my-app && cd my-app
  ${theme.brand('$')} vibe init              ${theme.dim('Set up framework (CLAUDE.md, skills, guardrails)')}
  ${theme.brand('$')} vibe build             ${theme.dim('Describe idea → Claude builds it')}

  ${theme.dim('# Existing project')}
  ${theme.brand('$')} cd my-existing-app
  ${theme.brand('$')} vibe init              ${theme.dim('Analyze project → generate framework')}
  ${theme.brand('$')} vibe run "add caching" ${theme.dim('Build with full context')}

${theme.heading('WHAT vibe init CREATES')}

  ${theme.success('✔')} CLAUDE.md — Comprehensive AI coding instructions
  ${theme.success('✔')} .claude/commands/ — Custom skills (test, lint, build, review, commit)
  ${theme.success('✔')} .claude/settings.json — Permissions and guardrails
  ${theme.success('✔')} docs/adr/ — Architecture Decision Record template
  ${theme.success('✔')} .gitignore — Stack-appropriate ignores

${theme.heading('LEARN MORE')}

  Documentation:  ${theme.info('https://vishalm.github.io/vibe-init')}
  GitHub:         ${theme.info('https://github.com/vishalm/vibe-init')}
  Report issues:  ${theme.info('https://github.com/vishalm/vibe-init/issues')}
`;

const INIT_HELP = `
${theme.brand('vibe init')} — Set up the vibe coding framework

${theme.heading('DESCRIPTION')}

  Prepares your project for AI-assisted (vibe) coding by generating:
  • CLAUDE.md — Comprehensive coding instructions, conventions, and guardrails
  • .claude/commands/ — Custom skills for Claude Code (test, lint, build, review, commit)
  • .claude/settings.json — Permissions and safety guardrails
  • docs/adr/ — Architecture Decision Record template
  • .gitignore — Stack-appropriate ignores (greenfield only)

  For greenfield projects: asks your stack preference and generates fresh framework.
  For brownfield projects: scans your codebase and generates framework from analysis.

  After init, run ${theme.brand('vibe build')} to describe your idea and build the project.

${theme.heading('USAGE')}

  ${theme.brand('$')} vibe init                  ${theme.dim('Interactive setup')}
  ${theme.brand('$')} vibe --dry-run init        ${theme.dim('Preview without writing files')}

${theme.heading('GENERATED FILES')}

  ${theme.dim('Framework:')}   CLAUDE.md, .claude/settings.json
  ${theme.dim('Skills:')}      .claude/commands/{test,lint,build,commit,review,add-feature}.md
  ${theme.dim('Docs:')}        docs/adr/000-template.md
  ${theme.dim('Git:')}         .gitignore (greenfield only)
`;

const BUILD_HELP = `
${theme.brand('vibe build')} — Build a project from your idea using the framework

${theme.heading('DESCRIPTION')}

  Takes your idea through enrichment (personas, features, architecture),
  generates an ADR and README, then spawns Claude Code to build the project
  using your CLAUDE.md framework as the coding bible.

  Requires ${theme.brand('vibe init')} to have been run first (CLAUDE.md must exist).

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
  .description('The last CLI you\'ll ever need — scaffolds production-ready projects using Claude')
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
