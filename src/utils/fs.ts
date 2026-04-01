import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { RenderedFile } from '../types/template.js';

/**
 * Writes an array of rendered files to a base directory atomically.
 * Creates all necessary subdirectories.
 */
export function writeFileTree(basePath: string, files: RenderedFile[]): void {
  // Pre-validate: ensure no files will overwrite unexpectedly
  for (const file of files) {
    const fullPath = join(basePath, file.path);
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });
  }

  // Write all files
  for (const file of files) {
    const fullPath = join(basePath, file.path);
    writeFileSync(fullPath, file.content, 'utf-8');
  }
}

/**
 * Checks if a directory is empty or does not exist.
 * Returns true if safe to scaffold into.
 */
export function isEmptyDir(path: string): boolean {
  if (!existsSync(path)) {
    return true;
  }
  const entries = readdirSync(path);
  // Allow .git and .DS_Store
  const meaningful = entries.filter(
    (e) => e !== '.git' && e !== '.DS_Store'
  );
  return meaningful.length === 0;
}

/**
 * Converts a project name to a filesystem-safe slug.
 * "My Cool App" → "my-cool-app"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
