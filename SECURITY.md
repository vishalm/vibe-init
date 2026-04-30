# Security Policy

## Supported Versions

Security fixes land on the latest minor release published to npm.

| Version | Supported          |
| ------- | ------------------ |
| latest  | yes                |
| older   | best-effort        |

## Reporting a Vulnerability

If you discover a security issue in `vibe-init-cli`, please **do not** open a public GitHub issue.

Instead, report it privately:

- Open a [GitHub security advisory](https://github.com/vishalm/vibe-init/security/advisories/new) (preferred), or
- Email the maintainer (see `package.json` `author` / repo contact).

When reporting, include:

1. A short description of the issue and its impact.
2. Steps to reproduce or a minimal proof of concept.
3. The affected version (`vibe --version`).
4. Any suggested mitigation, if you have one.

## Response Expectations

- Acknowledgement: within 5 business days.
- Initial assessment: within 10 business days.
- Fix or mitigation plan: communicated as soon as triage completes.

## Scope

In scope:
- Code execution, sandbox escape, or privilege escalation through the CLI.
- Supply-chain risks (compromised published artifacts, hijacked dependencies).
- Secrets disclosure introduced by `vibe init` / `vibe build` scaffolding.

Out of scope:
- Vulnerabilities in third-party CLIs that `vibe-init` wraps (`@colbymchenry/codegraph`, `graphifyy`, `@agile-vibe-coding/avc`, `google-agents-cli`). Please report those upstream.
- Issues in projects *generated* by `vibe-init` that originate from user-provided prompts or third-party templates.

## Disclosure

Once a fix is released, the advisory will be published with credit to the reporter (unless anonymity is requested).
