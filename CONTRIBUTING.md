# Contributing to vibe-init

Thanks for considering a contribution. This is a small, opinionated CLI; the bar for changes is "earns its keep" — concrete user value, well-tested, and aligned with the governance philosophy the tool itself preaches.

## Quick start

```bash
git clone https://github.com/vishalm/vibe-init.git
cd vibe-init
npm install
npm run build       # esbuild bundle into build/
npm run lint        # tsc --noEmit (type check)
npm run test        # vitest run (unit + integration)
npm run prerelease  # full pre-release verification
```

The CLI entry is `src/index.ts` (Commander). Commands live under `src/commands/`. Governance policies live under `src/governance/policies/` with shared detectors in `src/governance/detectors.ts`.

## Branching and commits

- Branch from `main`: `git checkout -b feat/<short-name>` or `fix/<short-name>`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `release:`).
- Keep commits focused. Bug fixes, refactors, and feature work belong in separate commits.
- Never commit `node_modules/`, `build/` artifacts, secrets, or generated `graphify-out/` / `.codegraph/` directories — they are gitignored.

## Pull requests

Before opening a PR:

1. `npm run prerelease` passes locally.
2. New behavior has tests (unit for pure logic, integration for CLI surface).
3. Updated `README.md` if you changed user-visible behavior.
4. Updated `CHANGELOG.md` under `Unreleased`.
5. The PR description fills out the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).

PRs that materially change governance policies should explain *why* the policy is added/removed and list which projects it would now flag/unflag.

## Testing

- **Unit tests** (`tests/unit/`) — pure logic, no I/O, fast.
- **Integration tests** (`tests/integration/`) — invoke the built CLI in a temp dir; require `npm run build` first (the prerelease script handles ordering).

Add a test whenever you:
- Add or change a CLI command, flag, or help text.
- Add or change a governance detector.
- Touch the wrapper surface for `codegraph`, `graphify`, `avc`, or `agents-cli`.

When testing wrappers that shell out to external CLIs, use the `runWithEnv` helper in `tests/integration/cli.test.ts` to simulate a missing-binary PATH instead of relying on the host machine's installed tools.

## Releasing

Maintainer-only. Owner: `@vishalm`.

1. Bump `package.json` `version` and `src/version.ts` `VERSION` together.
2. Update `CHANGELOG.md` (move `Unreleased` entries under the new version).
3. `npm run prerelease` must be green.
4. Commit `release: vX.Y.Z — <summary>`.
5. Tag `vX.Y.Z` and push.
6. `npm publish`.

## Code style

- TypeScript strict mode is on; no `any` without an inline justification.
- Prefer explicit over clever (matches the engineering preferences in the cross-project `CLAUDE.md`).
- DRY is critical — flag and refactor repetition.
- No emoji or icon characters in source, docs, or commit messages.
- No hardcoded user-visible strings that bypass i18n in scaffolded templates.

## Reporting bugs

Open an issue at https://github.com/vishalm/vibe-init/issues with:
- `vibe --version`
- `node --version`, OS
- A minimal reproduction or the exact command + output

For security-sensitive issues, follow `SECURITY.md` instead.
