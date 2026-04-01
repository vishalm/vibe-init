import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Safely reads and parses package.json. Returns null if not found or invalid.
 */
export function readPackageJson(projectDir: string): PackageJson | null {
  const pkgPath = join(projectDir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf-8')) as PackageJson;
  } catch {
    return null;
  }
}

/**
 * Detects the package manager from lockfile presence.
 */
export function detectPackageManager(projectDir: string): string {
  if (existsSync(join(projectDir, 'bun.lockb'))) return 'bun';
  if (existsSync(join(projectDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(projectDir, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(projectDir, 'package-lock.json'))) return 'npm';
  return 'npm';
}
