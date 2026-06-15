import type { ActField, ConfirmField } from "./constants.js";

export type VibeConfig = {
  mode: "engineering" | "controlled" | "yolo";
  base: string;
  active_slice: string | null;
  diff: {
    max_files: number;
    max_total_lines: number;
    max_added_lines: number;
    budget_exclude: string[];
  };
  security: {
    gitleaks: "required" | "warn" | "off";
    semgrep: "required" | "warn" | "off";
    semgrep_config: string;
  };
  audit: {
    dependency: "required" | "warn" | "off";
  };
  profiles: {
    active: "auto" | "node" | "python" | "rust" | "go" | "custom";
  };
};

export type SliceFile = {
  id: string;
  title?: string;
  status?: "planned" | "in_progress" | "confirmed";
  act: Record<ActField, string>;
  confirm?: Partial<Record<ConfirmField, string>> & {
    diff_fingerprint?: string;
    base?: string;
    confirmed_at?: string;
  };
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type DiffRecord = {
  path: string;
  op: "added" | "removed" | "renamed" | "binary";
  content: string;
};

export type DiffBudget = {
  files: number;
  added: number;
  removed: number;
  total: number;
  excludedFiles: string[];
};
