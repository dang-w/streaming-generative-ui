import { z } from "zod";

import { registry, type ArtifactKind } from "@/lib/registry";

/**
 * The kind's schema rendered as JSON Schema, derived live from the REAL Zod
 * schema object via `z.toJSONSchema` — zero drift, and exactly what the model
 * receives as the tool `input_schema` (see lib/tools.ts). We derive rather than
 * read the `.ts` source because Turbopack can't `?raw`-import a module file
 * (it parses it and finds no default export), and a hand-copied string would
 * drift from what actually validates.
 */
export function schemaJson(kind: ArtifactKind): string {
  return JSON.stringify(z.toJSONSchema(registry[kind].schema), null, 2);
}
