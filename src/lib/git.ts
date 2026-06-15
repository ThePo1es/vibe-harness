import { run } from "./process.js";

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitError";
  }
}

export function git(args: string[], cwd = process.cwd()): string {
  const result = run("git", args, undefined, cwd);
  if (!result.ok) {
    const detail = result.error?.message || result.stderr || result.stdout || "unknown git error";
    throw new GitError(`git ${args.join(" ")} failed: ${detail.trim()}`);
  }
  return result.stdout;
}

export function gitRoot(cwd = process.cwd()): string {
  return git(["rev-parse", "--show-toplevel"], cwd).trim();
}

export function currentHead(cwd = process.cwd()): string {
  return git(["rev-parse", "HEAD"], cwd).trim();
}

export function mergeBase(base: string, cwd = process.cwd()): string {
  const result = run("git", ["merge-base", base, "HEAD"], undefined, cwd);
  if (result.ok) {
    return result.stdout.trim();
  }
  return base;
}

export function branchDiff(base: string, cwd = process.cwd()): string {
  const from = mergeBase(base, cwd);
  return git(["diff", "--no-ext-diff", "--no-color", "--find-renames", "--binary", "--unified=0", `${from}...HEAD`], cwd);
}

export function stagedDiff(cwd = process.cwd()): string {
  return git(["diff", "--cached", "--no-ext-diff", "--no-color", "--unified=0", "--diff-filter=ACMR"], cwd);
}
