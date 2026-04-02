import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { analyzeProject, runStackDetection, runPracticeDetection } from '../../../src/analyzers/detector.js';

describe('runStackDetection', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-detect-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect Next.js by next.config.ts', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'app', dependencies: { next: '15.0.0' } }));
    writeFileSync(join(tempDir, 'next.config.ts'), 'export default {}');
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('nextjs');
    expect(result.framework).toContain('Next');
  });

  it('should detect Next.js by next.config.mjs', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'app', dependencies: { next: '15.0.0' } }));
    writeFileSync(join(tempDir, 'next.config.mjs'), 'export default {}');
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('nextjs');
  });

  it('should detect Go by go.mod', () => {
    writeFileSync(join(tempDir, 'go.mod'), 'module example.com/app\n\ngo 1.22\n');
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('go');
    expect(result.language).toBe('go');
  });

  it('should detect Python by requirements.txt', () => {
    writeFileSync(join(tempDir, 'requirements.txt'), 'fastapi==0.100.0\n');
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('python-fastapi');
    expect(result.language).toBe('python');
  });

  it('should detect Python by pyproject.toml with fastapi dependency', () => {
    writeFileSync(join(tempDir, 'pyproject.toml'), '[project]\nname = "myapp"\n');
    writeFileSync(join(tempDir, 'requirements.txt'), 'fastapi\n');
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('python-fastapi');
  });

  it('should detect generic Node.js by package.json', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'app' }));
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('generic-node');
    expect(result.language).toBe('javascript');
  });

  it('should return unknown for empty directory', () => {
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('unknown');
  });

  it('should prioritize Next.js over generic Node.js', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'app', dependencies: { next: '15.0.0' } }));
    writeFileSync(join(tempDir, 'next.config.js'), 'module.exports = {}');
    const result = runStackDetection(tempDir);
    expect(result.stack).toBe('nextjs');
  });
});

describe('runPracticeDetection', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-practice-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return 10 practice results', () => {
    const results = runPracticeDetection(tempDir);
    expect(results).toHaveLength(10);
  });

  it('should detect all practices as missing in empty dir', () => {
    const results = runPracticeDetection(tempDir);
    const detected = results.filter((r) => r.detected);
    expect(detected.length).toBe(0);
  });

  it('should detect docker when Dockerfile exists', () => {
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');
    const results = runPracticeDetection(tempDir);
    const docker = results.find((r) => r.detectorId === 'docker');
    expect(docker?.detected).toBe(true);
  });

  it('should detect CI when .github/workflows exists', () => {
    mkdirSync(join(tempDir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(tempDir, '.github', 'workflows', 'ci.yml'), 'name: CI');
    const results = runPracticeDetection(tempDir);
    const ci = results.find((r) => r.detectorId === 'ci');
    expect(ci?.detected).toBe(true);
  });

  it('should detect testing when vitest.config.ts exists', () => {
    writeFileSync(join(tempDir, 'vitest.config.ts'), 'export default {}');
    const results = runPracticeDetection(tempDir);
    const testing = results.find((r) => r.detectorId === 'testing');
    expect(testing?.detected).toBe(true);
  });

  it('should detect documentation when README.md exists', () => {
    writeFileSync(join(tempDir, 'README.md'), '# Hello');
    const results = runPracticeDetection(tempDir);
    const docs = results.find((r) => r.detectorId === 'documentation');
    expect(docs?.detected).toBe(true);
  });

  it('should detect security when .gitignore excludes .env', () => {
    writeFileSync(join(tempDir, '.gitignore'), 'node_modules/\n.env\n');
    const results = runPracticeDetection(tempDir);
    const security = results.find((r) => r.detectorId === 'security');
    expect(security?.detected).toBe(true);
  });

  it('should detect git hooks when .husky exists', () => {
    mkdirSync(join(tempDir, '.husky'));
    writeFileSync(join(tempDir, '.husky', 'pre-commit'), '#!/bin/sh');
    const results = runPracticeDetection(tempDir);
    const hooks = results.find((r) => r.detectorId === 'git-hooks');
    expect(hooks?.detected).toBe(true);
  });
});

describe('analyzeProject', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-analyze-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return complete analysis for empty project', () => {
    const analysis = analyzeProject(tempDir);
    expect(analysis.projectDir).toBe(tempDir);
    expect(analysis.stack).toBeDefined();
    expect(analysis.practices).toHaveLength(10);
    expect(analysis.missingPractices.length).toBeGreaterThan(0);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  it('should return fewer missing practices for well-configured project', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    writeFileSync(join(tempDir, 'README.md'), '# App');
    writeFileSync(join(tempDir, '.gitignore'), '.env\n');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');
    writeFileSync(join(tempDir, 'vitest.config.ts'), 'export default {}');

    const analysis = analyzeProject(tempDir);
    // Should have at least some detected practices
    const detectedCount = analysis.practices.filter((p) => p.detected).length;
    expect(detectedCount).toBeGreaterThanOrEqual(3);
  });

  it('should include recommendations for missing practices', () => {
    const analysis = analyzeProject(tempDir);
    // Empty project should have recommendations for docker, ci, testing, etc.
    expect(analysis.recommendations.length).toBeGreaterThanOrEqual(5);
    expect(analysis.recommendations.some((r) => r.toLowerCase().includes('docker'))).toBe(true);
    expect(analysis.recommendations.some((r) => r.toLowerCase().includes('test'))).toBe(true);
  });
});
