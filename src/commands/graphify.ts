import { execFileSync, spawnSync } from 'node:child_process';
import { theme } from '../ui/theme.js';

const GRAPHIFY_PYPI_PACKAGE = 'graphifyy';
const GRAPHIFY_BIN = 'graphify';

type Installer = {
  bin: string;
  args: (pkg: string) => string[];
  label: string;
};

const INSTALLERS: Installer[] = [
  { bin: 'uv', args: (pkg) => ['tool', 'install', pkg], label: 'uv tool install' },
  { bin: 'pipx', args: (pkg) => ['install', pkg], label: 'pipx install' },
  { bin: 'pip3', args: (pkg) => ['install', '--user', pkg], label: 'pip3 install --user' },
  { bin: 'pip', args: (pkg) => ['install', '--user', pkg], label: 'pip install --user' },
];

/**
 * Whether the graphify CLI is available on PATH.
 * Used by `vibe init` to decide whether to surface install hints.
 */
export function isGraphifyInstalled(): boolean {
  const result = spawnSync(GRAPHIFY_BIN, ['--version'], {
    stdio: 'ignore',
    timeout: 5_000,
  });
  return result.status === 0;
}

function isCommandAvailable(bin: string): boolean {
  const result = spawnSync(bin, ['--version'], { stdio: 'ignore', timeout: 5_000 });
  return result.status === 0;
}

function runGraphify(args: string[]): never {
  try {
    execFileSync(GRAPHIFY_BIN, args, { stdio: 'inherit', cwd: process.cwd() });
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
  console.log(
    theme.brand(`\n📦 graphify CLI not found — installing ${GRAPHIFY_PYPI_PACKAGE}...\n`)
  );

  const installer = INSTALLERS.find((i) => isCommandAvailable(i.bin));

  if (!installer) {
    console.error(theme.error('\n💥 No Python installer found (uv, pipx, or pip required).'));
    console.error(
      `\n  Install one of:\n` +
        `  ${theme.brand('$')} curl -LsSf https://astral.sh/uv/install.sh | sh   ${theme.dim('# uv (recommended)')}\n` +
        `  ${theme.brand('$')} python3 -m pip install --user pipx\n\n` +
        `  Then re-run: ${theme.brand('vibe graphify')} ${args.join(' ')}\n` +
        `  Learn more: ${theme.info('https://github.com/safishamsi/graphify')}\n`
    );
    process.exit(1);
  }

  console.log(theme.dim(`  Using ${installer.label}\n`));

  try {
    execFileSync(installer.bin, installer.args(GRAPHIFY_PYPI_PACKAGE), { stdio: 'inherit' });
    console.log(theme.success('\n✔ graphify installed. Launching...\n'));
    execFileSync(GRAPHIFY_BIN, args, { stdio: 'inherit', cwd: process.cwd() });
    process.exit(0);
  } catch (installError) {
    console.error(theme.error('\n💥 Failed to install or run graphify.'));
    console.error(
      `\n  Try manually:\n\n` +
        `  ${theme.brand('$')} uv tool install ${GRAPHIFY_PYPI_PACKAGE}\n` +
        `  ${theme.brand('$')} pipx install ${GRAPHIFY_PYPI_PACKAGE}\n` +
        `  ${theme.brand('$')} pip install --user ${GRAPHIFY_PYPI_PACKAGE}\n\n` +
        `  If 'graphify: command not found' after install, ensure your shim path is on PATH:\n` +
        `    ${theme.dim('• uv:    ~/.local/bin')}\n` +
        `    ${theme.dim('• pipx:  ~/.local/bin')}\n` +
        `    ${theme.dim('• pip:   ~/.local/bin (Linux) or ~/Library/Python/3.x/bin (macOS)')}\n\n` +
        `  Learn more: ${theme.info('https://github.com/safishamsi/graphify')}\n`
    );
    const exitCode =
      installError instanceof Error && 'status' in installError
        ? ((installError as { status: number }).status ?? 1)
        : 1;
    process.exit(exitCode);
  }
}

/**
 * Forwards the user's args to the global `graphify` binary.
 * Auto-installs the `graphifyy` PyPI package via uv → pipx → pip if missing.
 */
export function graphifyCommand(args: string[]): never {
  runGraphify(args);
}
