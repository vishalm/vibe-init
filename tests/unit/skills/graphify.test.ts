import { describe, it, expect } from 'vitest';
import {
  GRAPHIFY_CLAUDE_MD_SECTION,
  GRAPHIFY_SECTION_END,
  GRAPHIFY_SECTION_START,
  GRAPHIFY_SKILL,
  injectGraphifySection,
} from '../../../src/skills/graphify.js';

describe('Graphify skill module', () => {
  it('section is fenced with markers compatible with the graphify installer', () => {
    expect(GRAPHIFY_CLAUDE_MD_SECTION.startsWith(GRAPHIFY_SECTION_START)).toBe(true);
    expect(GRAPHIFY_CLAUDE_MD_SECTION.endsWith(GRAPHIFY_SECTION_END)).toBe(true);
  });

  it('skill content references the canonical graphify subcommands', () => {
    expect(GRAPHIFY_SKILL).toContain('vibe graphify query');
    expect(GRAPHIFY_SKILL).toContain('vibe graphify path');
    expect(GRAPHIFY_SKILL).toContain('vibe graphify explain');
    expect(GRAPHIFY_SKILL).toContain('vibe graphify stats');
    expect(GRAPHIFY_SKILL).toContain('GRAPH_REPORT.md');
  });

  it('skill content surfaces confidence tagging guidance', () => {
    expect(GRAPHIFY_SKILL).toContain('EXTRACTED');
    expect(GRAPHIFY_SKILL).toContain('INFERRED');
    expect(GRAPHIFY_SKILL).toContain('AMBIGUOUS');
  });

  it('skill content distinguishes graphify from codegraph', () => {
    expect(GRAPHIFY_SKILL).toContain('CodeGraph');
    expect(GRAPHIFY_SKILL).toContain('Cross-modal');
  });
});

describe('injectGraphifySection', () => {
  it('appends the section when none is present', () => {
    const before = '# Project\n\nSome content.';
    const out = injectGraphifySection(before);
    expect(out.startsWith('# Project')).toBe(true);
    expect(out).toContain(GRAPHIFY_SECTION_START);
    expect(out).toContain(GRAPHIFY_SECTION_END);
    expect(out).toContain('## Graphify');
  });

  it('replaces an existing marked section in place (idempotent)', () => {
    const before = `# Project\n\n${GRAPHIFY_SECTION_START}\nstale content\n${GRAPHIFY_SECTION_END}\n\n## After`;
    const out = injectGraphifySection(before);
    expect(out).not.toContain('stale content');
    expect(out).toContain(GRAPHIFY_SECTION_START);
    expect(out).toContain('## After');
    expect(out.match(/## After/g) ?? []).toHaveLength(1);
  });

  it('is idempotent: running twice yields the same result', () => {
    const seed = '# Project\n\nBody.';
    const once = injectGraphifySection(seed);
    const twice = injectGraphifySection(once);
    expect(twice).toBe(once);
  });
});
