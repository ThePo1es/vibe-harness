import { ACT_FIELDS } from "../lib/constants.js";
import { loadConfig, saveConfig, saveSlice } from "../lib/fs.js";
import { ask } from "../lib/prompt.js";
import { sliceTemplate } from "../lib/templates.js";
import { formatIssues, validateSliceAct } from "../lib/validate.js";

type NewSliceOptions = {
  title?: string;
};

const QUESTIONS: Record<string, string> = {
  actor: "Actor: who performs this behavior?",
  trigger: "Trigger: what starts the behavior?",
  input: "Input: what data or event enters the system?",
  rule: "Rule: what rule must be applied?",
  state_change: "State Change: what state changes, or why is there no state change?",
  output: "Output: what observable output is produced?",
  failure: "Failure: what can fail and how is failure surfaced?",
  test: "Test: what exact check proves this slice is done?",
  non_goal: "Non-goal: what is intentionally out of scope?"
};

export async function newSliceCommand(id: string, options: NewSliceOptions): Promise<void> {
  const title = options.title ?? await ask("Title: short slice title?", { defaultValue: `${id} slice` });
  const act: Record<string, string> = {};
  for (const field of ACT_FIELDS) {
    act[field] = await ask(QUESTIONS[field], { required: true });
  }
  const slice = sliceTemplate(id, title, act);
  const issues = validateSliceAct(slice);
  if (issues.length > 0) {
    throw new Error(formatIssues("slice ACT is incomplete", issues));
  }
  saveSlice(slice);
  const config = loadConfig();
  config.active_slice = id;
  saveConfig(config);
  console.log(`created .vibe/slices/${id}.yml`);
  console.log(`active slice set to ${id}`);
}
