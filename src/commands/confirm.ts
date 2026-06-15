import { branchDiff } from "../lib/git.js";
import { fingerprintDiff, parseUnifiedDiff } from "../lib/diff.js";
import { loadConfig, loadSlice, saveSlice } from "../lib/fs.js";
import { ask } from "../lib/prompt.js";
import { validateSliceConfirm, formatIssues } from "../lib/validate.js";
import { CONFIRM_FIELDS } from "../lib/constants.js";
import type { ConfirmField } from "../lib/constants.js";

type ConfirmOptions = {
  base?: string;
};

const QUESTIONS: Record<ConfirmField, string> = {
  problem: "What problem does this diff solve?",
  files_why: "Which files changed and why?",
  behavior_change: "What existing behavior changes?",
  breakage_risk: "What could break?",
  verification: "What command, test, or explicit not-run reason verifies it?"
};

export async function confirmCommand(id: string, options: ConfirmOptions): Promise<void> {
  const config = loadConfig();
  const base = options.base ?? config.base;
  const diff = branchDiff(base);
  const fingerprint = fingerprintDiff(diff);
  const parsed = parseUnifiedDiff(diff);

  console.log(`base: ${base}`);
  console.log(`changed files: ${[...parsed.files].join(", ") || "(none)"}`);
  console.log(`diff fingerprint: ${fingerprint.hash}`);

  const slice = loadSlice(id);
  slice.confirm ??= {};
  for (const field of CONFIRM_FIELDS) {
    const previous = slice.confirm[field];
    slice.confirm[field] = await ask(QUESTIONS[field], { defaultValue: previous, required: true });
  }
  slice.confirm.diff_fingerprint = fingerprint.hash;
  slice.confirm.base = base;
  slice.confirm.confirmed_at = new Date().toISOString();
  slice.status = "confirmed";

  const issues = validateSliceConfirm(slice);
  if (issues.length > 0) {
    throw new Error(formatIssues("confirm gate is incomplete", issues));
  }
  saveSlice(slice);
  console.log(`updated .vibe/slices/${id}.yml`);
}
