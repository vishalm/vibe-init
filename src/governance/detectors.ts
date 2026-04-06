/**
 * Governance-specific detectors.
 * Reuses existing detectors where possible and adds new governance checks.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileExists } from '../features/base.js';

// ── Security ────────────────────────────────────────────────────

export function gitignoreExcludesEnv(dir: string): boolean {
  const gi = join(dir, '.gitignore');
  if (!existsSync(gi)) return false;
  const content = readFileSync(gi, 'utf-8');
  return /^\.env$/m.test(content) || content.includes('.env.local');
}

export function noHardcodedSecrets(dir: string): boolean {
  const srcDir = join(dir, 'src');
  if (!existsSync(srcDir)) return true; // no src = no risk
  const dangerPatterns = [
    /(['"])sk[-_](?:live|test)[-_]\w{20,}\1/,
    /(['"])ghp_\w{36}\1/,
    /(['"])AKIA\w{16}\1/,
    /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
  ];
  try {
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' });
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js') && !file.endsWith('.py')) continue;
      const content = readFileSync(join(srcDir, String(file)), 'utf-8');
      if (dangerPatterns.some((p) => p.test(content))) return false;
    }
  } catch { /* ignore */ }
  return true;
}

export function dependencyLockfileExists(dir: string): boolean {
  return fileExists(dir, 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'Pipfile.lock', 'poetry.lock', 'go.sum');
}

export function inputValidationConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['zod'] || deps['joi'] || deps['yup'] || deps['class-validator']) return true;
    } catch { /* ignore */ }
  }
  if (fileExists(dir, 'requirements.txt')) {
    const content = readFileSync(join(dir, 'requirements.txt'), 'utf-8');
    if (content.includes('pydantic') || content.includes('marshmallow')) return true;
  }
  return false;
}

// ── Accessibility ───────────────────────────────────────────────

export function a11yLinterConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['eslint-plugin-jsx-a11y'] || deps['axe-core'] || deps['pa11y'] || deps['@axe-core/react']) return true;
    } catch { /* ignore */ }
  }
  return false;
}

export function langAttributePresent(dir: string): boolean {
  const layoutFiles = ['src/app/layout.tsx', 'src/app/layout.jsx', 'index.html', 'public/index.html'];
  for (const f of layoutFiles) {
    const full = join(dir, f);
    if (!existsSync(full)) continue;
    const content = readFileSync(full, 'utf-8');
    if (/lang\s*=\s*["']/.test(content)) return true;
  }
  return false;
}

// ── Reliability ─────────────────────────────────────────────────

export function gracefulShutdownHandler(dir: string): boolean {
  const serverFiles = ['src/index.ts', 'src/index.js', 'src/server.ts', 'src/server.js', 'src/app.ts', 'src/app.js', 'main.go', 'main.py'];
  for (const f of serverFiles) {
    const full = join(dir, f);
    if (!existsSync(full)) continue;
    const content = readFileSync(full, 'utf-8');
    if (content.includes('SIGTERM') || content.includes('SIGINT') || content.includes('signal.signal') || content.includes('os.Signal')) return true;
  }
  return false;
}

export function errorBoundaryPresent(dir: string): boolean {
  return fileExists(dir, 'src/app/error.tsx', 'src/app/error.jsx', 'src/app/not-found.tsx', 'src/components/ErrorBoundary.tsx');
}

export function databaseMigrationsVersioned(dir: string): boolean {
  return fileExists(dir, 'prisma/migrations', 'migrations', 'alembic/versions', 'db/migrate');
}

// ── Performance ─────────────────────────────────────────────────

export function bundleAnalysisConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['@next/bundle-analyzer'] || deps['webpack-bundle-analyzer'] || deps['source-map-explorer']) return true;
      if (pkg.scripts?.['analyze']) return true;
    } catch { /* ignore */ }
  }
  return false;
}

export function imageOptimizationConfigured(dir: string): boolean {
  // Next.js Image component usage or sharp dep
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['sharp'] || deps['next']) return true; // Next.js has built-in image optimization
    } catch { /* ignore */ }
  }
  return false;
}

// ── Compliance (12-Factor) ──────────────────────────────────────

export function codebaseInVcs(dir: string): boolean {
  return existsSync(join(dir, '.git'));
}

export function depsExplicitlyDeclared(dir: string): boolean {
  return fileExists(dir, 'package.json', 'requirements.txt', 'pyproject.toml', 'go.mod', 'Gemfile', 'Cargo.toml');
}

export function configInEnvVars(dir: string): boolean {
  return fileExists(dir, '.env.example', '.env.template', '.env.sample');
}

export function backingServicesAsUrls(dir: string): boolean {
  const envFile = join(dir, '.env.example');
  if (!existsSync(envFile)) return false;
  const content = readFileSync(envFile, 'utf-8');
  return content.includes('DATABASE_URL') || content.includes('REDIS_URL') || content.includes('_URL=');
}

export function portBinding(dir: string): boolean {
  const envFile = join(dir, '.env.example');
  if (existsSync(envFile)) {
    const content = readFileSync(envFile, 'utf-8');
    if (content.includes('PORT=')) return true;
  }
  return fileExists(dir, 'Dockerfile', 'Procfile');
}

export function devProdParity(dir: string): boolean {
  return fileExists(dir, 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml');
}

export function logsAsStreams(dir: string): boolean {
  // Check that logging goes to stdout (structured logging library implies this)
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['pino'] || deps['winston'] || deps['bunyan']) return true;
    } catch { /* ignore */ }
  }
  if (fileExists(dir, 'requirements.txt')) {
    const content = readFileSync(join(dir, 'requirements.txt'), 'utf-8');
    if (content.includes('structlog') || content.includes('python-json-logger')) return true;
  }
  return false;
}

// ── API Governance ──────────────────────────────────────────────

export function openApiSpecExists(dir: string): boolean {
  return fileExists(dir, 'openapi.yaml', 'openapi.yml', 'openapi.json', 'swagger.yaml', 'swagger.json', 'docs/openapi.yaml');
}

export function apiVersioningDetected(dir: string): boolean {
  const srcDir = join(dir, 'src');
  if (!existsSync(srcDir)) return false;
  // Check for versioned API routes (/v1/, /v2/) or versioning middleware
  try {
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' });
    for (const file of files) {
      const fStr = String(file);
      if (fStr.includes('/v1/') || fStr.includes('/v2/') || fStr.includes('api/v1') || fStr.includes('api/v2')) return true;
    }
  } catch { /* ignore */ }
  return false;
}

export function rateLimitingConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['express-rate-limit'] || deps['rate-limiter-flexible'] || deps['@nestjs/throttler'] || deps['slowapi']) return true;
    } catch { /* ignore */ }
  }
  if (fileExists(dir, 'requirements.txt')) {
    const content = readFileSync(join(dir, 'requirements.txt'), 'utf-8');
    if (content.includes('slowapi') || content.includes('django-ratelimit')) return true;
  }
  return false;
}

// ── Data Governance ─────────────────────────────────────────────

export function privacyPolicyDocumented(dir: string): boolean {
  return fileExists(dir, 'PRIVACY.md', 'docs/privacy.md', 'PRIVACY_POLICY.md');
}

export function dataRetentionDocumented(dir: string): boolean {
  return fileExists(dir, 'docs/data-retention.md', 'docs/data-governance.md', 'DATA_RETENTION.md');
}

export function encryptionLibraryPresent(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['bcrypt'] || deps['bcryptjs'] || deps['argon2'] || deps['crypto-js']) return true;
    } catch { /* ignore */ }
  }
  return false;
}

export function piiHandlingAware(dir: string): boolean {
  // Check if there's a data model or schema mentioning email, phone, ssn etc.
  // indicating awareness of PII fields
  const schemaFiles = ['prisma/schema.prisma', 'src/models', 'src/schemas'];
  for (const f of schemaFiles) {
    const full = join(dir, f);
    if (!existsSync(full)) continue;
    if (existsSync(full) && readFileSync(full, 'utf-8').match(/email|phone|ssn|address|password/i)) return true;
  }
  return false;
}

// ── Code Review ─────────────────────────────────────────────────

export function prTemplateExists(dir: string): boolean {
  return fileExists(dir, '.github/pull_request_template.md', '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/PULL_REQUEST_TEMPLATE/default.md', 'docs/pull_request_template.md');
}

export function codeOwnersExists(dir: string): boolean {
  return fileExists(dir, 'CODEOWNERS', '.github/CODEOWNERS', 'docs/CODEOWNERS');
}

export function issueTemplatesExist(dir: string): boolean {
  return fileExists(dir, '.github/ISSUE_TEMPLATE', '.github/ISSUE_TEMPLATE.md',
    '.github/ISSUE_TEMPLATE/bug_report.md', '.github/ISSUE_TEMPLATE/feature_request.md');
}

export function contributingGuideExists(dir: string): boolean {
  return fileExists(dir, 'CONTRIBUTING.md', 'docs/CONTRIBUTING.md', '.github/CONTRIBUTING.md');
}

export function branchProtectionConfigured(dir: string): boolean {
  // Can't directly check GitHub settings, but detect branch protection patterns
  return fileExists(dir, '.github/branch-protection.yml', 'ruleset.json') ||
    codeOwnersExists(dir); // CODEOWNERS implies review requirements
}

// ── Observability ───────────────────────────────────────────────

export function tracingConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['@opentelemetry/sdk-node'] || deps['@opentelemetry/api'] || deps['dd-trace'] || deps['@sentry/node']) return true;
    } catch { /* ignore */ }
  }
  if (fileExists(dir, 'requirements.txt')) {
    const content = readFileSync(join(dir, 'requirements.txt'), 'utf-8');
    if (content.includes('opentelemetry') || content.includes('sentry-sdk') || content.includes('ddtrace')) return true;
  }
  return false;
}

export function metricsConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['prom-client'] || deps['@opentelemetry/sdk-metrics'] || deps['hot-shots'] || deps['datadog-metrics']) return true;
    } catch { /* ignore */ }
  }
  return false;
}

export function errorTrackingConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['@sentry/node'] || deps['@sentry/nextjs'] || deps['bugsnag'] || deps['@bugsnag/js'] || deps['@rollbar/node']) return true;
    } catch { /* ignore */ }
  }
  return false;
}

// ── Expanded Security ───────────────────────────────────────────

export function vulnerabilityScanningConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.scripts?.['audit'] || pkg.scripts?.['security']) return true;
    } catch { /* ignore */ }
  }
  return fileExists(dir, '.snyk', '.nsprc', '.auditrc');
}

export function securityPolicyDocumented(dir: string): boolean {
  return fileExists(dir, 'SECURITY.md', '.github/SECURITY.md', 'docs/SECURITY.md');
}

// ── Expanded Documentation ──────────────────────────────────────

export function changelogMaintained(dir: string): boolean {
  return fileExists(dir, 'CHANGELOG.md', 'CHANGES.md', 'HISTORY.md');
}

export function architectureDocumented(dir: string): boolean {
  return fileExists(dir, 'docs/architecture.md', 'docs/adr', 'ARCHITECTURE.md', 'docs/c4-model.md');
}

// ── Expanded Testing ────────────────────────────────────────────

export function e2eTestingConfigured(dir: string): boolean {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['playwright'] || deps['@playwright/test'] || deps['cypress'] || deps['puppeteer']) return true;
    } catch { /* ignore */ }
  }
  return fileExists(dir, 'playwright.config.ts', 'cypress.config.ts', 'cypress.config.js');
}

export function loadTestingConfigured(dir: string): boolean {
  return fileExists(dir, 'k6', 'load-test', 'artillery.yml', 'artillery.yaml') ||
    (() => {
      const pkgPath = join(dir, 'package.json');
      if (!existsSync(pkgPath)) return false;
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        return !!(deps['k6'] || deps['artillery'] || deps['autocannon']);
      } catch { return false; }
    })();
}

// ── Clean Code ──────────────────────────────────────────────────

export function typescriptStrictMode(dir: string): boolean {
  const tsconfig = join(dir, 'tsconfig.json');
  if (!existsSync(tsconfig)) return false;
  try {
    const content = readFileSync(tsconfig, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.compilerOptions?.strict === true;
  } catch { return false; }
}

export function noAnyUsage(dir: string): boolean {
  const tsconfig = join(dir, 'tsconfig.json');
  if (!existsSync(tsconfig)) return true; // not a TS project
  try {
    const content = readFileSync(tsconfig, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.compilerOptions?.noImplicitAny === true || parsed.compilerOptions?.strict === true;
  } catch { return true; }
}

export function formatterConfigured(dir: string): boolean {
  return fileExists(
    dir, '.prettierrc', '.prettierrc.json', '.prettierrc.yml', '.prettierrc.js',
    'prettier.config.js', 'prettier.config.mjs', 'biome.json', '.editorconfig',
  );
}

export function conventionalCommitsConfigured(dir: string): boolean {
  return fileExists(dir, 'commitlint.config.js', 'commitlint.config.ts', '.commitlintrc.json', '.commitlintrc.yml');
}

export function testCoverageThreshold(dir: string): boolean {
  for (const f of ['vitest.config.ts', 'vitest.config.js', 'jest.config.ts', 'jest.config.js']) {
    const full = join(dir, f);
    if (!existsSync(full)) continue;
    const content = readFileSync(full, 'utf-8');
    if (content.includes('coverage') && content.includes('threshold')) return true;
  }
  return false;
}

export function noConsoleLogInSrc(dir: string): boolean {
  const srcDir = join(dir, 'src');
  if (!existsSync(srcDir)) return true;
  try {
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' });
    let consoleCount = 0;
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      const content = readFileSync(join(srcDir, String(file)), 'utf-8');
      // Count console.log statements (excluding test files and comments)
      const matches = content.match(/^\s*console\.log\(/gm);
      if (matches) consoleCount += matches.length;
    }
    return consoleCount <= 3; // Allow a few console.log for debugging, flag excessive use
  } catch { return true; }
}
