import { createHash } from "node:crypto";
import { minimatch } from "minimatch";
import type { DiffBudget, DiffRecord } from "./types.js";

type ParsedDiff = {
  files: Set<string>;
  records: DiffRecord[];
};

export function parseUnifiedDiff(diffText: string): ParsedDiff {
  const records: DiffRecord[] = [];
  const files = new Set<string>();
  let currentPath = "";
  let oldPath = "";

  for (const rawLine of normalizeText(diffText).split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const diffHeader = line.match(/^diff --git a\/(.+) b\/(.+)$/);
    if (diffHeader) {
      oldPath = diffHeader[1] ?? "";
      currentPath = diffHeader[2] ?? oldPath;
      files.add(currentPath);
      continue;
    }
    const renameTo = line.match(/^rename to (.+)$/);
    if (renameTo) {
      currentPath = renameTo[1] ?? currentPath;
      files.add(currentPath);
      records.push({ path: currentPath, op: "renamed", content: oldPath });
      continue;
    }
    if (line.startsWith("Binary files ") || line.startsWith("GIT binary patch")) {
      if (currentPath) {
        records.push({ path: currentPath, op: "binary", content: "" });
      }
      continue;
    }
    if (!currentPath || line.startsWith("+++") || line.startsWith("---") || line.startsWith("@@")) {
      continue;
    }
    if (line.startsWith("+")) {
      records.push({ path: currentPath, op: "added", content: line.slice(1) });
      continue;
    }
    if (line.startsWith("-")) {
      records.push({ path: currentPath, op: "removed", content: line.slice(1) });
    }
  }

  return { files, records };
}

export function fingerprintDiff(diffText: string): { hash: string; records: DiffRecord[] } {
  const { records } = parseUnifiedDiff(diffText);
  const canonicalRecords = records
    .map((record) => ({
      path: normalizePath(record.path),
      op: record.op,
      content: normalizeText(record.content)
    }))
    .sort((a, b) => `${a.path}\0${a.op}\0${a.content}`.localeCompare(`${b.path}\0${b.op}\0${b.content}`));
  const canonical = JSON.stringify(canonicalRecords);
  const hash = createHash("sha256").update(canonical).digest("hex");
  return { hash, records: canonicalRecords };
}

export function diffBudget(diffText: string, excludeGlobs: string[]): DiffBudget {
  const parsed = parseUnifiedDiff(diffText);
  const excludedFiles = [...parsed.files].filter((path) => isExcluded(path, excludeGlobs));
  const includedFiles = [...parsed.files].filter((path) => !isExcluded(path, excludeGlobs));
  let added = 0;
  let removed = 0;
  for (const record of parsed.records) {
    if (isExcluded(record.path, excludeGlobs)) {
      continue;
    }
    if (record.op === "added") {
      added += 1;
    }
    if (record.op === "removed") {
      removed += 1;
    }
  }
  return {
    files: includedFiles.length,
    added,
    removed,
    total: added + removed,
    excludedFiles
  };
}

export function addedLinesForSecretScan(diffText: string): string {
  const parsed = parseUnifiedDiff(diffText);
  return parsed.records
    .filter((record) => record.op === "added")
    .map((record) => record.content)
    .join("\n");
}

function isExcluded(path: string, globs: string[]): boolean {
  const normalized = normalizePath(path);
  return globs.some((glob) => minimatch(normalized, glob, { dot: true, nocase: process.platform === "win32" }));
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
