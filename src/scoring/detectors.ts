import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileExists } from '../features/base.js';

export function testFilesExist(projectDir: string): boolean {
  for (const dir of ['__tests__', 'tests', 'test', 'spec']) {
    const fullDir = join(projectDir, dir);
    if (!existsSync(fullDir)) continue;
    const files = readdirSync(fullDir, { recursive: true, encoding: 'utf-8' });
    if (files.some((f) => /\.test\.|\.spec\./i.test(String(f)))) return true;
  }
  return false;
}

export function coverageConfigured(projectDir: string): boolean {
  return fileExists(projectDir, 'vitest.config.ts', 'vitest.config.js', 'jest.config.ts', 'jest.config.js');
}

export function dockerfileExists(projectDir: string): boolean {
  return fileExists(projectDir, 'Dockerfile');
}

export function composeExists(projectDir: string): boolean {
  return fileExists(projectDir, 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml');
}

export function gitignoreExists(projectDir: string): boolean {
  return fileExists(projectDir, '.gitignore');
}

export function typescriptConfigured(projectDir: string): boolean {
  return fileExists(projectDir, 'tsconfig.json');
}

export function linterConfigured(projectDir: string): boolean {
  // Config file check
  if (fileExists(
    projectDir, '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml',
    'eslint.config.js', 'eslint.config.mjs', 'biome.json', '.prettierrc', '.prettierrc.json',
    'eslint.config.ts',
  )) return true;
  // Check package.json for lint script using tsc
  const pkgPath = join(projectDir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const lintScript = pkg.scripts?.lint;
      if (lintScript && (lintScript.includes('tsc') || lintScript.includes('eslint') || lintScript.includes('biome'))) return true;
    } catch { /* ignore */ }
  }
  return false;
}

export function readmeExists(projectDir: string): boolean {
  return fileExists(projectDir, 'README.md', 'readme.md');
}

export function claudeMdExists(projectDir: string): boolean {
  return fileExists(projectDir, 'CLAUDE.md');
}
