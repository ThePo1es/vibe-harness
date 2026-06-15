# vibe-harness

`vibe-harness` is a thin CLI wrapper around proven engines. It enforces two things that normal AI guardrail repos usually leave as templates:

- an ACT slice must exist before code is committed
- a confirm record must match the real branch diff before push/CI

It does not prove that a developer truly understands a change. The hard gates force written evidence and stale-diff detection. Human review and optional critique still carry the real understanding check.

## Why I Built This

AI coding is usually described as "letting AI write code faster." That is not the hard part.

The hard part is making the work small enough that a human can understand, verify, and safely accept it. In practice, juniors and solo developers can end up becoming the person who only presses confirm on changes they cannot explain. `AGENTS.md`, `CLAUDE.md`, and checklists help, but they are easy to ignore when context gets long or the generated diff gets large.

`vibe-harness` exists to turn that process into a failing gate:

- before code is committed, the work must be framed as an ACT slice: actor, trigger, input, rule, state change, output, failure, test, and non-goal
- before code is pushed or merged, the developer must confirm what the actual branch diff changed, what can break, and how it was verified
- if the diff changes after confirm, the fingerprint changes and the confirm must be refreshed
- security checks are part of the first version, not a later afterthought

The point is not to make AI slower for its own sake. The point is to preserve the useful speed of AI coding while forcing the work into reviewable, testable units.

## Quick Start

```powershell
npx vibe-harness init
npx vibe-harness new-slice login-rate-limit
git add .vibe/slices/login-rate-limit.yml
git commit -m "Add login rate limit plan`n`nSlice: login-rate-limit"
```

Before push or CI, update confirm answers against the branch diff:

```powershell
npx vibe-harness confirm login-rate-limit
npx vibe-harness check --pre-push
```

## Gates

- `commit-msg`: requires `Slice: <id>` and complete ACT fields.
- `pre-push` / CI: requires complete confirm fields and a matching branch diff fingerprint.
- `pre-commit`: checks diff budget and staged secrets when Gitleaks is installed.
- security: Gitleaks is hard by default; Semgrep is hard when configured and available; dependency audit is warn by default.

## External Tools

Run:

```powershell
npx vibe-harness doctor
```

The doctor command prints exact missing tools and install hints, including Git PATH issues on Windows.
