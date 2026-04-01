import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const DOCKER_FILES = [
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'compose.yml',
  'compose.yaml',
];

export const dockerDetector: Detector = {
  id: 'docker',
  name: 'Docker',

  detect(projectDir: string): DetectionResult {
    const found = DOCKER_FILES.filter((f) => existsSync(join(projectDir, f)));
    const detected = found.length > 0;

    return {
      detectorId: 'docker',
      detected,
      confidence: found.includes('Dockerfile') ? 'high' : detected ? 'medium' : 'low',
      details: { files: found },
      markers: found,
    };
  },
};
