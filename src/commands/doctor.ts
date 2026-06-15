import { existsSync } from "node:fs";
import { join } from "node:path";
import { commandExists, toolVersion } from "../lib/process.js";
import { detectProfile } from "../lib/profile.js";

export async function doctorCommand(): Promise<void> {
  const checks = [
    toolCheck("git", "winget install --id Git.Git -e --source winget"),
    toolCheck("lefthook", "npm install -D lefthook"),
    toolCheck("gitleaks", "winget install -e --id Gitleaks.Gitleaks"),
    toolCheck("semgrep", "python -m pip install semgrep")
  ];

  for (const check of checks) {
    console.log(check);
  }

  const profile = detectProfile();
  console.log(`profile: ${profile}`);
  if (profile === "node") {
    const packagePath = join(process.cwd(), "package.json");
    console.log(`package.json: ${existsSync(packagePath) ? "found" : "missing"}`);
  }
}

function toolCheck(command: string, installHint: string): string {
  if (!commandExists(command)) {
    return `${command}: missing. Install: ${installHint}`;
  }
  return `${command}: ${toolVersion(command) ?? "found"}`;
}
