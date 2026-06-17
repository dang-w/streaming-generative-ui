import type { ComponentType } from "react";
import type { z } from "zod";

import { ChartArtifact } from "@/components/artifacts/ChartArtifact";
import { MetricArtifact } from "@/components/artifacts/MetricArtifact";
import { TableArtifact } from "@/components/artifacts/TableArtifact";
import { TextArtifact } from "@/components/artifacts/TextArtifact";

import { chartSchema, metricSchema, tableSchema, textSchema } from "./schemas";

type RegistryEntry<S extends z.ZodType> = {
  schema: S;
  Component: ComponentType<z.infer<S>>;
  description: string;
};

// Generic constructor — ties Component's prop type to the schema at the entry
// site, so the registry can't pair a schema with the wrong component.
function entry<S extends z.ZodType>(
  schema: S,
  Component: ComponentType<z.infer<S>>,
  description: string,
): RegistryEntry<S> {
  return { schema, Component, description };
}

export const registry = {
  // ← adding a 4th artifact = one entry here
  chart: entry(
    chartSchema,
    ChartArtifact,
    "Render a bar or line chart for trends, comparisons, or numeric series.",
  ),
  table: entry(tableSchema, TableArtifact, "Render structured rows with named columns."),
  metric: entry(
    metricSchema,
    MetricArtifact,
    "Render a single headline metric as a stat card (label, value, optional unit, delta, and caption).",
  ),
  text: entry(
    textSchema,
    TextArtifact,
    "Render a deliberate markdown block (summary, callout, structured prose).",
  ),
};

export type ArtifactKind = keyof typeof registry;

export type Artifact = {
  [K in ArtifactKind]: {
    kind: K;
    props: z.infer<(typeof registry)[K]["schema"]>;
  };
}[ArtifactKind];
