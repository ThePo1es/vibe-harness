import { parseSliceIdFromCommitMessage } from "../lib/commit.js";
import { branchDiff, git, stagedDiff } from "../lib/git.js";
import { diffBudget, fingerprintDiff } from "../lib/diff.js";
import { loadConfig, loadSlice } from "../lib/fs.js";
import { runGitleaksFull, runGitleaksOnStagedDiff, runSemgrep } from "../lib/security.js";
import { runProfileChecks } from "../lib/profile.js";
import { formatIssues, validateSliceConfirm } from "../lib/validate.js";

type CheckOptions = {
  staged?: boolean;
  prePush?: boolean;
  ci?: boolean;
  base?: string;
};

export async function checkCommand(options: CheckOptions): Promise<void> {
  const config = loadConfig();
  const failures: string[] = [];

  if (options.staged) {
    const diff = stagedDiff();
    const budget = diffBudget(diff, config.diff.budget_exclude);
    if (budget.files > config.diff.max_files) {
      failures.push(`diff budget failed: ${budget.files} files > ${config.diff.max_files}`);
    }
    if (budget.added > config.diff.max_added_lines) {
      failures.push(`diff budget failed: ${budget.added} added lines > ${config.diff.max_added_lines}`);
    }
    if (budget.total > config.diff.max_total_lines) {
      failures.push(`diff budget failed: ${budget.total} changed lines > ${config.diff.max_total_lines}`);
    }
    const gitleaks = runGitleaksOnStagedDiff(diff, config);
    console.log(gitleaks.message);
    if (!gitleaks.ok) {
      failures.push(gitleaks.message);
    }
  }

  if (options.prePush || options.ci) {
    const base = options.base ?? config.base;
    const sliceId = resolveActiveSliceId(config.active_slice);
    if (!sliceId) {
      failures.push("could not resolve active slice id. Set .vibe/config.yml active_slice or include Slice: <id> in the latest commit.");
    } else {
      failures.push(...validateConfirmForBranch(sliceId, base));
    }

    for (const result of runProfileChecks(config)) {
      console.log(result.message);
      if (!result.ok) {
        failures.push(result.message);
      }
    }

    if (options.ci) {
      const gitleaks = runGitleaksFull(config);
      console.log(gitleaks.message);
      if (!gitleaks.ok) {
        failures.push(gitleaks.message);
      }
      const semgrep = runSemgrep(config);
      console.log(semgrep.message);
      if (!semgrep.ok) {
        failures.push(semgrep.message);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`vibe-harness check failed\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }
  console.log("vibe-harness check passed");
}

function resolveActiveSliceId(configured: string | null): string | null {
  if (configured) {
    return configured;
  }
  const latestMessage = git(["log", "-1", "--pretty=%B"]);
  return parseSliceIdFromCommitMessage(latestMessage);
}

function validateConfirmForBranch(sliceId: string, base: string): string[] {
  const current = fingerprintDiff(branchDiff(base));
  return validateConfirmForFingerprint(sliceId, current.hash, base);
}

export function validateConfirmForFingerprint(sliceId: string, currentFingerprint: string, base = "main"): string[] {
  const failures: string[] = [];
  const slice = loadSlice(sliceId);
  const issues = validateSliceConfirm(slice);
  if (issues.length > 0) {
    failures.push(formatIssues(`confirm gate failed for Slice: ${sliceId}`, issues));
  }
  if (slice.confirm?.diff_fingerprint && slice.confirm.diff_fingerprint !== currentFingerprint) {
    failures.push(
      `confirm diff fingerprint is stale for Slice: ${sliceId}. ` +
      `expected current ${currentFingerprint}, found ${slice.confirm.diff_fingerprint}. Run \`npx vibe-harness confirm ${sliceId} --base ${base}\`.`
    );
  }
  return failures;
}
