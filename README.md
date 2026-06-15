# vibe-harness

## 한국어

`vibe-harness`는 AI 코딩을 위한 얇은 CLI 하네스입니다. 핵심은 AI가 코드를 더 많이 만들게 하는 것이 아니라, 사람이 이해하고 검증할 수 있는 단위로 작업을 강제하는 것입니다.

일반적인 AI 가드레일 저장소가 템플릿으로만 남겨두는 두 가지를 실제 실패 조건으로 만듭니다.

- 코드가 커밋되기 전에 ACT slice가 있어야 합니다.
- push 또는 CI 전에 confirm 기록이 실제 브랜치 diff와 일치해야 합니다.

이 도구가 개발자의 이해를 완전히 증명하지는 못합니다. 하드 게이트는 빈 문서, 오래된 확인 기록, 설명 불가능한 큰 diff를 막는 최소 장치입니다. 실제 이해 검증은 여전히 사람 리뷰와 선택적 critique가 맡아야 합니다.

### 왜 만들었나

AI 코딩은 흔히 "AI가 코드를 더 빠르게 쓰게 하는 것"으로 설명됩니다. 하지만 어려운 지점은 거기가 아닙니다.

진짜 어려운 부분은 작업을 사람이 이해하고, 검증하고, 안전하게 승인할 수 있을 만큼 작게 만드는 것입니다. 실제로는 주니어 개발자나 혼자 개발하는 사람이 자신이 설명하지 못하는 변경에 confirm만 누르는 사람이 되기 쉽습니다. `AGENTS.md`, `CLAUDE.md`, 체크리스트는 도움이 되지만, 컨텍스트가 길어지거나 생성된 diff가 커지면 쉽게 무시됩니다.

`vibe-harness`는 이 과정을 실패하는 게이트로 바꾸기 위해 만들었습니다.

- 커밋 전에 작업은 ACT slice로 정의되어야 합니다: actor, trigger, input, rule, state change, output, failure, test, non-goal
- push 또는 merge 전에 실제 브랜치 diff가 무엇을 바꿨는지, 무엇이 깨질 수 있는지, 어떻게 검증했는지 confirm해야 합니다.
- confirm 이후 diff가 바뀌면 fingerprint가 달라지고 confirm을 다시 해야 합니다.
- secret scan과 SAST 같은 보안 검사는 v2로 미루지 않고 첫 버전부터 포함합니다.

목표는 AI 코딩을 느리게 만드는 것이 아닙니다. AI 코딩의 속도는 살리되, 작업을 리뷰 가능하고 테스트 가능한 단위로 묶는 것입니다.

### 빠른 시작

```powershell
npx vibe-harness init
npx vibe-harness new-slice login-rate-limit
git add .vibe/slices/login-rate-limit.yml
git commit -m "Add login rate limit plan`n`nSlice: login-rate-limit"
```

push 또는 CI 전에 브랜치 diff 기준으로 confirm을 갱신합니다.

```powershell
npx vibe-harness confirm login-rate-limit
npx vibe-harness check --pre-push
```

### 게이트

- `commit-msg`: `Slice: <id>`와 완성된 ACT 필드를 요구합니다.
- `pre-push` / CI: confirm 5문항과 현재 diff fingerprint 일치를 요구합니다.
- `pre-commit`: diff budget과 staged secret scan을 검사합니다.
- 보안: Gitleaks와 Semgrep은 기본 hard gate이고, dependency audit은 기본 warning입니다.

### 외부 도구

```powershell
npx vibe-harness doctor
```

`doctor`는 Git PATH 문제를 포함해 누락된 도구와 설치 명령을 출력합니다.

## English

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
