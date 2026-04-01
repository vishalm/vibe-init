import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { fileExists, writeFeatureFiles, mergePackageJson } from '../base.js';

const VITEST_CONFIG = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
`;

const TEST_SETUP = `// Global test setup
// Add shared test utilities, mocks, or environment configuration here
`;

const SAMPLE_TEST = `import { describe, it, expect } from 'vitest';

describe('example', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
`;

export const testing: FeatureModule = {
  id: 'testing',
  name: 'Test Framework',
  description: 'Vitest configuration with sample test and setup file',
  category: 'quality',
  supportedStacks: ['nextjs', 'node'],
  detect(projectDir) {
    return fileExists(
      projectDir,
      'vitest.config.ts', 'vitest.config.js', 'vitest.config.mts',
      'jest.config.ts', 'jest.config.js', 'jest.config.mjs',
      'pytest.ini', 'pyproject.toml'
    );
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const files = [
      { path: 'vitest.config.ts', content: VITEST_CONFIG },
      { path: '__tests__/setup.ts', content: TEST_SETUP },
      { path: '__tests__/example.test.ts', content: SAMPLE_TEST },
    ];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    if (!options.dryRun) {
      mergePackageJson(projectDir, {
        devDependencies: { vitest: '^3.0.0', '@vitest/coverage-v8': '^3.0.0' },
        scripts: { test: 'vitest run', 'test:watch': 'vitest', 'test:coverage': 'vitest run --coverage' },
      });
    }
    const instructions = ['Run `npm install` then `npm test` to verify.'];
    if (skipped.length > 0) instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    return { filesCreated: created, filesModified: ['package.json'], instructions };
  },
};
