import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const ENV_PATTERNS = [
  /import.*from\s+['"].*env['"]/, // generic env import
  /z\.object\(/, // Zod schema
  /createEnv\(/, // t3-env
  /dotenv-safe/, // dotenv-safe
  /BaseSettings/, // Pydantic BaseSettings
  /@t3-oss\/env/, // t3-env package
];

export const envValidationDetector: Detector = {
  id: 'env-validation',
  name: 'Environment Validation',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    // Check .env.example presence (weak signal)
    if (existsSync(join(projectDir, '.env.example'))) {
      markers.push('.env.example');
    }

    // Search src/ for env validation patterns
    const srcDir = join(projectDir, 'src');
    if (existsSync(srcDir)) {
      searchDir(srcDir, markers, 0);
    }

    // Also check app/ for Python projects
    const appDir = join(projectDir, 'app');
    if (existsSync(appDir)) {
      searchDir(appDir, markers, 0);
    }

    const hasValidation = markers.some((m) => m !== '.env.example');
    return {
      detectorId: 'env-validation',
      detected: hasValidation,
      confidence: hasValidation ? 'high' : markers.length > 0 ? 'low' : 'low',
      details: { markers },
      markers,
    };
  },
};

function searchDir(dir: string, markers: string[], depth: number): void {
  if (depth > 3) return; // Limit recursion
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        searchDir(fullPath, markers, depth + 1);
      } else if (/\.(ts|js|py)$/.test(entry.name)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          for (const pattern of ENV_PATTERNS) {
            if (pattern.test(content)) {
              markers.push(fullPath);
              return; // One match per file is enough
            }
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}
