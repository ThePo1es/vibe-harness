import { describe, expect, it } from "vitest";
import { diffBudget, fingerprintDiff, parseUnifiedDiff } from "../src/lib/diff.js";

const DIFF = `diff --git a/src/a.ts b/src/a.ts
index 111..222 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,2 +1,2 @@
-const oldValue = 1;
+const newValue = 2;
 context line
diff --git a/package-lock.json b/package-lock.json
index 333..444 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,0 +1,2 @@
+{
+  "lockfileVersion": 3
`;

describe("diff parsing", () => {
  it("canonicalizes changed records", () => {
    const parsed = parseUnifiedDiff(DIFF);
    expect([...parsed.files]).toContain("src/a.ts");
    expect(parsed.records).toContainEqual({ path: "src/a.ts", op: "removed", content: "const oldValue = 1;" });
    expect(parsed.records).toContainEqual({ path: "src/a.ts", op: "added", content: "const newValue = 2;" });
  });

  it("keeps lockfiles in fingerprint", () => {
    const fingerprint = fingerprintDiff(DIFF);
    expect(fingerprint.records.some((record) => record.path === "package-lock.json")).toBe(true);
    expect(fingerprint.hash).toHaveLength(64);
  });

  it("excludes lockfiles from diff budget", () => {
    const budget = diffBudget(DIFF, ["**/package-lock.json", "package-lock.json"]);
    expect(budget.files).toBe(1);
    expect(budget.added).toBe(1);
    expect(budget.removed).toBe(1);
    expect(budget.excludedFiles).toEqual(["package-lock.json"]);
  });
});
