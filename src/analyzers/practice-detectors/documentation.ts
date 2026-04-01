import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectionResult } from '../../types/analysis.js';
import type { Detector } from '../detector.js';

const DOC_FILES = [
  { path: 'README.md', label: 'README.md' },
  { path: 'README', label: 'README' },
  { path: 'CLAUDE.md', label: 'CLAUDE.md' },
  { path: 'docs/adr', label: 'docs/adr/' },
  { path: 'CONTRIBUTING.md', label: 'CONTRIBUTING.md' },
  { path: 'CHANGELOG.md', label: 'CHANGELOG.md' },
];

export const documentationDetector: Detector = {
  id: 'documentation',
  name: 'Documentation',

  detect(projectDir: string): DetectionResult {
    const markers: string[] = [];

    for (const doc of DOC_FILES) {
      if (existsSync(join(projectDir, doc.path))) {
        markers.push(doc.label);
      }
    }

    const hasReadme = markers.some((m) => m.startsWith('README'));
    const detected = hasReadme;

    return {
      detectorId: 'documentation',
      detected,
      confidence: markers.length >= 3 ? 'high' : detected ? 'medium' : 'low',
      details: { files: markers },
      markers,
    };
  },
};
