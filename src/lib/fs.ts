import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import YAML from "yaml";
import { DEFAULT_CONFIG } from "./constants.js";
import type { SliceFile, VibeConfig } from "./types.js";

export function readText(path: string): string {
  return readFileSync(path, "utf8");
}

export function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export function configPath(root = process.cwd()): string {
  return join(root, ".vibe", "config.yml");
}

export function slicePath(id: string, root = process.cwd()): string {
  return join(root, ".vibe", "slices", `${id}.yml`);
}

export function loadConfig(root = process.cwd()): VibeConfig {
  const path = configPath(root);
  if (!existsSync(path)) {
    return structuredClone(DEFAULT_CONFIG) as VibeConfig;
  }
  const parsed = YAML.parse(readText(path)) ?? {};
  return mergeConfig(parsed);
}

export function saveConfig(config: VibeConfig, root = process.cwd()): void {
  writeText(configPath(root), YAML.stringify(config));
}

export function loadSlice(id: string, root = process.cwd()): SliceFile {
  const path = slicePath(id, root);
  if (!existsSync(path)) {
    throw new Error(`slice file not found: ${path}`);
  }
  return YAML.parse(readText(path)) as SliceFile;
}

export function saveSlice(slice: SliceFile, root = process.cwd()): void {
  writeText(slicePath(slice.id, root), YAML.stringify(slice));
}

function mergeConfig(input: Partial<VibeConfig>): VibeConfig {
  const defaults = structuredClone(DEFAULT_CONFIG) as VibeConfig;
  return {
    ...defaults,
    ...input,
    diff: {
      ...defaults.diff,
      ...(input.diff ?? {})
    },
    security: {
      ...defaults.security,
      ...(input.security ?? {})
    },
    audit: {
      ...defaults.audit,
      ...(input.audit ?? {})
    },
    profiles: {
      ...defaults.profiles,
      ...(input.profiles ?? {})
    }
  };
}
