import { readFileSync, existsSync } from 'node:fs';
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
  // Check for health route files by path convention
  const healthPaths = [
    'src/app/api/health/route.ts', 'src/app/api/health/route.js',
    'src/routes/health.ts', 'src/routes/health.js',
    'app/api/health/route.ts', 'app/api/health/route.js',
    'pages/api/health.ts', 'pages/api/health.js',
    'routes/health.ts', 'routes/health.js',
  ];
  for (const p of healthPaths) {
    if (existsSync(join(projectDir, p))) return true;
  }
  // Fallback: check for health route in main app/server files
  const serverFiles = ['src/index.ts', 'src/index.js', 'src/app.ts', 'src/app.js', 'src/server.ts', 'src/server.js'];
  for (const f of serverFiles) {
    const fullPath = join(projectDir, f);
    if (!existsSync(fullPath)) continue;
    const content = readFileSync(fullPath, 'utf-8');
    // Match route definitions like .get('/health' or router.get('/api/health'
    if (/\.\s*get\s*\(\s*['"]\/(?:api\/)?health['"]/.test(content)) return true;
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
