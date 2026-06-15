import { existsSync } from "node:fs";
import { join } from "node:path";
import { writeText } from "../lib/fs.js";
import { defaultConfigYaml, githubWorkflowYaml, lefthookYaml, semgrepRulesYaml } from "../lib/templates.js";
import { run, runTool } from "../lib/process.js";

type InitOptions = {
  force?: boolean;
};

export async function initCommand(options: InitOptions): Promise<void> {
  const root = process.cwd();
  const files = [
    [join(root, ".vibe", "config.yml"), defaultConfigYaml()],
    [join(root, "lefthook.yml"), lefthookYaml()],
    [join(root, ".github", "workflows", "vibe-harness.yml"), githubWorkflowYaml()],
    [join(root, ".semgrep", "vibe.yml"), semgrepRulesYaml()]
  ] as const;

  for (const [path] of files) {
    if (existsSync(path) && !options.force) {
      throw new Error(`${path} already exists. Re-run with --force to overwrite managed files.`);
    }
  }

  for (const [path, content] of files) {
    writeText(path, content);
    console.log(`created ${path}`);
  }

  const lefthook = runTool("lefthook", ["install"], undefined, root);
  if (lefthook.ok) {
    console.log("lefthook install: ok");
    return;
  }
  const npx = run("npx", ["lefthook", "install"], undefined, root);
  if (npx.ok) {
    console.log("npx lefthook install: ok");
    return;
  }
  console.warn("warning: lefthook install did not run. Install lefthook and run `lefthook install`.");
}
