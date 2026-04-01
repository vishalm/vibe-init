import type { FeatureModule, FeatureApplyOptions, ApplyResult } from '../../types/feature.js';
import { fileExists, writeFeatureFiles } from '../base.js';
import { dockerfileFor, composeFor } from './templates.js';

export const docker: FeatureModule = {
  id: 'docker',
  name: 'Docker',
  description: 'Dockerfile + docker-compose.yml with stack-appropriate defaults',
  category: 'infrastructure',
  supportedStacks: '*',
  detect(projectDir) {
    return fileExists(projectDir, 'Dockerfile', 'docker-compose.yml');
  },
  async apply(projectDir, options: FeatureApplyOptions): Promise<ApplyResult> {
    const files = [
      { path: 'Dockerfile', content: dockerfileFor(options.stack) },
      { path: 'docker-compose.yml', content: composeFor(options.stack) },
    ];
    const { created, skipped } = writeFeatureFiles(projectDir, files, options.force);
    const instructions = ['Run `docker-compose up` to start your services'];
    if (skipped.length > 0) {
      instructions.push(`Skipped existing: ${skipped.join(', ')} (use --force to overwrite)`);
    }
    return { filesCreated: created, filesModified: [], instructions };
  },
};
