import { AnthropicAdapter } from "@/lib/model/anthropic";
import { StubAdapter } from "@/lib/model/stub";
import type { ModelAdapter } from "@/lib/model/adapter";
import { systemPrompt, tools } from "@/lib/tools";

export const runtime = "nodejs";

type WireEvent =
  | { type: "text-delta"; text: string }
  | { type: "artifact"; kind: string; props: unknown }
  | { type: "error"; message: string }
  | { type: "done" };

function sseLine(event: WireEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function getAdapter(): ModelAdapter {
  const choice = (process.env.MODEL_ADAPTER ?? "anthropic").toLowerCase();
  if (choice === "stub") return new StubAdapter();
  return new AnthropicAdapter();
}

export async function POST(req: Request) {
  const adapter = getAdapter();

  if (adapter.name === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not set in .env.local" },
      { status: 500 },
    );
  }

  let prompt: string;
  try {
    const body = (await req.json()) as { prompt?: unknown };
    if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
      return Response.json({ error: "prompt must be a non-empty string" }, { status: 400 });
    }
    prompt = body.prompt;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of adapter.stream({
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
          tools,
        })) {
          if (event.type === "text-delta") {
            controller.enqueue(encoder.encode(sseLine({ type: "text-delta", text: event.text })));
          } else if (event.type === "tool-use") {
            controller.enqueue(
              encoder.encode(
                sseLine({ type: "artifact", kind: event.name, props: event.input }),
              ),
            );
          } else if (event.type === "done") {
            controller.enqueue(encoder.encode(sseLine({ type: "done" })));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            sseLine({
              type: "error",
              message: err instanceof Error ? err.message : String(err),
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
