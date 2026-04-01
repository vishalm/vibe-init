import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getStack, getStackManifest, listStacks } from '../../../src/templates/registry.js';

describe('Stack Registry', () => {
  it('should list at least one stack', () => {
    const stacks = listStacks();
    expect(stacks.length).toBeGreaterThanOrEqual(1);
  });

  it('should return the nextjs-fullstack stack', () => {
    const stack = getStack('nextjs-fullstack');
    expect(stack.id).toBe('nextjs-fullstack');
    expect(stack.name).toContain('Next.js');
    expect(stack.language).toBe('typescript');
  });

  it('should throw for unknown stack', () => {
    expect(() => getStack('nonexistent')).toThrow('Unknown stack');
  });

  it('should return manifest for nextjs-fullstack', () => {
    const manifest = getStackManifest('nextjs-fullstack');
    expect(manifest.length).toBeGreaterThanOrEqual(20);
  });
});

describe('NEXTJS_FULLSTACK manifest files', () => {
  const stack = getStack('nextjs-fullstack');
  const manifest = stack.manifest;

  it('every source file should exist on disk', () => {
    for (const entry of manifest) {
      const sourcePath = join(stack.templateDir, entry.source);
      expect(existsSync(sourcePath), `Missing template: ${entry.source}`).toBe(true);
    }
  });

  it('all source files should end with .ejs', () => {
    for (const entry of manifest) {
      expect(entry.source, `Source should end with .ejs: ${entry.source}`).toMatch(/\.ejs$/);
    }
  });

  it('no output files should end with .ejs', () => {
    for (const entry of manifest) {
      expect(entry.output, `Output should not end with .ejs: ${entry.output}`).not.toMatch(/\.ejs$/);
    }
  });
});
