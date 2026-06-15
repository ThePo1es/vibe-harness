#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { newSliceCommand } from "./commands/new-slice.js";
import { checkCommitMsgCommand } from "./commands/check-commit-msg.js";
import { confirmCommand } from "./commands/confirm.js";
import { checkCommand } from "./commands/check.js";
import { doctorCommand } from "./commands/doctor.js";

const program = new Command();

program
  .name("vibe-harness")
  .description("Confirm and ACT slice enforcement for AI-assisted coding")
  .version("0.1.0");

program
  .command("init")
  .description("Install vibe-harness config, Lefthook wiring, and CI files")
  .option("--force", "overwrite managed files")
  .action(initCommand);

program
  .command("new-slice")
  .argument("<id>", "slice id")
  .description("Create a new ACT slice interactively")
  .option("--title <title>", "slice title")
  .action(newSliceCommand);

program
  .command("confirm")
  .argument("<id>", "slice id")
  .description("Record confirm answers against the branch-vs-base diff")
  .option("--base <ref>", "base ref for branch diff")
  .action(confirmCommand);

program
  .command("check-commit-msg")
  .argument("<messageFile>", "Git commit message file")
  .description("Validate Slice trailer and ACT fields")
  .action(checkCommitMsgCommand);

program
  .command("check")
  .description("Run harness checks")
  .option("--staged", "check staged diff")
  .option("--pre-push", "check branch confirm and profile gates")
  .option("--ci", "run CI checks")
  .option("--base <ref>", "base ref for branch diff")
  .action(checkCommand);

program
  .command("doctor")
  .description("Diagnose required tools and project profile")
  .action(doctorCommand);

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`vibe-harness: ${message}`);
  process.exitCode = 1;
});
