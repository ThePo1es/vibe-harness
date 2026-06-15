import YAML from "yaml";
import { DEFAULT_CONFIG } from "./constants.js";
import type { SliceFile, VibeConfig } from "./types.js";

export function defaultConfigYaml(): string {
  return YAML.stringify(DEFAULT_CONFIG satisfies VibeConfig);
}

export function lefthookYaml(): string {
  return `pre-commit:
  commands:
    vibe-staged:
      run: npx vibe-harness check --staged

commit-msg:
  commands:
    vibe-commit-msg:
      run: npx vibe-harness check-commit-msg {1}

pre-push:
  commands:
    vibe-pre-push:
      run: npx vibe-harness check --pre-push
`;
}

export function githubWorkflowYaml(): string {
  return `name: vibe-harness

on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  vibe-harness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: actions/setup-python@v5
        with:
          python-version: "3.x"
      - name: Install Semgrep
        run: python -m pip install semgrep
      - name: Run vibe-harness
        run: npx vibe-harness check --ci --base "origin/\${{ github.base_ref || 'main' }}"
`;
}

export function semgrepRulesYaml(): string {
  return `rules:
  - id: vibe-no-shell-true
    message: Avoid committed guardrail commands that mask failures with "|| true".
    severity: WARNING
    languages: [generic]
    pattern-regex: '\\|\\|\\s*true'
`;
}

export function sliceTemplate(id: string, title: string, act: Record<string, string>): SliceFile {
  return {
    id,
    title,
    status: "planned",
    act: {
      actor: act.actor ?? "",
      trigger: act.trigger ?? "",
      input: act.input ?? "",
      rule: act.rule ?? "",
      state_change: act.state_change ?? "",
      output: act.output ?? "",
      failure: act.failure ?? "",
      test: act.test ?? "",
      non_goal: act.non_goal ?? ""
    },
    confirm: {
      problem: "",
      files_why: "",
      behavior_change: "",
      breakage_risk: "",
      verification: "",
      diff_fingerprint: "",
      base: "",
      confirmed_at: ""
    }
  };
}
