import { parseSliceIdFromCommitMessageFile } from "../lib/commit.js";
import { loadSlice, slicePath } from "../lib/fs.js";
import { formatIssues, validateSliceAct } from "../lib/validate.js";

export async function checkCommitMsgCommand(messageFile: string): Promise<void> {
  const sliceId = parseSliceIdFromCommitMessageFile(messageFile);
  if (!sliceId) {
    throw new Error("commit message must include `Slice: <id>` trailer");
  }
  const slice = loadSlice(sliceId);
  const issues = validateSliceAct(slice);
  if (issues.length > 0) {
    throw new Error(formatIssues(`ACT gate failed for ${slicePath(sliceId)}`, issues));
  }
  console.log(`ACT gate passed for Slice: ${sliceId}`);
}
