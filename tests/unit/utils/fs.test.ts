import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFileTree, isEmptyDir, slugify } from '../../../src/utils/fs.js';

describe('writeFileTree', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should write files to the base directory', () => {
    const files = [
      { path: 'README.md', content: '# Hello' },
      { path: 'package.json', content: '{}' },
    ];

    writeFileTree(tempDir, files);

    expect(readFileSync(join(tempDir, 'README.md'), 'utf-8')).toBe('# Hello');
    expect(readFileSync(join(tempDir, 'package.json'), 'utf-8')).toBe('{}');
  });

  it('should create nested directories automatically', () => {
    const files = [
      { path: 'src/app/api/health/route.ts', content: 'export {}' },
      { path: 'docs/adr/001.md', content: '# ADR' },
    ];

    writeFileTree(tempDir, files);

    expect(
      readFileSync(join(tempDir, 'src/app/api/health/route.ts'), 'utf-8')
    ).toBe('export {}');
    expect(readFileSync(join(tempDir, 'docs/adr/001.md'), 'utf-8')).toBe(
      '# ADR'
    );
  });

  it('should handle empty file list', () => {
    writeFileTree(tempDir, []);
    // Should not throw
  });
});

describe('isEmptyDir', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return true for non-existent directory', () => {
    expect(isEmptyDir(join(tempDir, 'nonexistent'))).toBe(true);
  });

  it('should return true for empty directory', () => {
    const emptyDir = join(tempDir, 'empty');
    mkdirSync(emptyDir);
    expect(isEmptyDir(emptyDir)).toBe(true);
  });

  it('should return true for directory with only .DS_Store', () => {
    writeFileSync(join(tempDir, '.DS_Store'), '');
    expect(isEmptyDir(tempDir)).toBe(true);
  });

  it('should return true for directory with only .git', () => {
    mkdirSync(join(tempDir, '.git'));
    expect(isEmptyDir(tempDir)).toBe(true);
  });

  it('should return false for directory with files', () => {
    writeFileSync(join(tempDir, 'file.txt'), 'content');
    expect(isEmptyDir(tempDir)).toBe(false);
  });
});

describe('slugify', () => {
  it('should convert spaces to hyphens', () => {
    expect(slugify('My Cool App')).toBe('my-cool-app');
  });

  it('should remove special characters', () => {
    expect(slugify('app@v2.0!')).toBe('app-v2-0');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should lowercase everything', () => {
    expect(slugify('MyApp')).toBe('myapp');
  });
});
