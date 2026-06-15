import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export type CommandResult = {
  ok: boolean;
  status: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
};

export function run(command: string, args: string[], input?: string, cwd = process.cwd()): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    input,
    encoding: "utf8",
    shell: false,
    windowsHide: true
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error
  };
}

export function runTool(command: string, args: string[], input?: string, cwd = process.cwd()): CommandResult {
  const local = localBin(command, cwd);
  if (local) {
    return run(local, args, input, cwd);
  }
  return run(command, args, input, cwd);
}

export function commandExists(command: string): boolean {
  if (localBin(command)) {
    return true;
  }
  const probe = process.platform === "win32"
    ? run("where.exe", [command])
    : run("sh", ["-lc", `command -v ${shellQuote(command)}`]);
  return probe.ok;
}

export function toolVersion(command: string, args = ["--version"]): string | null {
  const result = runTool(command, args);
  if (!result.ok) {
    return null;
  }
  return (result.stdout || result.stderr).trim().split(/\r?\n/)[0] ?? null;
}

function localBin(command: string, cwd = process.cwd()): string | null {
  const suffixes = process.platform === "win32" ? [".cmd", ".exe", ""] : [""];
  let current = resolve(cwd);
  while (true) {
    for (const suffix of suffixes) {
      const candidate = join(current, "node_modules", ".bin", `${command}${suffix}`);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
    const next = dirname(current);
    if (next === current) {
      return null;
    }
    current = next;
  }
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
