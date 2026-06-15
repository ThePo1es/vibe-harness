import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { checkCommitMsgCommand } from "../src/commands/check-commit-msg.js";
import { fingerprintDiff } from "../src/lib/diff.js";
import { validateConfirmForFingerprint } from "../src/commands/check.js";

const GOOD_ACT = `id: slice-a
title: Slice A
status: planned
act:
  actor: developer using the harness
  trigger: commit message validation runs
  input: commit message with a Slice trailer
  rule: the referenced slice must have ACT fields
  state_change: no app state changes because this is a harness validation
  output: commit message validation passes
  failure: missing ACT fields fail the commit message gate
  test: check-commit-msg accepts this message file
  non_goal: confirm answers are not required at commit time
confirm:
  problem: ""
  files_why: ""
  behavior_change: ""
  breakage_risk: ""
  verification: ""
  diff_fingerprint: ""
`;

let originalCwd = process.cwd();

afterEach(() => {
  process.chdir(originalCwd);
});

describe("enforcement contract", () => {
  it("commit-msg enforces Slice and ACT, but does not require confirm", async () => {
    const root = mkdtempSync(join(tmpdir(), "vibe-commit-gate-"));
    process.chdir(root);
    mkdirSync(join(root, ".vibe", "slices"), { recursive: true });
    writeFileSync(join(root, ".vibe", "slices", "slice-a.yml"), GOOD_ACT, "utf8");
    writeFileSync(join(root, "COMMIT_EDITMSG"), "Implement slice\n\nSlice: slice-a\n", "utf8");

    await expect(checkCommitMsgCommand(join(root, "COMMIT_EDITMSG"))).resolves.toBeUndefined();
  });

  it("pre-push confirm gate fails when confirm is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "vibe-confirm-missing-"));
    process.chdir(root);
    mkdirSync(join(root, ".vibe", "slices"), { recursive: true });
    writeFileSync(join(root, ".vibe", "slices", "slice-a.yml"), GOOD_ACT, "utf8");

    const failures = validateConfirmForFingerprint("slice-a", "abc123currentfingerprint");

    expect(failures.join("\n")).toContain("confirm.problem");
    expect(failures.join("\n")).toContain("confirm.diff_fingerprint");
  });

  it("pre-push confirm gate fails on stale fingerprint", () => {
    const root = mkdtempSync(join(tmpdir(), "vibe-confirm-stale-"));
    process.chdir(root);
    mkdirSync(join(root, ".vibe", "slices"), { recursive: true });
    writeFileSync(
      join(root, ".vibe", "slices", "slice-a.yml"),
      GOOD_ACT.replace('problem: ""', "problem: real problem described")
        .replace('files_why: ""', "files_why: source file changed to enforce the behavior")
        .replace('behavior_change: ""', "behavior_change: existing call now validates before returning")
        .replace('breakage_risk: ""', "breakage_risk: callers relying on invalid input may fail")
        .replace('verification: ""', "verification: npm test covers the changed behavior")
        .replace('diff_fingerprint: ""', "diff_fingerprint: oldfingerprint1234567890"),
      "utf8"
    );

    const failures = validateConfirmForFingerprint("slice-a", "newfingerprint1234567890");

    expect(failures.join("\n")).toContain("confirm diff fingerprint is stale");
  });

  it("fingerprint ignores diff context and includes lockfiles", () => {
    const withContext = `diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,2 +1,2 @@
 context before
-old lock content
+new lock content
 context after
`;
    const withoutContext = `diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,2 +1,2 @@
-old lock content
+new lock content
`;

    const first = fingerprintDiff(withContext);
    const second = fingerprintDiff(withoutContext);

    expect(first.hash).toBe(second.hash);
    expect(first.records.some((record) => record.path === "package-lock.json")).toBe(true);
  });
});
