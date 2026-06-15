import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "../src/lib/constants.js";
import type { CommandResult } from "../src/lib/process.js";

const runMock = vi.hoisted(() => vi.fn<(
  command: string,
  args: string[],
  input?: string
) => CommandResult>());

vi.mock("../src/lib/process.js", () => ({
  run: runMock
}));

describe("security gates", () => {
  it("runs staged Gitleaks through stdin, never deprecated staged git flags", async () => {
    runMock.mockReturnValue({
      ok: true,
      status: 0,
      stdout: "",
      stderr: ""
    });
    const { runGitleaksOnStagedDiff } = await import("../src/lib/security.js");
    const diff = `diff --git a/.env b/.env
--- a/.env
+++ b/.env
@@ -0,0 +1 @@
+OPENAI_API_KEY=placeholder_value
`;

    const result = runGitleaksOnStagedDiff(diff, DEFAULT_CONFIG);

    expect(result.ok).toBe(true);
    expect(runMock).toHaveBeenCalledWith(
      "gitleaks",
      ["stdin", "--redact", "--no-banner"],
      "OPENAI_API_KEY=placeholder_value"
    );
    expect(runMock.mock.calls[0]?.[1]).not.toContain("--pre-commit");
    expect(runMock.mock.calls[0]?.[1]).not.toContain("--staged");
  });
});
