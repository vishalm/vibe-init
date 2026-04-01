import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { StackDetection } from '../../types/analysis.js';
import type { StackDetector } from '../detector.js';
import { detectPackageManager, readPackageJson } from './utils.js';

export const genericNodeDetector: StackDetector = {
  id: 'generic-node',
  name: 'Generic Node.js',

  detect(projectDir: string): StackDetection | null {
    const pkg = readPackageJson(projectDir);
    if (!pkg) return null;

    const hasTs = existsSync(join(projectDir, 'tsconfig.json'));
    const language = hasTs ? 'typescript' : 'javascript';
    const packageManager = detectPackageManager(projectDir);

    // Try to detect a framework from dependencies
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    let framework = 'Node.js';
    if (deps['express']) framework = 'Express';
    else if (deps['fastify']) framework = 'Fastify';
    else if (deps['koa']) framework = 'Koa';
    else if (deps['hono']) framework = 'Hono';
    else if (deps['nestjs'] || deps['@nestjs/core']) framework = 'NestJS';

    return {
      stack: 'generic-node',
      framework,
      language,
      packageManager,
      details: {
        name: pkg.name ?? 'unknown',
        detectedFramework: framework,
      },
    };
  },
};
