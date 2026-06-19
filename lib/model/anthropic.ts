import { anthropic } from "@ai-sdk/anthropic";
import { jsonSchema, streamText, tool, type ToolSet } from "ai";

import type { ModelAdapter, ModelStreamArgs, NormalisedEvent } from "./adapter";

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const MAX_TOKENS = 2048;

/**
 * Routes the model through the Vercel AI SDK Core (`streamText`) rather than the
 * raw `@anthropic-ai/sdk`. The provider is swappable in one line — point `model`
 * at `openai(...)` / `google(...)` and the same typed registry renders unchanged.
 * That swappability is the vendor-neutrality proof; the registry/route/renderer
 * never learn which provider produced the stream.
 *
 * Tools are schema-only (no `execute`): the model's tool-call *is* the artifact,
 * so generation runs a single step and finishes on `tool-calls`. AI SDK Core
 * accumulates the partial tool-input JSON internally, so we consume complete
 * `tool-call` parts and never deal with partial input at this boundary.
 */
export class AnthropicAdapter implements ModelAdapter {
  readonly name = "anthropic";

  async *stream(args: ModelStreamArgs): AsyncIterable<NormalisedEvent> {
    const tools: ToolSet = Object.fromEntries(
      args.tools.map((t) => [
        t.name,
        tool({
          description: t.description,
          inputSchema: jsonSchema(t.input_schema),
        }),
      ]),
    );

    const result = streamText({
      model: anthropic(args.model ?? DEFAULT_MODEL),
      maxOutputTokens: MAX_TOKENS,
      system: args.system,
      messages: args.messages,
      tools,
      toolChoice: "auto",
    });

    for await (const part of result.fullStream) {
      switch (part.type) {
        case "text-delta":
          yield { type: "text-delta", text: part.text };
          break;
        case "tool-call":
          yield { type: "tool-use", name: part.toolName, input: part.input };
          break;
        case "error":
          throw part.error;
      }
    }

    yield { type: "done" };
  }
}
