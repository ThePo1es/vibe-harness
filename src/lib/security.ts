import { addedLinesForSecretScan } from "./diff.js";
import { run } from "./process.js";
import type { VibeConfig } from "./types.js";

export type GateResult = {
  ok: boolean;
  message: string;
};

export function runGitleaksOnStagedDiff(diffText: string, config: VibeConfig): GateResult {
  if (config.security.gitleaks === "off") {
    return { ok: true, message: "gitleaks disabled" };
  }
  const addedLines = addedLinesForSecretScan(diffText);
  if (!addedLines.trim()) {
    return { ok: true, message: "gitleaks skipped: no added staged content" };
  }
  const result = run("gitleaks", ["stdin", "--redact", "--no-banner"], addedLines);
  if (result.ok) {
    return { ok: true, message: "gitleaks staged stdin scan passed" };
  }
  const detail = result.error?.message || result.stderr || result.stdout || "gitleaks failed";
  if (config.security.gitleaks === "warn") {
    return { ok: true, message: `warning: ${detail.trim()}` };
  }
  return {
    ok: false,
    message: `gitleaks staged stdin scan failed:\n${detail.trim()}\nInstall or fix findings, then retry.`
  };
}

export function runGitleaksFull(config: VibeConfig): GateResult {
  if (config.security.gitleaks === "off") {
    return { ok: true, message: "gitleaks disabled" };
  }
  let result = run("gitleaks", ["git", "--redact", "--no-banner"]);
  if (!result.ok && result.error) {
    result = run("docker", [
      "run",
      "--rm",
      "-v",
      `${process.cwd()}:/repo`,
      "ghcr.io/gitleaks/gitleaks:latest",
      "git",
      "--redact",
      "--no-banner",
      "/repo"
    ]);
  }
  if (result.ok) {
    return { ok: true, message: "gitleaks full git scan passed" };
  }
  const detail = result.error?.message || result.stderr || result.stdout || "gitleaks failed";
  if (config.security.gitleaks === "warn") {
    return { ok: true, message: `warning: ${detail.trim()}` };
  }
  return { ok: false, message: `gitleaks full git scan failed:\n${detail.trim()}` };
}

export function runSemgrep(config: VibeConfig): GateResult {
  if (config.security.semgrep === "off") {
    return { ok: true, message: "semgrep disabled" };
  }
  const result = run("semgrep", ["scan", "--config", config.security.semgrep_config, "--error", "."]);
  if (result.ok) {
    return { ok: true, message: "semgrep scan passed" };
  }
  const detail = result.error?.message || result.stderr || result.stdout || "semgrep failed";
  if (config.security.semgrep === "warn") {
    return { ok: true, message: `warning: ${detail.trim()}` };
  }
  return { ok: false, message: `semgrep scan failed:\n${detail.trim()}` };
}
