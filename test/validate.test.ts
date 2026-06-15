import { describe, expect, it } from "vitest";
import { sliceTemplate } from "../src/lib/templates.js";
import { validateSliceAct, validateSliceConfirm } from "../src/lib/validate.js";

describe("slice validation", () => {
  it("rejects placeholder ACT fields", () => {
    const slice = sliceTemplate("rate-limit", "Rate limit", {
      actor: "TODO",
      trigger: "user submits credentials",
      input: "login form payload",
      rule: "limit repeated failed attempts",
      state_change: "failed attempt counter increases",
      output: "request is rejected after the limit",
      failure: "storage failure returns a safe error",
      test: "unit test covers locked account response",
      non_goal: "password reset is not part of this slice"
    });

    expect(validateSliceAct(slice)).toContainEqual({
      field: "act.actor",
      message: "actor must be a concrete, non-placeholder answer"
    });
  });

  it("accepts complete ACT fields", () => {
    const slice = sliceTemplate("rate-limit", "Rate limit", {
      actor: "unauthenticated user attempting login",
      trigger: "user submits credentials",
      input: "login form payload",
      rule: "limit repeated failed attempts",
      state_change: "failed attempt counter increases",
      output: "request is rejected after the limit",
      failure: "storage failure returns a safe error",
      test: "unit test covers locked account response",
      non_goal: "password reset is not part of this slice"
    });

    expect(validateSliceAct(slice)).toEqual([]);
  });

  it("requires confirm fingerprint", () => {
    const slice = sliceTemplate("rate-limit", "Rate limit", {
      actor: "unauthenticated user attempting login",
      trigger: "user submits credentials",
      input: "login form payload",
      rule: "limit repeated failed attempts",
      state_change: "failed attempt counter increases",
      output: "request is rejected after the limit",
      failure: "storage failure returns a safe error",
      test: "unit test covers locked account response",
      non_goal: "password reset is not part of this slice"
    });
    slice.confirm = {
      problem: "the endpoint currently allows repeated attempts",
      files_why: "auth controller and tests changed for this slice",
      behavior_change: "excess attempts now return an error",
      breakage_risk: "legitimate users may be rate limited too aggressively",
      verification: "npm test covers the limit behavior",
      diff_fingerprint: ""
    };

    expect(validateSliceConfirm(slice).map((issue) => issue.field)).toContain("confirm.diff_fingerprint");
  });
});
