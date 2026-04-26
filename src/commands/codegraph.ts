import { execFileSync, spawnSync } from 'node:child_process';
import { theme } from '../ui/theme.js';

const CODEGRAPH_PACKAGE = '@colbymchenry/codegraph';
const CODEGRAPH_BIN = 'codegraph';

/**
 * Whether the codegraph CLI is available on PATH.
 * Used by `vibe init` to decide whether to offer auto-init.
 */
export function isCodegraphInstalled(): boolean {
  const result = spawnSync(CODEGRAPH_BIN, ['--version'], {
    stdio: 'ignore',
    timeout: 5_000,
  });
  return result.status === 0;
}

function runCodegraph(args: string[]): never {
  try {
    execFileSync(CODEGRAPH_BIN, args, { stdio: 'inherit', cwd: process.cwd() });
    process.exit(0);
  } catch (error) {
    const isNotFound =
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT';
    if (isNotFound) {
      installAndRetry(args);
    }
    const exitCode =
      error instanceof Error && 'status' in error
        ? ((error as { status: number }).status ?? 1)
        : 1;
    process.exit(exitCode);
  }
}

function installAndRetry(args: string[]): never {
  console.log(theme.brand(`\n📦 codegraph CLI not found — installing ${CODEGRAPH_PACKAGE}...\n`));
  try {
    execFileSync('npm', ['install', '-g', CODEGRAPH_PACKAGE], { stdio: 'inherit' });
    console.log(theme.success('\n✔ codegraph installed. Launching...\n'));
    execFileSync(CODEGRAPH_BIN, args, { stdio: 'inherit', cwd: process.cwd() });
    process.exit(0);
  } catch (installError) {
    console.error(theme.error('\n💥 Failed to install codegraph.'));
    console.error(`\n  Try manually:\n\n  ${theme.brand('$')} npm install -g ${CODEGRAPH_PACKAGE}\n`);
    console.error(`  Learn more: ${theme.info('https://www.npmjs.com/package/' + CODEGRAPH_PACKAGE)}\n`);
    const exitCode =
      installError instanceof Error && 'status' in installError
        ? ((installError as { status: number }).status ?? 1)
        : 1;
    process.exit(exitCode);
  }
}

/**
 * Forwards the user's args to the global `codegraph` binary.
 * Auto-installs `@colbymchenry/codegraph` if the binary is missing.
 */
export function codegraphCommand(args: string[]): never {
  runCodegraph(args);
}
