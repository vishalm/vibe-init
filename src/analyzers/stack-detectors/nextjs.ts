import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { StackDetection } from '../../types/analysis.js';
import type { StackDetector } from '../detector.js';
import { detectPackageManager, readPackageJson } from './utils.js';

const NEXT_CONFIGS = ['next.config.ts', 'next.config.js', 'next.config.mjs'];

export const nextjsDetector: StackDetector = {
  id: 'nextjs',
  name: 'Next.js',

  detect(projectDir: string): StackDetection | null {
    const configFound = NEXT_CONFIGS.some((f) => existsSync(join(projectDir, f)));
    const pkg = readPackageJson(projectDir);
    const hasDep = pkg !== null && (
      pkg.dependencies?.['next'] !== undefined ||
      pkg.devDependencies?.['next'] !== undefined
    );

    if (!configFound && !hasDep) return null;

    const hasTs = existsSync(join(projectDir, 'tsconfig.json'));
    const language = hasTs ? 'typescript' : 'javascript';
    const packageManager = detectPackageManager(projectDir);

    return {
      stack: 'nextjs',
      framework: 'Next.js',
      language,
      packageManager,
      details: {
        configFile: NEXT_CONFIGS.find((f) => existsSync(join(projectDir, f))) ?? null,
        nextVersion: pkg?.dependencies?.['next'] ?? pkg?.devDependencies?.['next'] ?? 'unknown',
      },
    };
  },
};
