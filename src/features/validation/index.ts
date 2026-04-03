import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { writeFeatureFiles, mergePackageJson, fileExists } from '../base.js';

const ZOD_ENV = `import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}

export const env = validateEnv();
`;

export const validation: FeatureModule = {
  id: 'validation',
  name: 'Environment Validation',
  description: 'Zod-based environment variable validation with type safety',
  category: 'security',
  supportedStacks: ['nextjs', 'node'],
  detect(projectDir) {
    // Check for env validation file specifically (not matching string literals elsewhere)
    if (fileExists(projectDir, 'src/lib/env.ts', 'src/lib/env.js', 'src/config/env.ts', 'src/env.ts')) {
      const candidates = ['src/lib/env.ts', 'src/lib/env.js', 'src/config/env.ts', 'src/env.ts'];
      for (const f of candidates) {
        const fullPath = join(projectDir, f);
        if (existsSync(fullPath)) {
          const content = readFileSync(fullPath, 'utf-8');
          if (content.includes('envSchema') || content.includes('z.object') || content.includes('dotenv-safe')) return true;
        }
      }
    }
    // Also check package.json for dotenv-safe dependency
    const pkgPath = join(projectDir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (allDeps['dotenv-safe'] || allDeps['@t3-oss/env-nextjs'] || allDeps['envalid']) return true;
      } catch { /* ignore */ }
    }
    return false;
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const files = [{ path: 'src/lib/env.ts', content: ZOD_ENV }];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    if (!options.dryRun) {
      mergePackageJson(projectDir, { dependencies: { zod: '^3.24.0' } });
    }
    const instructions = [
      'Run `npm install` then import { env } from "src/lib/env"',
      'Update the envSchema with your actual environment variables',
    ];
    if (skipped.length > 0) instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    return { filesCreated: created, filesModified: ['package.json'], instructions };
  },
};
