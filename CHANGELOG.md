# Changelog

All notable changes to `vibe-init-cli` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Pending follow-ups
- One-shot Biome formatter pass over existing source (`npm run format`) — held back from 0.7.1 to keep the release surface small. Currently 72 files diverge from Biome's defaults; reformat in a single dedicated commit so blame churn is contained.

## [0.7.1] - 2026-04-30

### Added
- `vibe agents-cli [args...]` — pass-through wrapper around [`google/agents-cli`](https://github.com/google/agents-cli) (the Python CLI for ADK agents on Google Cloud). Prefers a globally installed `agents-cli` binary, falls back to `uvx google-agents-cli` so no global Python install is required (only `uv` on PATH). All flags pass through verbatim. `vibe help agents-cli` documents the full upstream surface (Setup / Auth / Scaffold / Develop / Evaluate / Deploy & Publish / Data / RAG) and the seven `google-agents-cli-*` skills installed by `agents-cli setup`.
- Project-local repo hygiene: `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS`, `.github/dependabot.yml`, `CLAUDE.md` (project conventions).
- Biome (`biome.json`) for lint + format. New scripts: `lint:biome`, `format`, `audit`.
- Husky pre-commit hook (`.husky/pre-commit`) wires `npm run lint && npm run test:unit` before each commit.
- Integration tests for `vibe agents-cli`: main-help advertisement, enriched `vibe help agents-cli` rendering, and the missing-runner fallback path (PATH=empty → helpful uv install hint).

### Changed
- Help banner and PREREQUISITES section in `src/index.ts` advertise `agents-cli` alongside `codegraph` and `graphify`.

## [0.7.0] - 2026-04
- Integrated [`graphifyy`](https://pypi.org/project/graphifyy/) as `vibe graphify` — a multi-modal knowledge graph (code + docs + papers + audio + video).

## [0.6.1]
- `vibe avc` auto-installs `@agile-vibe-coding/avc` on first use.

## [0.6.0]
- Initial Agile Vibe Coding integration (Sponsor Call, Sprint Planning, traceable epics/stories).

[Unreleased]: https://github.com/vishalm/vibe-init/compare/v0.7.1...HEAD
[0.7.1]: https://github.com/vishalm/vibe-init/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/vishalm/vibe-init/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/vishalm/vibe-init/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/vishalm/vibe-init/releases/tag/v0.6.0
