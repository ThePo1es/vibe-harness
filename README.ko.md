# vibe-harness

[한국어](./README.ko.md) | [English](./README.en.md)

결론부터 말하면, `vibe-harness`는 바이브코딩을 막는 도구가 아닙니다.

바이브코딩의 장점은 살리되, 운영 코드나 오래 유지할 코드에서 반드시 필요한 최소한의 검증 단위를 강제하는 도구입니다. 이 프로젝트의 출발점은 단순합니다.

> 바이브코딩의 본질은 코드 생성이 아니라, AI가 만들 일을 사람이 검증 가능한 단위로 정의하는 능력이다.

AI가 코드를 쓰는 시대에는 코드를 빠르게 치는 능력보다 더 중요한 것이 있습니다. 무엇을 만들지 정의하고, 어디까지 만들지 제한하고, 어떻게 검증할지 설계하는 능력입니다. `vibe-harness`는 그 과정을 문서 템플릿으로만 남겨두지 않고, Git hook과 CI에서 실패하는 규칙으로 바꿉니다.

## 왜 만들었나

유지보수 가능한 AI 코딩은 그냥 "AI에게 구현시킨다"가 아닙니다.

실제로 필요한 흐름은 이쪽에 가깝습니다.

```text
요구사항을 작게 쪼갠다
→ acceptance criteria를 먼저 쓴다
→ 기존 코드 구조를 읽게 한다
→ 테스트를 먼저 만들거나 함께 만든다
→ 작은 diff만 생성하게 한다
→ 사람이 설명 가능한 diff만 merge한다
→ lint / typecheck / test / security scan / CI를 통과시킨다
→ 변경 이유와 제약을 문서에 남긴다
```

문제는 실제로 해보면 AI가 너무 많은 파일과 코드를 한 번에 생성한다는 점입니다. 사람은 그 양을 검수하다가 지치고, 어느 순간부터는 diff를 이해하기보다 confirm을 누르는 사람이 됩니다.

`AGENTS.md`, `CLAUDE.md` 같은 문서에 규칙을 적는 것도 필요하지만 충분하지 않습니다. 컨텍스트가 길어지면 AI는 규칙을 놓치고, 사람도 체크리스트를 건너뜁니다. 그래서 중요한 규칙은 기억시키는 게 아니라 도구로 강제해야 합니다.

```text
AGENTS.md:
  기본 규칙

slice file:
  이번 작업 범위와 acceptance criteria

git hook / script:
  diff 크기와 confirm 여부 제한

CI:
  test / lint / security scan 강제
```

핵심은 이겁니다.

> AI가 규칙을 잊어도, 작업이 실패하게 만들어야 한다.

## 이 도구가 강제하는 것

`vibe-harness`는 두 가지를 핵심 게이트로 둡니다.

첫 번째는 ACT slice입니다. 코드를 쓰기 전에 이번 작업이 무엇인지 작게 정의해야 합니다.

```text
Actor:
  누가 하는가?

Trigger:
  무엇이 기능을 시작시키는가?

Input:
  무엇이 들어오는가?

Rule:
  어떤 규칙을 적용하는가?

State Change:
  어떤 상태가 바뀌는가?

Output:
  무엇을 반환하거나 관찰할 수 있는가?

Failure:
  무엇이 실패할 수 있는가?

Test:
  무엇을 확인하면 끝인가?

Non-goal:
  이번에 일부러 안 하는 것은 무엇인가?
```

두 번째는 confirm gate입니다. 코드를 만든 뒤에는 실제 diff를 보고 아래 질문에 답해야 합니다.

```text
이 변경은 어떤 문제를 해결하는가?
어떤 파일이 왜 바뀌는가?
기존 동작 중 무엇이 바뀌는가?
무엇이 깨질 수 있는가?
어떤 테스트로 확인했는가?
```

설명하지 못하면 confirm하면 안 됩니다. `vibe-harness`는 이 답이 비어 있거나, diff가 바뀐 뒤 오래된 confirm을 그대로 쓰는 경우를 실패시킵니다.

## Vertical slice가 기준이다

신규 개발에서 "작은 diff"만으로는 부족합니다. 먼저 설계를 작게 나눠야 합니다.

좋은 slice는 actor가 명확하고, 행동이 하나이며, 상태 변화가 있고, 성공/실패 조건이 관찰 가능하고, 테스트할 수 있으며, 이번에 안 할 것이 분명합니다.

반대로 이런 것은 vertical slice가 아닙니다.

```text
DB 만들기
Controller 만들기
Service 만들기
공통 응답 객체 만들기
전체 인증 구조 만들기
```

이건 사용자 관점의 기능 단위가 아니라 horizontal task입니다. `vibe-harness`는 작업을 이런 식으로 쪼개기보다, 검증 가능한 하나의 유스케이스로 정의하도록 밀어붙입니다.

## 모드 감각

모든 AI 코딩을 같은 엄격도로 다룰 필요는 없습니다.

```text
YOLO 모드:
  버려도 되는 프로토타입

Controlled Vibe 모드:
  내가 유지할 개인 프로젝트

Engineering 모드:
  팀/운영/보안/포트폴리오 코드
```

항상 엄격하면 바이브코딩의 속도가 죽고, 항상 느슨하면 유지보수가 무너집니다. `vibe-harness`의 기본값은 Engineering에 맞춰져 있습니다. 팀 코드, 운영 코드, 보안 코드, 포트폴리오처럼 남에게 설명해야 하는 코드를 기준으로 설계했습니다.

## 보안과 자동 검증

AI가 코드를 많이 만들수록 사람의 리뷰만으로는 감당하기 어렵습니다.

그래서 `vibe-harness`는 처음부터 정적분석과 secret scan을 기본 게이트에 포함합니다.

```text
정적분석:
  AI-generated diff의 기본 안전벨트

secret scan:
  실수로 커밋된 토큰과 키를 막는 최소 방어선

fuzzing:
  v1 범위는 아니지만, 파서/프로토콜/파일 처리/보안 코드에서는 다음 단계로 중요해진다
```

특히 보안, 임베디드, 차량, 프로토콜, 파서, 파일 처리 쪽에서는 사람 눈으로 놓친 엣지케이스가 실제 장애나 취약점으로 이어질 수 있습니다. 이 도구는 그 방향으로 확장할 수 있는 얇은 시작점입니다.

## 빠른 시작

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

## 게이트

- `commit-msg`: `Slice: <id>`와 완성된 ACT 필드를 요구합니다.
- `pre-push` / CI: confirm 5문항과 현재 diff fingerprint 일치를 요구합니다.
- `pre-commit`: diff budget과 staged secret scan을 검사합니다.
- 보안: Gitleaks와 Semgrep은 기본 hard gate이고, dependency audit은 기본 warning입니다.

## 외부 도구

```powershell
npx vibe-harness doctor
```

`doctor`는 Git PATH 문제를 포함해 누락된 도구와 설치 명령을 출력합니다.

## 한계

이 도구가 이해 자체를 증명하지는 못합니다. 그럴듯한 문장을 적고 통과하려는 사람을 완벽히 막을 수는 없습니다.

그래서 이 프로젝트의 목표는 "리뷰가 필요 없는 자동 승인"이 아닙니다. 목표는 최소한의 설명 책임, 작은 slice, stale confirm 방지, 테스트와 보안 게이트를 통해 사람이 리뷰할 수 있는 상태까지 강제하는 것입니다.

실제 팀에서는 여기에 코드 리뷰 문화, 시니어 피드백, CI/CD 권한 관리, 보안 정책이 더 붙어야 합니다. 혼자 연습할 때는 `slice card 작성 → AI critique → 작은 구현 → 테스트` 루틴이 가장 현실적입니다.
