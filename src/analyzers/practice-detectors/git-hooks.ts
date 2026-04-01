import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

export const gitHooksDetector: Detector = {
  id: 'git-hooks',
  name: 'Git Hooks',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    // Husky
    if (existsSync(join(projectDir, '.husky'))) {
      markers.push('.husky/');
    }

    // pre-commit (Python ecosystem)
    if (existsSync(join(projectDir, '.pre-commit-config.yaml'))) {
      markers.push('.pre-commit-config.yaml');
    }

    // lefthook
    if (existsSync(join(projectDir, 'lefthook.yml'))) {
      markers.push('lefthook.yml');
    }

    // Raw git hooks
    if (existsSync(join(projectDir, '.git', 'hooks', 'pre-commit'))) {
      markers.push('.git/hooks/pre-commit');
    }

    // lint-staged config
    if (existsSync(join(projectDir, '.lintstagedrc'))) {
      markers.push('.lintstagedrc');
    }
    if (existsSync(join(projectDir, '.lintstagedrc.json'))) {
      markers.push('.lintstagedrc.json');
    }

    const detected = markers.length > 0;
    return {
      detectorId: 'git-hooks',
      detected,
      confidence: detected ? 'high' : 'low',
      details: { markers },
      markers,
    };
  },
};
