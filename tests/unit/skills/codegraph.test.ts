import { describe, it, expect } from 'vitest';
import {
  CODEGRAPH_CLAUDE_MD_SECTION,
  CODEGRAPH_MCP_PERMISSIONS,
  CODEGRAPH_SECTION_END,
  CODEGRAPH_SECTION_START,
  CODEGRAPH_SKILL,
  injectCodegraphSection,
} from '../../../src/skills/codegraph.js';

describe('CodeGraph skill module', () => {
  it('section is fenced with markers compatible with the codegraph installer', () => {
    expect(CODEGRAPH_CLAUDE_MD_SECTION.startsWith(CODEGRAPH_SECTION_START)).toBe(true);
    expect(CODEGRAPH_CLAUDE_MD_SECTION.endsWith(CODEGRAPH_SECTION_END)).toBe(true);
  });

  it('skill content references the lightweight MCP tool surface', () => {
    expect(CODEGRAPH_SKILL).toContain('codegraph_search');
    expect(CODEGRAPH_SKILL).toContain('codegraph_callers');
    expect(CODEGRAPH_SKILL).toContain('codegraph_impact');
    // Forbids calling the heavy tools from the main session.
    expect(CODEGRAPH_SKILL).toContain('codegraph_explore');
  });

  it('exposes the canonical mcp__codegraph__* permission strings', () => {
    expect(CODEGRAPH_MCP_PERMISSIONS).toContain('mcp__codegraph__codegraph_search');
    expect(CODEGRAPH_MCP_PERMISSIONS).toContain('mcp__codegraph__codegraph_status');
    for (const p of CODEGRAPH_MCP_PERMISSIONS) {
      expect(p.startsWith('mcp__codegraph__codegraph_')).toBe(true);
    }
  });
});

describe('injectCodegraphSection', () => {
  it('appends the section when none is present', () => {
    const before = '# Project\n\nSome content.';
    const out = injectCodegraphSection(before);
    expect(out.startsWith('# Project')).toBe(true);
    expect(out).toContain(CODEGRAPH_SECTION_START);
    expect(out).toContain(CODEGRAPH_SECTION_END);
    expect(out).toContain('## CodeGraph');
  });

  it('replaces an existing marked section in place (idempotent)', () => {
    const before = `# Project\n\n${CODEGRAPH_SECTION_START}\nstale content\n${CODEGRAPH_SECTION_END}\n\n## After`;
    const out = injectCodegraphSection(before);
    expect(out).not.toContain('stale content');
    expect(out).toContain(CODEGRAPH_SECTION_START);
    expect(out).toContain('## After');
    // The "## After" header is preserved and not duplicated.
    expect(out.match(/## After/g) ?? []).toHaveLength(1);
  });

  it('is idempotent: running twice yields the same result', () => {
    const seed = '# Project\n\nBody.';
    const once = injectCodegraphSection(seed);
    const twice = injectCodegraphSection(once);
    expect(twice).toBe(once);
  });
});
