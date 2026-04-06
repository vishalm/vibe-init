import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scoreProject } from '../../../src/scoring/health.js';

describe('Governance audit engine', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-health-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return a score between 0 and 100', () => {
    const report = scoreProject(tempDir);
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('should return a valid letter grade', () => {
    const report = scoreProject(tempDir);
    expect(report.grade).toMatch(/^[A-F][+-]?$/);
  });

  it('should return all 6 governance categories', () => {
    const report = scoreProject(tempDir);
    const catNames = Object.keys(report.categories);
    expect(catNames).toContain('security');
    expect(catNames).toContain('accessibility');
    expect(catNames).toContain('reliability');
    expect(catNames).toContain('performance');
    expect(catNames).toContain('compliance');
    expect(catNames).toContain('clean-code');
  });

  it('should return check results with required fields', () => {
    const report = scoreProject(tempDir);
    expect(report.checks.length).toBeGreaterThan(0);
    for (const check of report.checks) {
      expect(check.id).toBeDefined();
      expect(typeof check.passed).toBe('boolean');
      expect(check.weight).toBeGreaterThan(0);
      expect(check.category).toBeDefined();
      expect(check.severity).toBeDefined();
    }
  });

  it('should score empty project low (F or D)', () => {
    const report = scoreProject(tempDir);
    expect(['F', 'D']).toContain(report.grade);
  });

  it('should include fix suggestions for violations', () => {
    const report = scoreProject(tempDir);
    const withFixes = report.violations.filter((v) => v.fix);
    expect(withFixes.length).toBeGreaterThan(0);
    // Fixes can be vibe add commands or shell commands
    for (const v of withFixes) {
      expect(v.fix!.length).toBeGreaterThan(0);
    }
  });

  it('should score well-configured project higher', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'test', dependencies: { zod: '^3.0.0' } }));
    writeFileSync(join(tempDir, 'package-lock.json'), '{}');
    writeFileSync(join(tempDir, 'README.md'), '# Test');
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# AI');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');
    writeFileSync(join(tempDir, 'docker-compose.yml'), 'version: "3"');
    writeFileSync(join(tempDir, '.gitignore'), '.env\nnode_modules/');
    writeFileSync(join(tempDir, '.env.example'), 'DATABASE_URL=postgresql://localhost\nPORT=3000');
    writeFileSync(join(tempDir, 'vitest.config.ts'), 'export default { test: { coverage: { thresholds: {} } } }');
    writeFileSync(join(tempDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
    mkdirSync(join(tempDir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(tempDir, '.github', 'workflows', 'ci.yml'), 'name: CI');
    mkdirSync(join(tempDir, '.husky'));
    writeFileSync(join(tempDir, '.husky', 'pre-commit'), '#!/bin/sh');
    mkdirSync(join(tempDir, '__tests__'));
    writeFileSync(join(tempDir, '__tests__', 'app.test.ts'), 'test("ok", () => {})');
    mkdirSync(join(tempDir, '.git'));

    const report = scoreProject(tempDir);
    expect(report.score).toBeGreaterThanOrEqual(40);
  });

  it('should increase score when adding practices', () => {
    const emptyReport = scoreProject(tempDir);

    writeFileSync(join(tempDir, 'README.md'), '# Test');
    writeFileSync(join(tempDir, '.gitignore'), '.env\n');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');
    writeFileSync(join(tempDir, 'package.json'), '{}');
    mkdirSync(join(tempDir, '.git'));

    const betterReport = scoreProject(tempDir);
    expect(betterReport.score).toBeGreaterThan(emptyReport.score);
  });

  it('should include timestamp', () => {
    const report = scoreProject(tempDir);
    expect(report.timestamp).toBeDefined();
    expect(new Date(report.timestamp).getTime()).not.toBeNaN();
  });

  it('should list violations (failed policies)', () => {
    const report = scoreProject(tempDir);
    expect(report.violations.length).toBeGreaterThan(0);
    for (const v of report.violations) {
      expect(v.passed).toBe(false);
      expect(['block', 'warn', 'info']).toContain(v.severity);
    }
  });
});
