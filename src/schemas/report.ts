import { z } from "zod";

// What a client may send to POST /api/ai. Checked BEFORE anything is
// sent to Gemini, because every request that reaches Gemini is
// counted against your free quota. A request that was never going to
// work should cost nothing.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe the item in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

// What Gemini has to send BACK. This one schema is used three ways:
//   1. z.infer below turns it into the ReportDraft type.
//   2. z.toJSONSchema at the bottom turns it into the JSON Schema
//      that is sent to Gemini with every request.
//   3. reportDraftSchema.safeParse checks the reply (Stage 4).
// .describe() is not a comment: the text travels to Gemini and tells
// it what each field is for.
export const reportDraftSchema = z.object({
  title: z
    .string()
    .describe(
      "A short listing title, under 60 characters, naming the item and one detail that sets it apart.",
    ),
  category: z
    .enum(["bags", "electronics", "clothing", "documents", "accessories", "other"])
    .describe("The kind of item being reported."),
  tags: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe(
      "Search keywords someone might type to find this item, such as colour, brand or place.",
    ),
  missingDetails: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe(
      "Details the report leaves out that would help match the item to its owner.",
    ),
  clarity: z
    .enum(["clear", "needs-detail", "too-vague"])
    .describe("How well the description identifies this specific item."),
});

export type ReportDraft = z.infer<typeof reportDraftSchema>;

// Computed once, when this file is first imported -- not per request.
export const reportDraftJsonSchema = z.toJSONSchema(reportDraftSchema);