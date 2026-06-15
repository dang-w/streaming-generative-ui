import Anthropic from "@anthropic-ai/sdk";

import type { ModelAdapter, ModelStreamArgs, NormalisedEvent } from "./adapter";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const MAX_TOKENS = 2048;

export class AnthropicAdapter implements ModelAdapter {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(client?: Anthropic) {
    this.client = client ?? new Anthropic();
  }

  async *stream(args: ModelStreamArgs): AsyncIterable<NormalisedEvent> {
    const stream = this.client.messages.stream({
      model: args.model ?? DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: args.system,
      messages: args.messages,
      tools: args.tools.map((t) => ({
        name: t.name,
        description: t.description,
        // Anthropic's SDK types input_schema with required `type: "object"`.
        input_schema: t.input_schema as { type: "object"; [k: string]: unknown },
      })),
    });

    let activeToolName: string | null = null;
    let activeToolJson = "";

    for await (const event of stream) {
      switch (event.type) {
        case "content_block_start":
          if (event.content_block.type === "tool_use") {
            activeToolName = event.content_block.name;
            activeToolJson = "";
          }
          break;

        case "content_block_delta":
          if (event.delta.type === "text_delta") {
            yield { type: "text-delta", text: event.delta.text };
          } else if (event.delta.type === "input_json_delta") {
            activeToolJson += event.delta.partial_json;
          }
          break;

        case "content_block_stop":
          if (activeToolName !== null) {
            // Anthropic sends an empty string for tool calls with no args;
            // treat that as {} rather than a JSON parse error.
            const input =
              activeToolJson.length === 0 ? {} : JSON.parse(activeToolJson);
            yield { type: "tool-use", name: activeToolName, input };
            activeToolName = null;
            activeToolJson = "";
          }
          break;
      }
    }

    yield { type: "done" };
  }
}
