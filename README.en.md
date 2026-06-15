# vibe-harness

[한국어](./README.ko.md) | [English](./README.en.md)

In short, `vibe-harness` is not a tool for stopping vibe coding.

It is a small CLI harness for keeping the useful speed of AI-assisted coding while enforcing the minimum verification structure needed for production code, long-lived projects, team work, security-sensitive code, and portfolio code. The starting point is simple:

> The core skill in vibe coding is not generating code. It is defining the work AI should do in units that a human can verify.

When AI writes code, typing code quickly matters less than defining what should be built, limiting how far the change should go, and deciding how the result will be verified. `vibe-harness` turns that process from a markdown-only guideline into Git hook and CI gates that can fail.

## Why I Built This

Maintainable AI coding is not just "ask AI to implement it."

The workflow should look closer to this:

```text
split the requirement into small pieces
→ write acceptance criteria first
→ make AI read the existing code structure
→ write or update tests first
→ generate only a small diff
→ merge only diffs a human can explain
→ pass lint / typecheck / test / security scan / CI
→ document the reason and constraints behind the change
```

In practice, AI often generates too many files and too much code at once. The reviewer gets tired, and at some point the work shifts from understanding the diff to just pressing confirm.

Writing rules in `AGENTS.md`, `CLAUDE.md`, or a checklist is useful, but it is not enough. When context gets long, AI can miss the rules. Humans skip checklists too. Important rules should not depend on memory alone; they should be enforced by tools.

```text
AGENTS.md:
  default rules

slice file:
  current task scope and acceptance criteria

git hook / script:
  diff size and confirm gates

CI:
  test / lint / security scan enforcement
```

The principle is:

> Even if AI forgets the rule, the work should fail.

## What This Tool Enforces

`vibe-harness` has two core gates.

The first gate is the ACT slice. Before writing code, the work has to be framed as a small, testable unit.

```text
Actor:
  Who performs the behavior?

Trigger:
  What starts the behavior?

Input:
  What enters the system?

Rule:
  What rule is applied?

State Change:
  What state changes?

Output:
  What is returned or observed?

Failure:
  What can fail?

Test:
  What proves this is done?

Non-goal:
  What is intentionally not part of this change?
```

The second gate is the confirm gate. After code is written, the developer has to look at the actual diff and answer:

```text
What problem does this change solve?
Which files changed, and why?
What existing behavior changes?
What could break?
What test or command verified it?
```

If you cannot explain the change, you should not confirm it. `vibe-harness` fails empty answers and stale confirm records when the diff changes after confirmation.

## Vertical Slice First

For new development, "small diff" alone is not enough. The design itself has to be sliced.

A good vertical slice has a clear actor, one behavior, a state change, observable success and failure conditions, a test, and an explicit non-goal.

These are not vertical slices:

```text
make the DB
make the controller
make the service
make the common response object
build the whole auth structure
```

Those are horizontal tasks, not user-observable behavior. `vibe-harness` pushes work toward a verifiable use case instead of a stack of layers.

## Mode Sense

Not every AI coding session needs the same strictness.

```text
YOLO mode:
  throwaway prototypes

Controlled Vibe mode:
  personal projects you will maintain

Engineering mode:
  team / production / security / portfolio code
```

If everything is strict all the time, vibe coding loses its speed. If everything is loose all the time, maintainability collapses. `vibe-harness` defaults toward Engineering mode because it is designed for code that has to be explained to someone else.

## Security And Automated Checks

As AI generates more code, review by humans alone does not scale.

That is why `vibe-harness` includes static analysis and secret scanning from the first version.

```text
static analysis:
  the basic safety belt for AI-generated diffs

secret scan:
  a minimum defense against accidentally committed tokens and keys

fuzzing:
  not in v1, but an important next step for parsers, protocols, file handling, and security-sensitive code
```

In security, embedded systems, automotive software, protocols, parsers, and file processing, edge cases missed by human review can turn into real bugs or vulnerabilities. This project is a thin starting point that can grow in that direction.

## Quick Start

```powershell
npx vibe-harness init
npx vibe-harness new-slice login-rate-limit
git add .vibe/slices/login-rate-limit.yml
git commit -m "Add login rate limit plan`n`nSlice: login-rate-limit"
```

Before push or CI, refresh confirm against the branch diff:

```powershell
npx vibe-harness confirm login-rate-limit
npx vibe-harness check --pre-push
```

## Gates

- `commit-msg`: requires `Slice: <id>` and complete ACT fields.
- `pre-push` / CI: requires the five confirm answers and a matching diff fingerprint.
- `pre-commit`: checks the diff budget and staged secret scan.
- security: Gitleaks and Semgrep are hard gates by default; dependency audit is a warning by default.

## External Tools

```powershell
npx vibe-harness doctor
```

`doctor` prints missing tools and install hints, including Git PATH issues on Windows.

## Limits

This tool cannot prove understanding itself. A person can still write plausible text just to pass a gate.

The goal is not automatic approval without review. The goal is to force enough explanation, small slicing, stale-confirm prevention, tests, and security gates so the work reaches a state that a human can actually review.

In a real team, this still needs code review culture, senior feedback, CI/CD permission control, and security policy. For solo practice, the most realistic loop is `write a slice card → ask AI to critique it → implement a small diff → test it`.
