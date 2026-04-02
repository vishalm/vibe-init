import ejs from 'ejs';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TemplateRenderError } from '../utils/errors.js';
import type { TemplateManifestEntry, TemplateContext, RenderedFile } from '../types/template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolves the base directory for templates.
 * After esbuild bundles into build/index.js, __dirname is build/ so we need
 * to add the 'templates' segment. In dev, __dirname is already src/templates/.
 */
function getTemplatesBaseDir(): string {
  // In build: __dirname is build/ (index.js lives there), templates are at build/templates/
  // In dev: __dirname is src/templates/ (this file lives there)
  const templatesSubdir = join(__dirname, 'templates');
  if (existsSync(join(templatesSubdir, 'stacks'))) {
    return templatesSubdir;
  }
  // Dev mode: __dirname is already the templates directory
  return __dirname;
}

/**
 * Resolves the path to a stack's template directory.
 * In build: build/templates/stacks/<stackId>/
 * In src: src/templates/stacks/<stackId>/
 */
export function getStackTemplatesDir(stackId: string): string {
  return join(getTemplatesBaseDir(), 'stacks', stackId);
}

/**
 * Resolves the path to a feature's template directory.
 */
export function getFeatureTemplatesDir(featureId: string): string {
  // In build: build/features/<id>/templates/
  // In dev: src/features/<id>/templates/ (__dirname is src/templates/, so go up one level)
  const buildPath = join(__dirname, 'features', featureId, 'templates');
  if (existsSync(buildPath)) {
    return buildPath;
  }
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
