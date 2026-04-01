import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const LINT_FILES = [
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml',
  'eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts',
  'biome.json', 'biome.jsonc',
  '.flake8',
  '.golangci.yml', '.golangci.yaml',
  '.prettierrc', '.prettierrc.js', '.prettierrc.json',
];

export const lintingDetector: Detector = {
  id: 'linting',
  name: 'Linting',

  detect(projectDir: string): DetectionResult {
    const found = LINT_FILES.filter((f) => existsSync(join(projectDir, f)));
    const detected = found.length > 0;

    return {
      detectorId: 'linting',
      detected,
      confidence: detected ? 'high' : 'low',
      details: { files: found },
      markers: found,
    };
  },
};
