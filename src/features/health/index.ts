import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { writeFeatureFiles } from '../base.js';

const NEXTJS_HEALTH = `import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
`;

const EXPRESS_HEALTH = `import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
`;

function findHealthRoute(projectDir: string): boolean {
  const searchDirs = ['src', 'app', 'pages', 'routes'];
  for (const dir of searchDirs) {
    const fullDir = join(projectDir, dir);
    if (!existsSync(fullDir)) continue;
    try {
      const files = readdirSync(fullDir, { recursive: true, encoding: 'utf-8' });
      for (const file of files) {
        if (!String(file).endsWith('.ts') && !String(file).endsWith('.js')) continue;
        const content = readFileSync(join(fullDir, String(file)), 'utf-8');
        if (content.includes('/health') || content.includes('/api/health')) return true;
      }
    } catch { /* ignore */ }
  }
  return false;
}

export const health: FeatureModule = {
  id: 'health',
  name: 'Health Check Endpoint',
  description: 'Health check API endpoint appropriate to your framework',
  category: 'infrastructure',
  supportedStacks: '*',
  detect(projectDir) {
    return findHealthRoute(projectDir);
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const isNextjs = options.stack === 'nextjs';
    const files = isNextjs
      ? [{ path: 'src/app/api/health/route.ts', content: NEXTJS_HEALTH }]
      : [{ path: 'src/routes/health.ts', content: EXPRESS_HEALTH }];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    const instructions = isNextjs
      ? ['Health endpoint available at GET /api/health']
      : ['Import and mount the health router in your Express app'];
    if (skipped.length > 0) instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    return { filesCreated: created, filesModified: [], instructions };
  },
};
