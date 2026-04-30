# vibe-init project conventions

This file extends the cross-project `CLAUDE.md` (one directory up). Project-specific guidance only — anything universal belongs in the parent file.

## What this project is

`vibe-init-cli` is a Node CLI distributed via npm (`vibe`). It is a tool *for* coding agents, not a coding agent itself. It generates governance frameworks (`CLAUDE.md`, 59 YAML policies, auto-skills, ADR templates) for other projects, and wraps complementary CLIs (`@colbymchenry/codegraph`, `graphifyy`, `@agile-vibe-coding/avc`, `google-agents-cli`).

## What this project is not

A web app. A server. A library that loads runtime config from environment variables. Many of the audit policies it ships (health endpoints, ORM, port binding, dev/prod parity, accessibility linter, OpenAPI, rate limiting, password hashing, distributed tracing, application metrics, error tracking, graceful shutdown handlers, error boundaries, database migrations, structured logging, containerization) are intentionally **not applicable** to this repository. Running `vibe doctor` on this repo will flag them; that is honest noise — the policies are correct for the projects vibe-init *generates*, not for vibe-init itself.

If you are tempted to add Docker, OpenTelemetry, an ORM, or a health endpoint to this repo "to fix the audit," stop. Re-read this section.

## Repo layout

- `src/index.ts` — CLI entry (Commander). Adding a new command means: new file under `src/commands/`, register in `index.ts`, add help text, add to `MAIN_HELP`, add an integration test.
- `src/commands/*.ts` — one file per `vibe <command>`.
- `src/governance/policies/*.ts` — the 59 policies, grouped by category.
- `src/governance/detectors.ts` — shared detection helpers used by policies.
- `src/analyzers/practice-detectors/*.ts` — stack-and-practice detection used by `vibe scan` and `vibe doctor`.
- `src/skills/*.ts` — auto-skill markdown injected into generated `CLAUDE.md` files.
- `src/templates/` — EJS templates for scaffolded files (`vibe add`).
- `tests/unit/` — pure-logic tests, no I/O.
- `tests/integration/cli.test.ts` — invokes the built CLI in temp dirs; requires `npm run build` first.
- `scripts/pre-release.sh` — single source of truth for "is this releasable?".

## Wrapper conventions

`vibe codegraph`, `vibe graphify`, `vibe avc`, and `vibe agents-cli` are pass-through wrappers around external CLIs. They share a contract:

1. Every flag passes through verbatim. Commander uses `.allowUnknownOption(true).helpOption(false)`.
2. The vibe-side help (`vibe help <wrapper>`) explains *when* to reach for the wrapper and lists the upstream subcommands grouped by purpose.
3. The upstream `--help` always works (`vibe <wrapper> --help` forwards to the real CLI).
4. If the upstream binary is missing, auto-install via the upstream's recommended path (`uvx`, `uv tool install`, `pipx`, `npm install -g`) — never fail silently.
5. Integration tests cover: main-help advertisement, vibe-side help rendering, and the missing-binary fallback path with `runWithEnv` (do not rely on the host machine's installed tools).

When adding a new wrapper, mirror `src/commands/agents-cli.ts` and the `AGENTS_CLI_HELP` block in `src/index.ts` — they are the canonical pattern.

## Tests

- Add a unit test whenever you change pure logic in `src/governance/`, `src/analyzers/`, `src/skills/`, or `src/scoring/`.
- Add an integration test whenever you add or change a CLI command, flag, or help text.
- The integration test suite uses `runWithEnv` to simulate constrained environments (empty PATH, missing binaries). Use it instead of mocking child_process.

## Releases

Owner: `@vishalm`. See `CONTRIBUTING.md` for the checklist. Two invariants:

1. `package.json` `version` and `src/version.ts` `VERSION` must match. The prerelease script enforces this.
2. `CHANGELOG.md` `Unreleased` entries get rolled into the new version block at release time.

## Don't

- Don't run `vibe doctor` on this repo and start "fixing" Bucket B violations (see the "What this project is not" section).
- Don't add runtime dependencies. The CLI is bundled with esbuild and should stay small.
- Don't introduce backwards-compatibility shims for removed CLI flags. If a flag is gone, it is gone — bump the minor version.
- Don't bypass the prerelease script before publishing. It exists because we have already shipped one bad release.
