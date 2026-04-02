import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scoreProject } from '../../../src/scoring/health.js';

describe('Health scoring engine', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-health-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return a score between 0 and 100', () => {
    const report = scoreProject(tempDir);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('should return a valid letter grade', () => {
    const report = scoreProject(tempDir);
    expect(report.grade).toMatch(/^[A-F][+-]?$/);
  });

  it('should return all 7 categories', () => {
    const report = scoreProject(tempDir);
    const catNames = Object.keys(report.categories);
    expect(catNames).toContain('testing');
    expect(catNames).toContain('ci-cd');
    expect(catNames).toContain('containerization');
    expect(catNames).toContain('security');
    expect(catNames).toContain('code-quality');
    expect(catNames).toContain('documentation');
    expect(catNames).toContain('observability');
  });

  it('should return check results with required fields', () => {
    const report = scoreProject(tempDir);
    expect(report.checks.length).toBeGreaterThan(0);
    for (const check of report.checks) {
      expect(check.id).toBeDefined();
      expect(typeof check.passed).toBe('boolean');
      expect(check.weight).toBeGreaterThan(0);
      expect(check.category).toBeDefined();
    }
  });

  it('should score empty project low (F or D)', () => {
    const report = scoreProject(tempDir);
    expect(['F', 'D']).toContain(report.grade);
  });

  it('should include fix suggestions for failed checks', () => {
    const report = scoreProject(tempDir);
    const failed = report.checks.filter((c) => !c.passed);
    const withFixes = failed.filter((c) => c.fixCommand);
    // Most failed checks should have fix commands
    expect(withFixes.length).toBeGreaterThan(0);
    for (const check of withFixes) {
      expect(check.fixCommand).toMatch(/^vibe add /);
    }
  });

  it('should score well-configured project higher', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
    writeFileSync(join(tempDir, 'README.md'), '# Test');
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# AI');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');
    writeFileSync(join(tempDir, 'docker-compose.yml'), 'version: "3"');
    writeFileSync(join(tempDir, '.gitignore'), '.env\nnode_modules/');
    writeFileSync(join(tempDir, 'vitest.config.ts'), 'export default { test: { coverage: {} } }');
    writeFileSync(join(tempDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
    mkdirSync(join(tempDir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(tempDir, '.github', 'workflows', 'ci.yml'), 'name: CI');
    mkdirSync(join(tempDir, '.husky'));
    writeFileSync(join(tempDir, '.husky', 'pre-commit'), '#!/bin/sh');
    mkdirSync(join(tempDir, '__tests__'));
    writeFileSync(join(tempDir, '__tests__', 'app.test.ts'), 'test("ok", () => {})');

    const report = scoreProject(tempDir);
    expect(report.overallScore).toBeGreaterThanOrEqual(50);
  });

  it('should increase score when adding practices', () => {
    const emptyReport = scoreProject(tempDir);

    writeFileSync(join(tempDir, 'README.md'), '# Test');
    writeFileSync(join(tempDir, '.gitignore'), '.env\n');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');

    const betterReport = scoreProject(tempDir);
    expect(betterReport.overallScore).toBeGreaterThan(emptyReport.overallScore);
  });

  it('should include timestamp', () => {
    const report = scoreProject(tempDir);
    expect(report.timestamp).toBeDefined();
    expect(new Date(report.timestamp).getTime()).not.toBeNaN();
  });
});
