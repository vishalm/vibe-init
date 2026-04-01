import { showBanner } from '../ui/banner.js';
import { promptIdea, promptProjectName } from '../ui/prompts.js';
import { slugify } from '../utils/fs.js';

export interface IgnitionResult {
  idea: string;
  projectName: string;
  projectSlug: string;
}

export async function runIgnition(version: string): Promise<IgnitionResult> {
  showBanner(version);

  const idea = await promptIdea();

  // Suggest a project name from the first few words of the idea
  const suggestedName = idea
    .split(/\s+/)
    .slice(0, 3)
    .join(' ')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();

  const projectName = await promptProjectName(suggestedName || 'my-project');
  const projectSlug = slugify(projectName);

  return { idea, projectName, projectSlug };
}
