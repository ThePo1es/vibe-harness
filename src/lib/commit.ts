import { readText } from "./fs.js";

const SLICE_TRAILER = /^Slice:\s*([A-Za-z0-9._-]+)\s*$/im;

export function parseSliceIdFromCommitMessage(message: string): string | null {
  const match = message.match(SLICE_TRAILER);
  return match?.[1] ?? null;
}

export function parseSliceIdFromCommitMessageFile(path: string): string | null {
  return parseSliceIdFromCommitMessage(readText(path));
}
