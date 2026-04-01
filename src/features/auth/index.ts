import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';

function scanForAuthImports(projectDir: string): boolean {
  const srcDir = join(projectDir, 'src');
  if (!existsSync(srcDir)) return false;
  const authPatterns = ['next-auth', '@clerk', 'passport', '@auth/'];
  try {
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf-8' });
    for (const file of files) {
      if (!String(file).endsWith('.ts') && !String(file).endsWith('.js')) continue;
      const content = readFileSync(join(srcDir, String(file)), 'utf-8');
      if (authPatterns.some((p) => content.includes(p))) return true;
    }
  } catch { /* ignore */ }
  return false;
}

export const auth: FeatureModule = {
  id: 'auth',
  name: 'Authentication',
  description: 'Auth setup guidance — NextAuth, Clerk, or Passport recommendations',
  category: 'security',
  supportedStacks: '*',
  detect(projectDir) {
    return scanForAuthImports(projectDir);
  },
  async apply(_projectDir, _options: FeatureApplyOptions): Promise<ApplyResult> {
    const instructions = [
      'Auth requires project-specific decisions. Recommended options:',
      '  - NextAuth.js: `npm install next-auth` for Next.js apps',
      '  - Clerk: `npm install @clerk/nextjs` for managed auth',
      '  - Passport: `npm install passport` for Express apps',
      'Use `vibe run "add authentication with <provider>"` for Claude-assisted setup',
    ];
    return { filesCreated: [], filesModified: [], instructions };
  },
};
