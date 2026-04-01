import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

export const ciDetector: Detector = {
  id: 'ci',
  name: 'CI/CD',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    // GitHub Actions
    const ghWorkflowDir = join(projectDir, '.github', 'workflows');
    if (existsSync(ghWorkflowDir)) {
      try {
        const files = readdirSync(ghWorkflowDir).filter(
          (f) => f.endsWith('.yml') || f.endsWith('.yaml')
        );
        if (files.length > 0) {
          markers.push(...files.map((f) => `.github/workflows/${f}`));
        }
      } catch { /* ignore */ }
    }

    // GitLab CI
    if (existsSync(join(projectDir, '.gitlab-ci.yml'))) {
      markers.push('.gitlab-ci.yml');
    }

    // CircleCI
    if (existsSync(join(projectDir, '.circleci', 'config.yml'))) {
      markers.push('.circleci/config.yml');
    }

    const detected = markers.length > 0;
    return {
      detectorId: 'ci',
      detected,
      confidence: detected ? 'high' : 'low',
      details: { providers: markers },
      markers,
    };
  },
};
