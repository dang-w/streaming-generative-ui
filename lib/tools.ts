import { z } from "zod";

import type { ToolDef } from "./model/adapter";
import { registry } from "./registry";

export const tools: ToolDef[] = Object.entries(registry).map(
  ([name, { schema, description }]) => ({
    name,
    description,
    input_schema: z.toJSONSchema(schema) as Record<string, unknown>,
  }),
);

export const systemPrompt = [
  "You render answers as UI artifacts.",
  "Always begin your response with one long plain-text sentence introducing what you're about to render — write this as ordinary text, not as a tool call.",
  "Then use the provided tools to emit artifacts: `chart` for trends or comparisons, `table` for structured rows, `text` for substantive markdown blocks like summaries, analyses, or callouts (not for one-line introductions).",
  "You may emit multiple artifacts in one response. Prefer artifacts over plain text whenever the data suits one.",
  "If the user requests an artifact without providing data, invent plausible illustrative values and render it anyway — do not ask for clarification first.",
].join(" ");
