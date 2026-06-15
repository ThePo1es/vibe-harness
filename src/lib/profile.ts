import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "./process.js";
import type { GateResult } from "./security.js";
import type { VibeConfig } from "./types.js";

type PackageJson = {
  scripts?: Record<string, string>;
};

export function detectProfile(root = process.cwd()): "node" | "custom" {
  if (existsSync(join(root, "package.json"))) {
    return "node";
  }
  return "custom";
}

export function runProfileChecks(config: VibeConfig, root = process.cwd()): GateResult[] {
  const profile = config.profiles.active === "auto" ? detectProfile(root) : config.profiles.active;
  if (profile !== "node") {
    return [{ ok: true, message: `profile ${profile} has no built-in checks in v0.1.0` }];
  }
  return runNodeChecks(config, root);
}

function runNodeChecks(config: VibeConfig, root: string): GateResult[] {
  const packageJson = readPackageJson(root);
  const scripts = packageJson.scripts ?? {};
  const results: GateResult[] = [];
  for (const script of ["lint", "typecheck", "test"]) {
    if (!scripts[script]) {
      results.push({ ok: true, message: `node ${script}: script missing, skipped` });
      continue;
    }
    const result = run("npm", ["run", script], undefined, root);
    results.push({
      ok: result.ok,
      message: result.ok
        ? `node ${script}: passed`
        : `node ${script}: failed\n${(result.stderr || result.stdout).trim()}`
    });
  }
  if (config.audit.dependency !== "off") {
    const audit = run("npm", ["audit", "--audit-level=high"], undefined, root);
    const message = audit.ok
      ? "node dependency audit: passed"
      : `warning: node dependency audit found issues\n${(audit.stderr || audit.stdout).trim()}`;
    results.push({ ok: config.audit.dependency === "required" ? audit.ok : true, message });
  }
  return results;
}

function readPackageJson(root: string): PackageJson {
  const path = join(root, "package.json");
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}
