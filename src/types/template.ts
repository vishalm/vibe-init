import type { EnrichmentBrief } from './enrichment.js';

export interface TemplateContext {
  projectName: string;
  projectSlug: string;
  brief: EnrichmentBrief;
  adr: string;
  timestamp: string;
  dbName: string;
  /** Stack identifier for multi-stack support */
  stack?: string;
  /** Additional stack-specific context */
  [key: string]: unknown;
}

export interface TemplateManifestEntry {
  /** Relative path within the template directory (e.g., "package.json.ejs") */
  source: string;
  /** Relative output path in the generated project (e.g., "package.json") */
  output: string;
  /** Optional condition — if false, skip this file */
  condition?: (ctx: TemplateContext) => boolean;
}

export interface RenderedFile {
  path: string;
  content: string;
}

export interface StackDefinition {
  id: string;
  name: string;
  description: string;
  language: string;
  /** Relative path to the stack's template directory */
  templateDir: string;
  /** The manifest entries for this stack */
  manifest: TemplateManifestEntry[];
}
