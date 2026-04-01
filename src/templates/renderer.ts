import ejs from 'ejs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TemplateRenderError } from '../utils/errors.js';
import type { TemplateManifestEntry, TemplateContext, RenderedFile } from '../types/template.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolves the path to a stack's template directory.
 * In build: build/templates/stacks/<stackId>/
 * In src: src/templates/stacks/<stackId>/
 */
export function getStackTemplatesDir(stackId: string): string {
  return join(__dirname, 'stacks', stackId);
}

/**
 * Resolves the path to a feature's template directory.
 */
export function getFeatureTemplatesDir(featureId: string): string {
  // Features live in src/features/<id>/templates/ at dev time
  // and build/features/<id>/templates/ at runtime
  return join(__dirname, '..', 'features', featureId, 'templates');
}

/**
 * Renders templates from a given directory with the given manifest and context.
 * Returns an array of rendered files (path + content) — does NOT write to disk.
 */
export function renderTemplates(
  manifest: TemplateManifestEntry[],
  context: TemplateContext,
  templatesDir: string
): RenderedFile[] {
  const renderedFiles: RenderedFile[] = [];

  for (const entry of manifest) {
    // Check condition
    if (entry.condition && !entry.condition(context)) {
      continue;
    }

    const sourcePath = join(templatesDir, entry.source);

    try {
      const template = readFileSync(sourcePath, 'utf-8');
      const rendered = ejs.render(template, context, {
        filename: sourcePath, // For EJS error reporting
      });
      renderedFiles.push({
        path: entry.output,
        content: rendered,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new TemplateRenderError(entry.source, message);
    }
  }

  return renderedFiles;
}
