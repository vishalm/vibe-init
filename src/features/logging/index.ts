import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { writeFeatureFiles, mergePackageJson } from '../base.js';

const PINO_LOGGER = `import pino from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';

export const logger = pino({
  level,
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
`;

const STRUCTLOG_LOGGER = `import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer()
        if __import__("os").environ.get("ENV") == "development"
        else structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.PrintLoggerFactory(),
)

logger = structlog.get_logger()
`;

/**
 * Scan for actual top-level import/require statements.
 * Uses ^ anchor (multiline) to avoid matching template string content.
 */
function scanForImports(projectDir: string, patterns: string[]): boolean {
  const srcDir = join(projectDir, 'src');
  if (!existsSync(srcDir)) return false;
  // Match only imports at start of line (not embedded in template literals)
  const importRegex = new RegExp(
    `^(?:import\\s.*from\\s+|(?:const|let|var)\\s+\\w+\\s*=\\s*require\\s*\\(\\s*)['"](?:${patterns.join('|')})['"/]`,
    'm',
  );
  try {
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' });
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js') && !file.endsWith('.py')) continue;
      const content = readFileSync(join(srcDir, String(file)), 'utf-8');
      if (importRegex.test(content)) return true;
      // Python: import structlog / from structlog import ...
      if (file.endsWith('.py') && patterns.some((p) => new RegExp(`^(?:import ${p}|from ${p})`, 'm').test(content))) return true;
    }
  } catch { /* ignore read errors */ }
  return false;
}

export const logging: FeatureModule = {
  id: 'logging',
  name: 'Structured Logging',
  description: 'Pino (Node) or structlog (Python) structured logging setup',
  category: 'observability',
  supportedStacks: '*',
  detect(projectDir) {
    return scanForImports(projectDir, ['pino', 'winston', 'structlog']);
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const isPython = options.stack === 'python';
    const files = isPython
      ? [{ path: 'src/lib/logger.py', content: STRUCTLOG_LOGGER }]
      : [{ path: 'src/lib/logger.ts', content: PINO_LOGGER }];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    if (!options.dryRun && !isPython) {
      mergePackageJson(projectDir, {
        dependencies: { pino: '^9.0.0' },
        devDependencies: { 'pino-pretty': '^11.0.0' },
      });
    }
    const instructions = isPython
      ? ['Add structlog to requirements.txt and import logger from src.lib.logger']
      : ['Run `npm install` then import { logger } from "src/lib/logger"'];
    if (skipped.length > 0) instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    return { filesCreated: created, filesModified: isPython ? [] : ['package.json'], instructions };
  },
};
