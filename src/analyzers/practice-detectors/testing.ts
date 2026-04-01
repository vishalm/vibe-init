import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const TEST_CONFIGS = [
  'vitest.config.ts', 'vitest.config.js', 'vitest.config.mts',
  'jest.config.ts', 'jest.config.js', 'jest.config.mjs',
  'pytest.ini', 'conftest.py', 'setup.cfg',
];

export const testingDetector: Detector = {
  id: 'testing',
  name: 'Testing',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    // Check config files
    for (const cfg of TEST_CONFIGS) {
      if (existsSync(join(projectDir, cfg))) markers.push(cfg);
    }

    // Check __tests__ directory
    if (existsSync(join(projectDir, '__tests__'))) markers.push('__tests__/');

    // Check test/ or tests/ directory
    if (existsSync(join(projectDir, 'test'))) markers.push('test/');
    if (existsSync(join(projectDir, 'tests'))) markers.push('tests/');

    // Check for Go test files in root
    try {
      const rootFiles = readdirSync(projectDir);
      const goTests = rootFiles.filter((f) => f.endsWith('_test.go'));
      if (goTests.length > 0) markers.push(...goTests);
    } catch { /* ignore */ }

    const detected = markers.length > 0;
    return {
      detectorId: 'testing',
      detected,
      confidence: detected ? 'high' : 'low',
      details: { markers },
      markers,
    };
  },
};
