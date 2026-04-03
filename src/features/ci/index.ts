import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { fileExists, writeFeatureFiles } from '../base.js';

const CI_YML = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
`;

export const ci: FeatureModule = {
  id: 'ci',
  name: 'CI/CD Pipeline',
  description: 'GitHub Actions CI workflow with lint, test, and build steps',
  category: 'infrastructure',
  supportedStacks: '*',
  detect(projectDir) {
    // GitHub Actions
    const workflowDir = join(projectDir, '.github', 'workflows');
    if (existsSync(workflowDir)) {
      const files = readdirSync(workflowDir);
      if (files.some((f) => f.endsWith('.yml') || f.endsWith('.yaml'))) return true;
    }
    // GitLab CI, CircleCI
    if (fileExists(projectDir, '.gitlab-ci.yml', '.circleci/config.yml')) return true;
    return false;
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const files = [{ path: '.github/workflows/ci.yml', content: CI_YML }];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    const instructions = ['CI workflow created. Push to GitHub to trigger it.'];
    if (skipped.length > 0) {
      instructions.push(`Skipped existing: ${skipped.join(', ')}`);
    }
    return { filesCreated: created, filesModified: [], instructions };
  },
};
