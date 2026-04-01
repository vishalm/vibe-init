import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const LOGGING_PATTERNS = [
  /from\s+['"]pino['"]/, /require\(['"]pino['"]\)/,
  /from\s+['"]winston['"]/, /require\(['"]winston['"]\)/,
  /import\s+.*structlog/, /from\s+structlog/,
  /log\/slog/, // Go slog
  /import\s+.*log4j/,
  /from\s+['"]bunyan['"]/, /require\(['"]bunyan['"]\)/,
];

export const loggingDetector: Detector = {
  id: 'logging',
  name: 'Structured Logging',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    // Quick check: look at package.json deps
    const pkgPath = join(projectDir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        for (const lib of ['pino', 'winston', 'bunyan']) {
          if (allDeps[lib]) markers.push(`package.json (${lib})`);
        }
      } catch { /* ignore */ }
    }

    // Search src/ for logging imports
    const srcDir = join(projectDir, 'src');
    if (existsSync(srcDir)) {
      searchForLogging(srcDir, markers, 0);
    }

    const detected = markers.length > 0;
    return {
      detectorId: 'logging',
      detected,
      confidence: detected ? 'high' : 'low',
      details: { markers },
      markers,
    };
  },
};

function searchForLogging(dir: string, markers: string[], depth: number): void {
  if (depth > 3) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        searchForLogging(fullPath, markers, depth + 1);
      } else if (/\.(ts|js|py|go)$/.test(entry.name)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          for (const pattern of LOGGING_PATTERNS) {
            if (pattern.test(content)) {
              markers.push(fullPath);
              return;
            }
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}
