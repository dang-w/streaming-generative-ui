export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ToolDef = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export type NormalisedEvent =
  | { type: "text-delta"; text: string }
  | { type: "tool-use"; name: string; input: unknown }
  | { type: "done" };

export type ModelStreamArgs = {
  system: string;
  messages: ChatMessage[];
  tools: ToolDef[];
  model?: string;
};

export interface ModelAdapter {
  readonly name: string;
  stream(args: ModelStreamArgs): AsyncIterable<NormalisedEvent>;
}
