import type { ArtifactKind } from "@/lib/registry";
import { STUB_CHART_INPUT } from "@/lib/model/stub";

/** One valid example-props object per kind — rendered live in the registry explorer. */
export const EXAMPLES: Record<ArtifactKind, unknown> = {
  chart: STUB_CHART_INPUT,
  table: {
    title: "Top accounts by ARR",
    columns: ["Account", "ARR (USD k)", "Owner"],
    rows: [
      ["Acme Co", 420, "K. Patel"],
      ["Globex", 380, "L. Chen"],
      ["Initech", 290, null],
    ],
  },
  metric: {
    label: "Net revenue retention",
    value: 118,
    unit: "%",
    delta: 6,
    caption: "Up from 112% in the prior year.",
  },
  text: {
    markdown:
      "## Summary\n\nRevenue **grew 76%** across the year, led by stronger EMEA expansion and healthy mid-market retention.",
  },
};
