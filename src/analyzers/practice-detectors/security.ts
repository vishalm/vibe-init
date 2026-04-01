import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

export const securityDetector: Detector = {
  id: 'security',
  name: 'Security Basics',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];
    const issues: string[] = [];

    // Check .gitignore exists
    const gitignorePath = join(projectDir, '.gitignore');
    if (existsSync(gitignorePath)) {
      markers.push('.gitignore');

      // Check that .env is in .gitignore
      try {
        const content = readFileSync(gitignorePath, 'utf-8');
        const lines = content.split('\n').map((l) => l.trim());
        const hasEnvIgnore = lines.some(
          (l) => l === '.env' || l === '.env*' || l === '.env.local' || l === '*.env'
        );
        if (hasEnvIgnore) {
          markers.push('.gitignore includes .env');
        } else {
          issues.push('.gitignore does not exclude .env files');
        }
      } catch { /* ignore */ }
    } else {
      issues.push('No .gitignore found');
    }

    // Check no .env files are present (they may be committed)
    try {
      const rootFiles = readdirSync(projectDir);
      const envFiles = rootFiles.filter(
        (f) => f === '.env' || (f.startsWith('.env.') && f !== '.env.example' && f !== '.env.template')
      );
      if (envFiles.length > 0) {
        issues.push(`Potential secret files found: ${envFiles.join(', ')}`);
      }
    } catch { /* ignore */ }

    const detected = markers.length > 0 && issues.length === 0;
    return {
      detectorId: 'security',
      detected,
      confidence: markers.length > 0 ? 'high' : 'low',
      details: { markers, issues },
      markers,
    };
  },
};
