import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectProjectType } from '../../../src/phases/framework.js';

describe('detectProjectType', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-type-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return greenfield for empty directory', () => {
    expect(detectProjectType(tempDir)).toBe('greenfield');
  });

  it('should return greenfield for non-existent directory', () => {
    expect(detectProjectType(join(tempDir, 'nonexistent'))).toBe('greenfield');
  });

  it('should return brownfield for directory with files', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    writeFileSync(join(tempDir, 'index.ts'), 'console.log("hello")');
    expect(detectProjectType(tempDir)).toBe('brownfield');
  });

  it('should return greenfield for directory with only .gitignore', () => {
    writeFileSync(join(tempDir, '.gitignore'), 'node_modules/');
    expect(detectProjectType(tempDir)).toBe('greenfield');
  });
});
