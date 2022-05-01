import { Assessment } from "@api/generated/API";

export const assessmentToString = (assessment?: Assessment): string =>
  assessment
    ? {
        [Assessment.Correct]: "🟩",
        [Assessment.Displaced]: "🟨",
        [Assessment.Incorrect]: "⬛",
      }[assessment]
    : "⬜";
