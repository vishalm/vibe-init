import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { StackDetection } from '../../types/analysis.js';
import type { StackDetector } from '../detector.js';

export const pythonFastapiDetector: StackDetector = {
  id: 'python-fastapi',
  name: 'Python/FastAPI',

  detect(projectDir: string): StackDetection | null {
    let fastapiFound = false;
    const markers: string[] = [];

    // Check pyproject.toml
    const pyprojectPath = join(projectDir, 'pyproject.toml');
    if (existsSync(pyprojectPath)) {
      try {
        const content = readFileSync(pyprojectPath, 'utf-8');
        if (content.includes('fastapi')) {
          fastapiFound = true;
          markers.push('pyproject.toml');
        }
      } catch { /* ignore */ }
    }

    // Check requirements.txt
    const requirementsPath = join(projectDir, 'requirements.txt');
    if (existsSync(requirementsPath)) {
      try {
        const content = readFileSync(requirementsPath, 'utf-8');
        if (content.includes('fastapi')) {
          fastapiFound = true;
          markers.push('requirements.txt');
        }
      } catch { /* ignore */ }
    }

    if (!fastapiFound) return null;

    // Detect package manager
    let packageManager = 'pip';
    if (existsSync(join(projectDir, 'poetry.lock'))) packageManager = 'poetry';
    else if (existsSync(join(projectDir, 'uv.lock'))) packageManager = 'uv';
    else if (existsSync(join(projectDir, 'Pipfile.lock'))) packageManager = 'pipenv';

    return {
      stack: 'python-fastapi',
      framework: 'FastAPI',
      language: 'python',
      packageManager,
      details: { markers },
    };
  },
};
