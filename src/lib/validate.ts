import { ACT_FIELDS, CONFIRM_FIELDS, PLACEHOLDER_VALUES } from "./constants.js";
import type { SliceFile, ValidationIssue } from "./types.js";

export function validateSliceAct(slice: SliceFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!slice.id || !isMeaningful(slice.id, 2)) {
    issues.push({ field: "id", message: "slice id is missing or placeholder text" });
  }
  for (const field of ACT_FIELDS) {
    const value = slice.act?.[field];
    if (!isMeaningful(value)) {
      issues.push({
        field: `act.${field}`,
        message: `${field} must be a concrete, non-placeholder answer`
      });
    }
  }
  return issues;
}

export function validateSliceConfirm(slice: SliceFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of CONFIRM_FIELDS) {
    const value = slice.confirm?.[field];
    if (!isMeaningful(value)) {
      issues.push({
        field: `confirm.${field}`,
        message: `${field} must be a concrete, non-placeholder answer`
      });
    }
  }
  if (!isMeaningful(slice.confirm?.diff_fingerprint, 16)) {
    issues.push({
      field: "confirm.diff_fingerprint",
      message: "confirm must be refreshed with the current branch diff fingerprint"
    });
  }
  return issues;
}

export function isMeaningful(value: unknown, minLength = 8): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < minLength) {
    return false;
  }
  return !PLACEHOLDER_VALUES.has(normalized.toLowerCase());
}

export function formatIssues(title: string, issues: ValidationIssue[]): string {
  const body = issues.map((issue) => `- ${issue.field}: ${issue.message}`).join("\n");
  return `${title}\n${body}`;
}
