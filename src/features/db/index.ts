import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { fileExists, writeFeatureFiles, mergePackageJson } from '../base.js';
import { PRISMA_SCHEMA, DB_CLIENT } from './templates.js';

function scanForDbImports(projectDir: string): boolean {
  const srcDir = join(projectDir, 'src');
  if (!existsSync(srcDir)) return false;
  const patterns = ['@prisma/client', 'sqlalchemy', 'drizzle-orm'];
  const importRegex = new RegExp(
    `^(?:import\\s.*from\\s+|(?:const|let|var)\\s+\\w+\\s*=\\s*require\\s*\\(\\s*)['"](?:${patterns.map((p) => p.replace('/', '\\/')).join('|')})`,
    'm',
  );
  try {
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' });
    for (const file of files) {
      if (!String(file).endsWith('.ts') && !String(file).endsWith('.js')) continue;
      const content = readFileSync(join(srcDir, String(file)), 'utf-8');
      if (importRegex.test(content)) return true;
    }
  } catch { /* ignore */ }
  return false;
}

export const db: FeatureModule = {
  id: 'db',
  name: 'Database (Prisma)',
  description: 'Prisma schema + client setup with PostgreSQL',
  category: 'infrastructure',
  supportedStacks: ['nextjs', 'node'],
  detect(projectDir) {
    return fileExists(projectDir, 'prisma/schema.prisma') || scanForDbImports(projectDir);
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const files = [
      { path: 'prisma/schema.prisma', content: PRISMA_SCHEMA },
      { path: 'src/lib/db.ts', content: DB_CLIENT },
    ];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    if (!options.dryRun) {
      mergePackageJson(projectDir, {
        dependencies: { '@prisma/client': '^6.0.0' },
        devDependencies: { prisma: '^6.0.0' },
        scripts: { 'db:generate': 'prisma generate', 'db:push': 'prisma db push', 'db:migrate': 'prisma migrate dev' },
      });
    }
    const instructions = [
      'Run `npm install` then `npx prisma generate`',
      'Set DATABASE_URL in .env',
    ];
    if (skipped.length > 0) instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    return { filesCreated: created, filesModified: ['package.json'], instructions };
  },
};
