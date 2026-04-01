import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { fileExists, writeFeatureFiles, mergePackageJson } from '../base.js';

const PRE_COMMIT = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install lint-staged
`;

const COMMITLINT_CONFIG = `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'],
    ],
    'subject-max-length': [2, 'always', 72],
  },
};
`;

export const hooks: FeatureModule = {
  id: 'hooks',
  name: 'Git Hooks',
  description: 'Husky pre-commit hooks with commitlint and lint-staged',
  category: 'quality',
  supportedStacks: ['nextjs', 'node'],
  detect(projectDir) {
    return fileExists(projectDir, '.husky', '.pre-commit-config.yaml');
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const files = [
      { path: '.husky/pre-commit', content: PRE_COMMIT },
      { path: 'commitlint.config.js', content: COMMITLINT_CONFIG },
    ];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    if (!options.dryRun) {
      mergePackageJson(projectDir, {
        devDependencies: {
          husky: '^9.0.0',
          'lint-staged': '^15.0.0',
          '@commitlint/cli': '^19.0.0',
          '@commitlint/config-conventional': '^19.0.0',
        },
        scripts: { prepare: 'husky' },
      });
    }
    const instructions = [
      'Run `npm install` then `npx husky init` to activate hooks',
      'Configure lint-staged in package.json to run your linter on staged files',
    ];
    if (skipped.length > 0) instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    return { filesCreated: created, filesModified: ['package.json'], instructions };
  },
};
