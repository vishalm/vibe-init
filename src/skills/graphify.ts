/**
 * ai-graphify integration helpers for `vibe init`.
 *
 * Inject a deterministic Graphify section into the generated CLAUDE.md and a
 * matching `.claude/commands/graphify.md` skill so Claude Code knows when to
 * consult the knowledge graph instead of grepping the filesystem.
 *
 * The CLAUDE.md markers match `graphify install`'s installer template so that
 * running `graphify install` later is idempotent — it will replace the marked
 * block instead of appending a duplicate.
 */

export const GRAPHIFY_SECTION_START = '<!-- GRAPHIFY_START -->';
export const GRAPHIFY_SECTION_END = '<!-- GRAPHIFY_END -->';

/**
 * The CLAUDE.md block that teaches Claude Code when (and when not) to use the
 * Graphify knowledge graph. Kept in sync with the upstream installer template.
 */
export const GRAPHIFY_CLAUDE_MD_SECTION = `${GRAPHIFY_SECTION_START}
## Graphify (Knowledge Graph)

Graphify builds a multi-modal knowledge graph of this project — code, docs, papers, images, audio, and video — and exports it as interactive HTML, queryable JSON, and a plain-language audit (\`graphify-out/GRAPH_REPORT.md\`).

Run \`vibe graphify .\` to build the graph, or \`vibe graphify install\` to wire up always-on hooks.

### If \`graphify-out/\` exists in the project

**Read \`graphify-out/GRAPH_REPORT.md\` BEFORE answering architecture questions or doing broad code exploration.** It is a one-page summary of god nodes, communities, and surprising connections — navigate by structure, not by grep.

**Use \`vibe graphify\` subcommands for targeted graph queries** (do not paste raw \`graph.json\` into prompts):

| Command | Use For |
|---------|---------|
| \`vibe graphify query "<question>"\` | Pull a focused subgraph for a specific question |
| \`vibe graphify path <a> <b>\` | Trace exact paths between two nodes |
| \`vibe graphify explain <node>\` | Describe a node and its relationships in plain language |
| \`vibe graphify stats\` | Summarise the graph at a glance (nodes, edges, communities) |

Every relationship is tagged \`EXTRACTED\` (found directly in source), \`INFERRED\` (reasonable inference, with a confidence score), or \`AMBIGUOUS\` (flagged for review). Always cite the tag when reasoning from the graph.

### If \`graphify-out/\` does NOT exist

At the start of a session, ask the user if they'd like to build the graph:

"I notice this project doesn't have a Graphify knowledge graph. Would you like me to run \`vibe graphify .\` to build one? It pairs well with CodeGraph for cross-modal exploration."
${GRAPHIFY_SECTION_END}`;

/**
 * Skill written to `.claude/commands/graphify.md`. Tells Claude Code which
 * graphify commands to reach for during day-to-day work.
 */
export const GRAPHIFY_SKILL = `Use the Graphify knowledge graph for architecture questions and broad cross-modal exploration when \`graphify-out/\` exists.

Graphify extracts a multi-modal knowledge graph (code + docs + papers + images + audio + video) and exposes it via the \`graphify\` CLI (re-exported as \`vibe graphify\`). The graph is **topology-based** (Leiden community detection on extracted relationships), so navigating it surfaces structure that grep alone cannot.

## When to use Graphify vs CodeGraph

| Use Graphify | Use CodeGraph |
|--------------|---------------|
| Cross-modal questions (docs ↔ code ↔ papers) | Pure code questions (callers, callees, impact) |
| "What is this project about?" / orientation | "What calls function X?" |
| Surprising connections, design rationale | Symbol lookup / blast-radius analysis |
| Mixed corpora (audio transcripts, images, PDFs) | Source-tree-only repos |

They complement each other — both can coexist in the same project.

## Workflow

1. **Always start with \`graphify-out/GRAPH_REPORT.md\`** for the high-level overview (god nodes, communities, surprising edges).
2. **Use \`vibe graphify query "<question>"\`** to pull a focused subgraph for a specific question. The output includes node labels, edge types, confidence tags, source files, and source locations — give that focused output to your tools instead of dumping the full corpus.
3. **Use \`vibe graphify path <a> <b>\`** to trace how two concepts are connected (hop by hop, with edge types).
4. **Use \`vibe graphify explain <node>\`** for a plain-language description of a single node.
5. **Use \`vibe graphify stats\`** for a one-glance summary.

## Rules

- **Cite the confidence tag** (\`EXTRACTED\` / \`INFERRED\` / \`AMBIGUOUS\`) whenever you reason from a graph edge. Do not present \`INFERRED\` edges as established fact.
- **Never paste raw \`graph.json\` into a prompt all at once.** Use the query commands to slice a relevant subgraph instead.
- **If \`graphify-out/\` is missing**, suggest \`vibe graphify .\` once at session start, then fall back to grep/glob until the user runs it.
- **For incremental refresh** after edits, run \`vibe graphify --update\` (cached re-runs are nearly instant for code-only changes).
`;

/**
 * Append the Graphify section to a CLAUDE.md body, idempotently. If a marked
 * section already exists, replace it. Otherwise append at the end.
 */
export function injectGraphifySection(claudeMd: string): string {
  const startIdx = claudeMd.indexOf(GRAPHIFY_SECTION_START);
  const endIdx = claudeMd.indexOf(GRAPHIFY_SECTION_END);

  if (startIdx >= 0 && endIdx > startIdx) {
    const before = claudeMd.substring(0, startIdx);
    const after = claudeMd.substring(endIdx + GRAPHIFY_SECTION_END.length);
    return before + GRAPHIFY_CLAUDE_MD_SECTION + after;
  }

  return claudeMd.trimEnd() + '\n\n' + GRAPHIFY_CLAUDE_MD_SECTION + '\n';
}
