import { AnthropicAdapter } from "@/lib/model/anthropic";
import { registry, type ArtifactKind } from "@/lib/registry";
import { systemPrompt, tools } from "@/lib/tools";

const SMOKE_PROMPT =
  "Show me a bar chart of quarterly sales (Q1 4.2, Q2 5.1, Q3 6.0, Q4 7.3 in USD m) and a one-paragraph markdown summary explaining the trend.";

type ToolResult = {
  name: string;
  knownKind: boolean;
  schemaValid: boolean;
  issues?: { path: string; message: string }[];
};

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { ok: false, error: "ANTHROPIC_API_KEY not set in .env.local" },
      { status: 500 },
    );
  }

  const adapter = new AnthropicAdapter();
  const textChunks: string[] = [];
  const toolResults: ToolResult[] = [];

  try {
    for await (const event of adapter.stream({
      system: systemPrompt,
      messages: [{ role: "user", content: SMOKE_PROMPT }],
      tools,
    })) {
      if (event.type === "text-delta") {
        textChunks.push(event.text);
      } else if (event.type === "tool-use") {
        const known = event.name in registry;
        if (!known) {
          toolResults.push({
            name: event.name,
            knownKind: false,
            schemaValid: false,
          });
          continue;
        }
        const entry = registry[event.name as ArtifactKind];
        const parsed = entry.schema.safeParse(event.input);
        toolResults.push({
          name: event.name,
          knownKind: true,
          schemaValid: parsed.success,
          issues: parsed.success
            ? undefined
            : parsed.error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
              })),
        });
      }
    }
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const allValid =
    toolResults.length > 0 && toolResults.every((r) => r.knownKind && r.schemaValid);

  return Response.json({
    ok: allValid,
    model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5",
    adapter: adapter.name,
    text: textChunks.join(""),
    toolCallCount: toolResults.length,
    toolResults,
  });
}
