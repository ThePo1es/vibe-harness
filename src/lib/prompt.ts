import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type AskOptions = {
  defaultValue?: string;
  required?: boolean;
};

export async function ask(question: string, options: AskOptions = {}): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error(`interactive input required for: ${question}`);
  }
  const rl = createInterface({ input, output });
  try {
    const suffix = options.defaultValue ? ` [${options.defaultValue}]` : "";
    const answer = await rl.question(`${question}${suffix}\n> `);
    const value = answer.trim() || options.defaultValue || "";
    if (options.required && !value.trim()) {
      throw new Error(`answer required for: ${question}`);
    }
    return value;
  } finally {
    rl.close();
  }
}
