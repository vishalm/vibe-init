import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { StackDetection } from '../../types/analysis.js';
import type { StackDetector } from '../detector.js';

const GO_FRAMEWORKS: Record<string, string> = {
  'github.com/gin-gonic/gin': 'Gin',
  'github.com/labstack/echo': 'Echo',
  'github.com/gofiber/fiber': 'Fiber',
  'github.com/gorilla/mux': 'Gorilla Mux',
  'github.com/go-chi/chi': 'Chi',
  'net/http': 'net/http (stdlib)',
};

export const goDetector: StackDetector = {
  id: 'go',
  name: 'Go',

  detect(projectDir: string): StackDetection | null {
    const goModPath = join(projectDir, 'go.mod');
    if (!existsSync(goModPath)) return null;

    let framework = 'Go (stdlib)';
    const details: Record<string, unknown> = {};

    try {
      const content = readFileSync(goModPath, 'utf-8');
      for (const [mod, name] of Object.entries(GO_FRAMEWORKS)) {
        if (content.includes(mod)) {
          framework = name;
          details.frameworkModule = mod;
          break;
        }
      }
      // Extract module name
      const moduleMatch = content.match(/^module\s+(.+)$/m);
      if (moduleMatch) details.moduleName = moduleMatch[1].trim();
    } catch { /* ignore */ }

    return {
      stack: 'go',
      framework,
      language: 'go',
      packageManager: 'go modules',
      details,
    };
  },
};
