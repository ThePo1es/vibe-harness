import { describe, expect, it } from "vitest";
import { parseSliceIdFromCommitMessage } from "../src/lib/commit.js";

describe("commit parsing", () => {
  it("extracts Slice trailer", () => {
    expect(parseSliceIdFromCommitMessage("Add feature\n\nSlice: login-rate-limit\n")).toBe("login-rate-limit");
  });

  it("rejects missing Slice trailer", () => {
    expect(parseSliceIdFromCommitMessage("Add feature\n")).toBeNull();
  });
});
