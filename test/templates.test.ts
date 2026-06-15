import { describe, expect, it } from "vitest";
import YAML from "yaml";
import { DEFAULT_CONFIG } from "../src/lib/constants.js";
import { defaultConfigYaml, githubWorkflowYaml, lefthookYaml } from "../src/lib/templates.js";

describe("generated harness wiring", () => {
  it("wires commit-msg to ACT validation and pre-push to confirm validation", () => {
    const config = YAML.parse(lefthookYaml());

    expect(config["commit-msg"].commands["vibe-commit-msg"].run).toBe(
      "npx vibe-harness check-commit-msg {1}"
    );
    expect(config["pre-push"].commands["vibe-pre-push"].run).toBe(
      "npx vibe-harness check --pre-push"
    );
    expect(JSON.stringify(config["commit-msg"])).not.toContain("confirm");
  });

  it("defaults Semgrep to a committed local rules file, not registry auto", () => {
    const config = YAML.parse(defaultConfigYaml());

    expect(config.security.semgrep_config).toBe(".semgrep/vibe.yml");
    expect(config.security.semgrep_config).not.toBe("auto");
    expect(githubWorkflowYaml()).not.toContain("--config auto");
  });

  it("keeps dependency audit as warning by default", () => {
    expect(DEFAULT_CONFIG.audit.dependency).toBe("warn");
  });
});
