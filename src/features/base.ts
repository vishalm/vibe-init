import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { RenderedFile } from '../types/template.js';

/** Merge additions into an existing package.json. Creates if missing. */
export function mergePackageJson(
  projectDir: string,
  additions: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; scripts?: Record<string, string> }
): void {
  const pkgPath = join(projectDir, 'package.json');
  const existing = existsSync(pkgPath)
    ? JSON.parse(readFileSync(pkgPath, 'utf-8'))
    : { name: 'project', version: '0.1.0' };
  if (additions.dependencies) existing.dependencies = { ...existing.dependencies, ...additions.dependencies };
  if (additions.devDependencies) existing.devDependencies = { ...existing.devDependencies, ...additions.devDependencies };
  if (additions.scripts) existing.scripts = { ...existing.scripts, ...additions.scripts };
  writeFileSync(pkgPath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
}

/** Check if any of the given relative paths exist in the project directory. */
export function fileExists(projectDir: string, ...paths: string[]): boolean {
  return paths.some((p) => existsSync(join(projectDir, p)));
}

/** Write feature files. Skips existing unless force. Returns created/skipped arrays. */
export function writeFeatureFiles(
  projectDir: string,
  files: RenderedFile[],
  force: boolean
): { created: string[]; skipped: string[] } {
  const created: string[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const fullPath = join(projectDir, file.path);
    if (existsSync(fullPath) && !force) { skipped.push(file.path); continue; }
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, file.content, 'utf-8');
    created.push(file.path);
  }
  return { created, skipped };
}

/** Read package.json, returning null if missing. */
export function readPackageJson(projectDir: string): Record<string, unknown> | null {
  const pkgPath = join(projectDir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  return JSON.parse(readFileSync(pkgPath, 'utf-8'));
}

/** Detect the project stack from filesystem markers. */
export function detectStack(projectDir: string): string {
  if (fileExists(projectDir, 'next.config.ts', 'next.config.js', 'next.config.mjs')) return 'nextjs';
  if (fileExists(projectDir, 'go.mod')) return 'go';
  if (fileExists(projectDir, 'requirements.txt', 'pyproject.toml', 'setup.py')) return 'python';
  if (fileExists(projectDir, 'package.json')) return 'node';
  return 'unknown';
}
