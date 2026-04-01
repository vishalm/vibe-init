import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const HEALTH_PATTERNS = [
  /['"]\/health['"]/, /['"]\/api\/health['"]/,
  /['"]\/healthz['"]/, /['"]\/api\/healthz['"]/,
  /['"]\/readyz['"]/, /['"]\/livez['"]/,
  /health\.route/, /health_check/,
];

export const healthCheckDetector: Detector = {
  id: 'health-check',
  name: 'Health Check Endpoint',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    // Check for Next.js health route
    const healthRoute = join(projectDir, 'src', 'app', 'api', 'health', 'route.ts');
    if (existsSync(healthRoute)) markers.push('src/app/api/health/route.ts');

    const healthRouteJs = join(projectDir, 'src', 'app', 'api', 'health', 'route.js');
    if (existsSync(healthRouteJs)) markers.push('src/app/api/health/route.js');

    // Search src/ for health patterns
    const srcDir = join(projectDir, 'src');
    if (existsSync(srcDir)) {
      searchForHealth(srcDir, markers, 0);
    }

    // Also check app/ for Python projects
    const appDir = join(projectDir, 'app');
    if (existsSync(appDir)) {
      searchForHealth(appDir, markers, 0);
    }

    // Check root main.go or main.py
    for (const f of ['main.go', 'main.py']) {
      const p = join(projectDir, f);
      if (existsSync(p)) {
        try {
          const content = readFileSync(p, 'utf-8');
          if (HEALTH_PATTERNS.some((pat) => pat.test(content))) {
            markers.push(f);
          }
        } catch { /* ignore */ }
      }
    }

    const detected = markers.length > 0;
    return {
      detectorId: 'health-check',
      detected,
      confidence: detected ? 'high' : 'low',
      details: { markers },
      markers,
    };
  },
};

function searchForHealth(dir: string, markers: string[], depth: number): void {
  if (depth > 4) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        searchForHealth(fullPath, markers, depth + 1);
      } else if (/\.(ts|js|py|go)$/.test(entry.name)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          if (HEALTH_PATTERNS.some((pat) => pat.test(content))) {
            markers.push(fullPath);
          }
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}
