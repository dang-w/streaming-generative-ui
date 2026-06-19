/**
 * The SSE wire protocol between the generate route (server) and the stream hook
 * (client). Single source of truth so the two ends can't drift. `adapter`/`model`
 * are optional: the server always sends them on `done`, but a stream that closes
 * without a `done` event leaves them absent (the client degrades to "unknown").
 */
export type WireEvent =
  | { type: "text-delta"; text: string }
  | { type: "artifact"; kind: string; props: unknown }
  | { type: "error"; message: string }
  | { type: "done"; adapter?: string; model?: string | null };
