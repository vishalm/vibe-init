import { execFileSync, spawnSync } from 'node:child_process';
import { theme } from '../ui/theme.js';

const AGENTS_CLI_BIN = 'agents-cli';
const AGENTS_CLI_PYPI_PACKAGE = 'google-agents-cli';
const UV_BIN = 'uv';
const UVX_BIN = 'uvx';

/**
 * Whether the agents-cli binary is available on PATH.
 * Used by `vibe init` if it ever needs to surface install hints.
 */
export function isAgentsCliInstalled(): boolean {
  const result = spawnSync(AGENTS_CLI_BIN, ['--version'], {
    stdio: 'ignore',
    timeout: 5_000,
  });
  return result.status === 0;
}

function isCommandAvailable(bin: string): boolean {
  const result = spawnSync(bin, ['--version'], { stdio: 'ignore', timeout: 5_000 });
  return result.status === 0;
}

function isErrnoEnoent(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

function exitFromChildError(error: unknown, fallback = 1): never {
  const exitCode =
    error instanceof Error && 'status' in error
      ? ((error as { status: number | null }).status ?? fallback)
      : fallback;
  process.exit(exitCode);
}

function runViaUvx(args: string[]): never {
  if (!isCommandAvailable(UVX_BIN) && !isCommandAvailable(UV_BIN)) {
    console.error(theme.error('\nNo runner found for agents-cli (uv / uvx not available).'));
    console.error(
      `\n  ${theme.bold('agents-cli')} is published as the ${theme.info(AGENTS_CLI_PYPI_PACKAGE)} Python package.\n` +
        `  vibe-init runs it via ${theme.brand('uvx')}, which needs ${theme.brand('uv')}.\n\n` +
        `  Install uv:\n` +
        `    ${theme.brand('$')} curl -LsSf https://astral.sh/uv/install.sh | sh\n\n` +
        `  Or install agents-cli yourself:\n` +
        `    ${theme.brand('$')} uvx ${AGENTS_CLI_PYPI_PACKAGE} setup\n\n` +
        `  Learn more: ${theme.info('https://github.com/google/agents-cli')}\n`
    );
    process.exit(1);
  }

  try {
    execFileSync(UVX_BIN, [AGENTS_CLI_PYPI_PACKAGE, ...args], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    process.exit(0);
  } catch (error) {
    if (isErrnoEnoent(error)) {
      // uvx itself was not found despite earlier check (race/install path issue).
      console.error(theme.error('\nuvx not found on PATH.'));
      console.error(
        `\n  Install uv (provides uvx):\n` +
          `    ${theme.brand('$')} curl -LsSf https://astral.sh/uv/install.sh | sh\n\n` +
          `  Then re-run: ${theme.brand('vibe agents-cli')} ${args.join(' ')}\n`
      );
      process.exit(1);
    }
    exitFromChildError(error);
  }
}

function runAgentsCli(args: string[]): never {
  try {
    execFileSync(AGENTS_CLI_BIN, args, { stdio: 'inherit', cwd: process.cwd() });
    process.exit(0);
  } catch (error) {
    if (isErrnoEnoent(error)) {
      // Binary missing — fall back to ephemeral uvx execution rather than a
      // global install. Mirrors agents-cli's own recommended invocation
      // (`uvx google-agents-cli setup`).
      runViaUvx(args);
    }
    exitFromChildError(error);
  }
}

/**
 * Forwards the user's args to the global `agents-cli` binary, falling back to
 * `uvx google-agents-cli` if the binary is missing. All flags (including
 * --help) pass through verbatim so users see the canonical agents-cli help.
 */
export function agentsCliCommand(args: string[]): never {
  runAgentsCli(args);
}
