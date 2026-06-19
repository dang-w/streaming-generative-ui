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
  "Begin your response with a short plain-text paragraph (two to four sentences) that genuinely frames what you're about to render — name the artifacts and what they show, in order. Write this as ordinary text, not as a tool call. Keep it real: describe the actual output, do not pad.",
  "Then use the provided tools to emit artifacts: `chart` for trends or comparisons, `table` for structured rows, `metric` for a single headline number (a stat card), `text` for substantive markdown blocks like summaries, analyses, or callouts (not for one-line introductions).",
  "You may emit multiple artifacts in one response. Prefer artifacts over plain text whenever the data suits one.",
  "If the user requests an artifact without providing data, invent plausible illustrative values and render it anyway — do not ask for clarification first.",
].join(" ");
