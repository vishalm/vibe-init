import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CLI = join(import.meta.dirname, '../../build/index.js');

function run(args: string, opts: { cwd?: string; env?: Record<string, string> } = {}): string {
  try {
    return execSync(`node ${CLI} ${args}`, {
      cwd: opts.cwd ?? process.cwd(),
      encoding: 'utf-8',
      timeout: 30_000,
      env: { ...process.env, ...opts.env, NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; message: string };
    throw new Error(`CLI failed: ${e.message}\nstdout: ${e.stdout}\nstderr: ${e.stderr}`);
  }
}

function runAllowFail(args: string, opts: { cwd?: string } = {}): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`node ${CLI} ${args}`, {
      cwd: opts.cwd ?? process.cwd(),
      encoding: 'utf-8',
      timeout: 30_000,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: stdout.trim(), stderr: '', code: 0 };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.status ?? 1 };
  }
}

describe('CLI: vibe --version', () => {
  it('should print the version number', () => {
    const output = run('--version');
    expect(output).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('CLI: vibe --help', () => {
  it('should print help text with all commands', () => {
    const output = run('--help');
    expect(output).toContain('vibe init');
    expect(output).toContain('vibe build');
    expect(output).toContain('vibe run');
    expect(output).toContain('vibe ask');
    expect(output).toContain('vibe scan');
    expect(output).toContain('vibe add');
    expect(output).toContain('vibe doctor');
  });

  it('should mention the vibe coding workflow', () => {
    const output = run('--help');
    expect(output).toContain('CLAUDE.md');
    expect(output).toContain('framework');
  });
});

describe('CLI: vibe scan', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-scan-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should scan an empty directory without crashing', () => {
    const output = run(`scan ${tempDir}`);
    expect(output).toContain('Scanning');
  });

  it('should detect a Node.js project', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'test', version: '1.0.0' }));
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toMatch(/node|generic/);
  });

  it('should detect a Next.js project', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'test', dependencies: { next: '15.0.0' } }));
    writeFileSync(join(tempDir, 'next.config.ts'), 'export default {}');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('next');
  });

  it('should detect a Go project', () => {
    writeFileSync(join(tempDir, 'go.mod'), 'module example.com/test\n\ngo 1.22\n');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('go');
  });

  it('should detect a Python project', () => {
    writeFileSync(join(tempDir, 'requirements.txt'), 'fastapi==0.100.0\nuvicorn==0.23.0\n');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('python');
  });

  it('should detect Docker practice', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20\n');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('docker');
  });

  it('should detect CI practice', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    mkdirSync(join(tempDir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(tempDir, '.github', 'workflows', 'ci.yml'), 'name: CI\n');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('ci');
  });

  it('should detect testing practice', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    writeFileSync(join(tempDir, 'vitest.config.ts'), 'export default {}');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('test');
  });

  it('should detect documentation practice', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    writeFileSync(join(tempDir, 'README.md'), '# Test');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('doc');
  });

  it('should detect security practice (.gitignore with .env)', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    writeFileSync(join(tempDir, '.gitignore'), '.env\nnode_modules/\n');
    const output = run(`scan ${tempDir}`);
    expect(output.toLowerCase()).toContain('security');
  });
});

describe('CLI: vibe doctor', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-doctor-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should score an empty project (low grade)', () => {
    const output = run('doctor', { cwd: tempDir });
    expect(output).toMatch(/[A-F][+-]?/);
  });

  it('should score a well-configured project higher', () => {
    // Set up a project with many practices
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
    writeFileSync(join(tempDir, 'README.md'), '# Test Project');
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# AI Instructions');
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20');
    writeFileSync(join(tempDir, 'docker-compose.yml'), 'version: "3"');
    writeFileSync(join(tempDir, '.gitignore'), '.env\nnode_modules/');
    writeFileSync(join(tempDir, 'vitest.config.ts'), 'export default {}');
    writeFileSync(join(tempDir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
    mkdirSync(join(tempDir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(tempDir, '.github', 'workflows', 'ci.yml'), 'name: CI');
    mkdirSync(join(tempDir, '.husky'), { recursive: true });
    writeFileSync(join(tempDir, '.husky', 'pre-commit'), '#!/bin/sh');
    mkdirSync(join(tempDir, '__tests__'), { recursive: true });
    writeFileSync(join(tempDir, '__tests__', 'sample.test.ts'), 'test("ok", () => {})');

    const output = run('doctor', { cwd: tempDir });
    // Should get at least a B with all these practices
    expect(output).toMatch(/[AB][+-]?/);
  });

  it('should suggest vibe add commands for missing practices', () => {
    writeFileSync(join(tempDir, 'package.json'), '{}');
    const output = run('doctor', { cwd: tempDir });
    expect(output.toLowerCase()).toContain('vibe add');
  });
});

describe('CLI: vibe add', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-add-test-'));
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'test-project', version: '1.0.0' }));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should reject unknown features', () => {
    const result = runAllowFail('add nonexistent', { cwd: tempDir });
    expect(result.code).not.toBe(0);
  });

  it('should add docker feature', () => {
    run('add docker', { cwd: tempDir });
    expect(existsSync(join(tempDir, 'Dockerfile'))).toBe(true);
  });

  it('should add ci feature', () => {
    run('add ci', { cwd: tempDir });
    expect(existsSync(join(tempDir, '.github', 'workflows', 'ci.yml'))).toBe(true);
  });

  it('should add testing feature', () => {
    run('add testing', { cwd: tempDir });
    expect(existsSync(join(tempDir, 'vitest.config.ts'))).toBe(true);
  });

  it('should add health feature', () => {
    run('add health', { cwd: tempDir });
    // Generic Node creates src/routes/health.ts; Next.js creates src/app/api/health/route.ts
    const genericPath = existsSync(join(tempDir, 'src', 'routes', 'health.ts'));
    const nextjsPath = existsSync(join(tempDir, 'src', 'app', 'api', 'health', 'route.ts'));
    expect(genericPath || nextjsPath).toBe(true);
  });

  it('should add logging feature', () => {
    run('add logging', { cwd: tempDir });
    expect(existsSync(join(tempDir, 'src', 'lib', 'logger.ts'))).toBe(true);
  });

  it('should add validation feature', () => {
    run('add validation', { cwd: tempDir });
    expect(existsSync(join(tempDir, 'src', 'lib', 'env.ts'))).toBe(true);
  });

  it('should add hooks feature', () => {
    run('add hooks', { cwd: tempDir });
    expect(existsSync(join(tempDir, '.husky', 'pre-commit'))).toBe(true);
  });

  it('should skip already-installed feature without --force', () => {
    run('add docker', { cwd: tempDir });
    // Second run should warn but not fail
    const result = runAllowFail('add docker', { cwd: tempDir });
    expect(result.stdout + result.stderr).toMatch(/already|exist|skip/i);
  });

  it('should overwrite with --force', () => {
    run('add docker', { cwd: tempDir });
    // Should not throw
    run('add docker --force', { cwd: tempDir });
    expect(existsSync(join(tempDir, 'Dockerfile'))).toBe(true);
  });
});

describe('CLI: vibe build (no CLAUDE.md)', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'vibe-build-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should fail if CLAUDE.md does not exist', () => {
    const result = runAllowFail('build', { cwd: tempDir });
    expect(result.code).not.toBe(0);
    expect(result.stdout + result.stderr).toMatch(/CLAUDE\.md|vibe init/i);
  });
});
