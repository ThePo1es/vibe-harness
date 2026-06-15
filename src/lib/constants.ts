import type { VibeConfig } from "./types.js";

export const ACT_FIELDS = [
  "actor",
  "trigger",
  "input",
  "rule",
  "state_change",
  "output",
  "failure",
  "test",
  "non_goal"
] as const;

export const CONFIRM_FIELDS = [
  "problem",
  "files_why",
  "behavior_change",
  "breakage_risk",
  "verification"
] as const;

export type ActField = (typeof ACT_FIELDS)[number];
export type ConfirmField = (typeof CONFIRM_FIELDS)[number];

export const DEFAULT_BUDGET_EXCLUDE = [
  "**/package-lock.json",
  "**/npm-shrinkwrap.json",
  "**/pnpm-lock.yaml",
  "**/yarn.lock",
  "**/bun.lockb",
  "**/Cargo.lock",
  "**/go.sum",
  "**/poetry.lock",
  "**/Pipfile.lock",
  "vendor/**",
  "**/vendor/**",
  "generated/**",
  "**/generated/**",
  "**/*.generated.*",
  "migrations/**",
  "**/migrations/**",
  "migration/**",
  "**/migration/**"
];

export const DEFAULT_CONFIG = {
  mode: "engineering",
  base: "main",
  active_slice: null as string | null,
  diff: {
    max_files: 8,
    max_total_lines: 500,
    max_added_lines: 350,
    budget_exclude: DEFAULT_BUDGET_EXCLUDE
  },
  security: {
    gitleaks: "required",
    semgrep: "required",
    semgrep_config: ".semgrep/vibe.yml"
  },
  audit: {
    dependency: "warn"
  },
  profiles: {
    active: "auto"
  }
} satisfies VibeConfig;

export const PLACEHOLDER_VALUES = new Set([
  "",
  "todo",
  "tbd",
  "n/a",
  "na",
  "none",
  "replace me",
  "replace_me",
  "placeholder",
  "..."
]);
