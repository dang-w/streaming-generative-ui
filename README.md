# Streaming Generative UI

> A Next.js app where a streamed agent response drives generative UI via a typed component registry — the model emits typed tool-calls validated against Zod schemas and rendered through a switch-free registry, streamed progressively to the client, with graceful fallback for unknown or malformed artifacts.

A four-day PoC built to make one thing real: **the registry pattern that lets an LLM render rich UI without a hardcoded `switch`, with type-safety from the model boundary through to the rendered component.** It is not a product, not an agent framework, not a chat app. The value here is the demonstrated judgement, not the surface area.

---

## Quick start

```bash
pnpm install
cp .env.local.example .env.local      # then add your ANTHROPIC_API_KEY
pnpm dev                              # http://localhost:3000
```

Try a prompt like:

> *"show me a quarterly sales chart, a one-paragraph summary, and a short prose intro narration"*

You should see the intro stream in word-by-word, then a bar chart materialise, then a markdown summary block — all progressively, off a single SSE connection.

### Swap the adapter

```bash
MODEL_ADAPTER=stub pnpm dev           # no API calls, fully deterministic
```

The stub emits a canned text-deltas → chart → table → text → done sequence. Useful for offline demos and as proof that the `ModelAdapter` boundary is real, not aspirational.

### Other routes

| Route             | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| `/`               | The live demo.                                                          |
| `/dev`            | Static fixtures rendered through `renderArtifact()` — every artifact, the unknown-kind fallback, and the schema-invalid fallback, all without the model in the loop. |
| `/api/generate`   | POST `{ prompt }` → SSE stream of `text-delta` / `artifact` / `done` events. |
| `/api/dev/smoke`  | GET → runs the adapter against a fixed prompt and reports per-tool-call schema validity. |

---

## What this actually proves

The architectural claim is small and concrete: **the registry is the single source of truth for every artifact, and everything else derives from it.**

```
┌───────────────────┐
│  lib/schemas.ts   │  Zod schemas — single source of structural truth
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  lib/registry.ts  │────▶│   lib/tools.ts   │────▶│ lib/model/...    │
│  satisfies-typed  │     │  z.toJSONSchema  │     │ AnthropicAdapter │
│  { schema, Cmp }  │     │  → tool defs     │     │ StubAdapter      │
└─────────┬─────────┘     └──────────────────┘     └────────┬─────────┘
          │                                                  │
          ▼                                                  ▼
┌───────────────────┐                            ┌────────────────────┐
│ lib/renderArtifact│◀───────────────────────────│ app/api/generate   │
│ lookup + safeParse│        SSE wire            │ ReadableStream     │
└─────────┬─────────┘                            └────────────────────┘
          │
          ▼
┌───────────────────┐
│  components/      │  ChartArtifact, TableArtifact, TextArtifact,
│  artifacts/*      │  UnknownArtifact, InvalidArtifact
└───────────────────┘
```

**Adding a fourth artifact is one registry entry and one component file.** The `// adding a 4th artifact = one entry here` marker in `lib/registry.ts` exists to make that property easy to verify at a glance.

---

## Architectural decisions

Eight decisions worth defending out loud.

1. **The registry is typed with `satisfies` (via a generic `entry<S>()` constructor), not annotated as a `Record`.** A flat `satisfies Record<string, { schema: ZodType, Component: ComponentType<…> }>` collapses `z.infer<ZodType>` to `unknown`, which breaks React's contravariant `ComponentType` typing. The `entry<S>()` helper threads the schema generic through to the component's prop type, so the registry literally refuses to pair `TextArtifact` with `chartSchema` at the type level. `satisfies` then preserves the literal keys (`"chart" | "table" | "text"`), which is what makes `keyof typeof registry` a real union rather than `string`.

2. **Everything derives from the registry.** `ArtifactKind = keyof typeof registry`. The `Artifact` discriminated union is a mapped type over the keys with `z.infer<…>` on each schema. The Anthropic tool defs are `Object.entries(registry).map(...)`. Runtime validation reuses the same Zod schemas. There is no parallel source of truth to drift.

3. **The renderer is switch-free.** `renderArtifact(kind, props)` does a registry lookup, runs `safeParse`, and either renders the matched component or falls back. Adding an artifact is one registry entry, not "one entry plus a new case in the renderer plus a new prop type plus a new tool def" — they all derive automatically.

4. **Fallbacks, not exceptions.** Unknown `kind` → `<UnknownArtifact>`. Failed `safeParse` → `<InvalidArtifact>` with the actual Zod issues displayed. Validation lives at the render boundary only, *not* on the wire — server-side validation would prevent `InvalidArtifact` from ever firing, defeating the point of demonstrating graceful failure handling.

5. **`ModelAdapter` is a narrow interface, deliberately.** Method signature is `stream({ system, messages, tools }) → AsyncIterable<NormalisedEvent>`. Events are `text-delta` / `tool-use` / `done`. The adapter accumulates partial JSON inside `tool_use` blocks so the route handler never deals with partial tool input — that pushes the wire format closer to the UI's needs and keeps the interface contract narrow enough to actually implement twice (`AnthropicAdapter` + `StubAdapter`).

6. **Streaming is plain SSE over POST.** `EventSource` is GET-only, which would have meant URL-encoding the prompt — fine for one-token, ugly for anything real. Manual `fetch` + a tiny SSE parser is ~30 lines, supports `AbortController` cancellation, and keeps the wire protocol observable in a `curl -N`.

7. **Schemas live in a non-`"use client"` module.** First attempt co-located Zod schemas with their components. The chart artifact is a client component (it animates on mount), and Next.js then replaced *every* export from that module with a client-reference proxy when the registry (a server module) tried to import it — so `entry.schema.safeParse` came back as `undefined` at runtime. Schemas moved to `lib/schemas.ts`; components keep type-only imports for their prop types. This also unblocks server-side tool-def derivation in `lib/tools.ts`.

8. **The chart is a custom inline SVG component, not a chart library.** v2 replaced Recharts with a small `Chart.tsx` driven by a pure `lib/chartGeometry.ts` (data → SVG coordinates). Recharts couldn't cleanly produce the engineering-plot aesthetic (mono dimension-line axes, the latest point ringed "active") *or* the line-draw stream-in motion (`pathLength` dash-offset), and dropping it removed a heavy dependency. The component takes the same `chartSchema` props.

---

## In scope / out of scope

**In:** three artifact kinds (chart, table, text); the registry + derived types; Zod validation; tool derivation; Anthropic streaming + tool use; SSE route + client consumption; progressive render; fallbacks; second swappable adapter (stub); this README.

**Out, deliberately:** multi-agent orchestration; persistence/DB; auth; eval harness; >3 artifact types; the `map` artifact (would need a third-party API key — scope-and-cost risk for a PoC); multi-turn chat; production-grade error handling beyond the two fallbacks; a test suite (one smoke check per phase — `/dev`, `/api/dev/smoke`, the curl path on `/api/generate`); deployment.

Calling out the out-of-scope list explicitly is itself a scope-judgement signal — every senior submission for a four-day window has a thing it isn't.

---

## How I used Claude Code (the judgement layer)

This PoC was built end-to-end in Claude Code in auto-edit mode against a tightly-scoped spec. The model wrote the code; my contribution was the spec, the architectural calls, and the judgement to catch the places where AI-generated code compiled but missed a real-world constraint. Concrete examples from this build:

1. **`"use client"` proxies for non-component exports.** First Phase-1 attempt co-located Zod schemas with their components. Hit a runtime `entry.schema.safeParse is not a function` because Next.js returns a client-reference *proxy* for every export of a `"use client"` module when imported from a server context — schemas included. Diagnosed from the SSR stack trace, redirected to a shared `lib/schemas.ts`, which also unblocked server-side tool derivation (decision 7).

2. **`satisfies Record<…>` collapsing `z.infer<ZodType>` to `unknown`.** First registry typing was a flat constraint that broke `ComponentType` contravariance. Redirected to the generic `entry<S>()` helper, which ties each component's prop type to its schema at the entry site (decision 1).

3. **`zod-to-json-schema` library is silently zod-3-only.** The spec called for it; against zod 4 it produced `{ "$schema": "…" }` and nothing else. Tested directly, switched to zod 4's native `z.toJSONSchema`, removed the dep.

4. **`EventSource` is GET-only.** The straight-from-the-spec interpretation was to use `EventSource` on the client. With a POST-able prompt body, that doesn't work — chose `fetch` + a manual SSE reader instead (decision 6).

5. **Default system prompt biased the model to wrap *all* prose into `text` artifacts**, including one-line intros, AND made the model ask for clarification when no data was provided. Demo killer. Tuned the prompt to explicitly start with plain-text narration (streamed text-deltas) and to invent plausible illustrative data on under-specified prompts.

6. **`@tailwindcss/typography` was never wired up.** Tailwind v4 + Next.js scaffolding doesn't install the plugin by default; the `prose` classes on TextArtifact were no-ops. Caught visually (an H1 that didn't look like a heading), installed and `@plugin`-ed it.

Each of those is a place where the generated code would have passed code review at a glance. The judgement isn't writing more code; it's recognising the gap.

---

## Project layout

```
app/
  api/
    generate/route.ts        # SSE handler: POST prompt → text-delta/artifact/done
    dev/smoke/route.ts       # Phase-2 smoke: validates each tool call against its schema
  dev/page.tsx               # Static fixture page (Phase-1 visual check)
  page.tsx                   # The live demo
components/artifacts/
  ChartArtifact.tsx          # Thin wrapper over the custom SVG Chart
  Chart.tsx                  # Custom inline SVG chart (no chart lib)
  TableArtifact.tsx          # Plain HTML + Tailwind
  TextArtifact.tsx           # react-markdown
  UnknownArtifact.tsx        # Fallback: kind not in registry
  InvalidArtifact.tsx        # Fallback: schema validation failed
hooks/
  useArtifactStream.ts       # fetch + manual SSE reader; ordered timeline state
lib/
  schemas.ts                 # Zod schemas — single source of structural truth
  registry.ts                # The registry. Adding an artifact = one entry here.
  renderArtifact.tsx         # Switch-free lookup + safeParse + fallbacks
  tools.ts                   # Tool defs derived from registry; system prompt
  model/
    adapter.ts               # ModelAdapter interface + NormalisedEvent types
    anthropic.ts             # Real adapter — wraps @anthropic-ai/sdk streaming
    stub.ts                  # Canned-events adapter for offline demos
docs/spec.md                 # The original planning spec (gitignored — private)
PLAN.md                      # The session execution tracker
```

---

## Stack

- Next.js 16 (App Router) + TypeScript `strict: true` + Turbopack
- `@anthropic-ai/sdk` for streaming + tool use
- Zod 4 (uses native `z.toJSONSchema`, no third-party converter)
- Tailwind v4 + `@tailwindcss/typography`
- Custom inline SVG chart (no chart library), react-markdown (text artifact)
- Dev model: `claude-haiku-4-5`. Demo model: `claude-sonnet-4-6`. Both configurable via `ANTHROPIC_MODEL`.
