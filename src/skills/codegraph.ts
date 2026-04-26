/**
 * CodeGraph integration helpers for `vibe init`.
 *
 * Inject a deterministic CodeGraph section into the generated CLAUDE.md, the
 * `.claude/commands/codegraph.md` skill, and codegraph MCP permissions into
 * the generated `.claude/settings.json`.
 *
 * The CLAUDE.md markers match `@colbymchenry/codegraph`'s installer so that
 * running `codegraph init -i` later is idempotent — it will replace the
 * marked block instead of appending a duplicate.
 */

export const CODEGRAPH_SECTION_START = '<!-- CODEGRAPH_START -->';
export const CODEGRAPH_SECTION_END = '<!-- CODEGRAPH_END -->';

/**
 * The CLAUDE.md block that teaches Claude Code when (and when not) to use
 * CodeGraph MCP tools. Kept in sync with the upstream installer template.
 */
export const CODEGRAPH_CLAUDE_MD_SECTION = `${CODEGRAPH_SECTION_START}
## CodeGraph

CodeGraph builds a semantic knowledge graph of this codebase for faster, smarter code exploration. Run \`vibe codegraph init -i\` if \`.codegraph/\` is missing.

### If \`.codegraph/\` exists in the project

**NEVER call \`codegraph_explore\` or \`codegraph_context\` directly in the main session.** These tools return large amounts of source code that fills up main session context. Instead, ALWAYS spawn an Explore agent for any exploration question (e.g., "how does X work?", "explain the Y system", "where is Z implemented?").

**When spawning Explore agents**, include this instruction in the prompt:

> This project has CodeGraph initialized (.codegraph/ exists). Use \`codegraph_explore\` as your PRIMARY tool — it returns full source code sections from all relevant files in one call.
>
> **Rules:**
> 1. Follow the explore call budget in the \`codegraph_explore\` tool description — it scales automatically based on project size.
> 2. Do NOT re-read files that codegraph_explore already returned source code for. The source sections are complete and authoritative.
> 3. Only fall back to grep/glob/read for files listed under "Additional relevant files" if you need more detail, or if codegraph returned no results.

**The main session may only use these lightweight tools directly** (for targeted lookups before making edits, not for exploration):

| Tool | Use For |
|------|---------|
| \`codegraph_search\` | Find symbols by name |
| \`codegraph_callers\` / \`codegraph_callees\` | Trace call flow |
| \`codegraph_impact\` | Check what's affected before editing |
| \`codegraph_node\` | Get a single symbol's details |

### If \`.codegraph/\` does NOT exist

At the start of a session, ask the user if they'd like to initialize CodeGraph:

"I notice this project doesn't have CodeGraph initialized. Would you like me to run \`vibe codegraph init -i\` to build a code knowledge graph?"
${CODEGRAPH_SECTION_END}`;

/**
 * Skill written to `.claude/commands/codegraph.md`. Tells Claude Code which
 * codegraph MCP tools to reach for during day-to-day work.
 */
export const CODEGRAPH_SKILL = `Use CodeGraph MCP tools instead of grep/glob/read for code exploration when \`.codegraph/\` exists.

CodeGraph is a local semantic knowledge graph of this codebase, exposed via MCP tools (\`mcp__codegraph__*\`). Prefer it over filesystem scanning — it is dramatically faster and uses far fewer tokens.

## When to use which tool

| Tool | Use For |
|------|---------|
| \`codegraph_search\` | Find symbols by name across the codebase |
| \`codegraph_callers\` | List everything that calls a given symbol |
| \`codegraph_callees\` | List everything a given symbol calls |
| \`codegraph_impact\` | Trace the blast radius of editing a symbol |
| \`codegraph_node\` | Get details about a single symbol |
| \`codegraph_files\` | Indexed file structure (faster than ls/find) |
| \`codegraph_status\` | Index health and statistics |

## Rules

- **For exploration questions** ("how does X work?", "where is Y implemented?", "explain Z"), spawn an Explore agent and let it use \`codegraph_explore\` / \`codegraph_context\`. Never call those tools in the main session — they return large source blocks that fill the main context window.
- **For targeted lookups before editing**, use the lightweight tools above (\`codegraph_search\`, \`codegraph_callers\`, \`codegraph_callees\`, \`codegraph_impact\`, \`codegraph_node\`).
- **Trust CodeGraph results.** Do not re-read files it already returned source for.
- **If \`.codegraph/\` is missing**, suggest \`vibe codegraph init -i\` once at session start, then fall back to grep/glob until the user runs it.
- **Auto-sync** keeps the graph fresh on file save (2-second debounce). If results look stale, run \`vibe codegraph sync\`.
`;

/**
 * MCP permission strings to allow without prompting. Matches the names the
 * codegraph MCP server exposes.
 */
export const CODEGRAPH_MCP_PERMISSIONS = [
  'mcp__codegraph__codegraph_search',
  'mcp__codegraph__codegraph_context',
  'mcp__codegraph__codegraph_callers',
  'mcp__codegraph__codegraph_callees',
  'mcp__codegraph__codegraph_impact',
  'mcp__codegraph__codegraph_node',
  'mcp__codegraph__codegraph_status',
  'mcp__codegraph__codegraph_files',
] as const;

/**
 * Append the CodeGraph section to a CLAUDE.md body, idempotently. If a marked
 * section already exists, replace it. Otherwise append at the end.
 */
export function injectCodegraphSection(claudeMd: string): string {
  const startIdx = claudeMd.indexOf(CODEGRAPH_SECTION_START);
  const endIdx = claudeMd.indexOf(CODEGRAPH_SECTION_END);

  if (startIdx >= 0 && endIdx > startIdx) {
    const before = claudeMd.substring(0, startIdx);
    const after = claudeMd.substring(endIdx + CODEGRAPH_SECTION_END.length);
    return before + CODEGRAPH_CLAUDE_MD_SECTION + after;
  }

  return claudeMd.trimEnd() + '\n\n' + CODEGRAPH_CLAUDE_MD_SECTION + '\n';
}
