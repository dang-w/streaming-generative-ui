import type { ArtifactKind } from "@/lib/registry";

/** The real Zod export name for each kind — the x-ray cross-reference anchor. */
export const SCHEMA_NAME: Record<ArtifactKind, string> = {
  chart: "chartSchema",
  table: "tableSchema",
  metric: "metricSchema",
  text: "textSchema",
};
