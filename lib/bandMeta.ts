import type { ArtifactKind } from "@/lib/registry";
import type { StreamStatus, TimelineItem } from "@/hooks/useArtifactStream";

/** The real Zod export name for each kind — the x-ray cross-reference anchor. */
export const SCHEMA_NAME: Record<ArtifactKind, string> = {
  chart: "chartSchema",
  table: "tableSchema",
  metric: "metricSchema",
  text: "textSchema",
};

/** Which timeline item is currently streaming (the last one, while live). */
export function streamingItemId(
  items: TimelineItem[],
  status: StreamStatus,
): string | null {
  if (status !== "streaming" || items.length === 0) return null;
  return items[items.length - 1].id;
}

const KIND_FALLBACK: Record<string, string> = {
  chart: "Chart",
  table: "Table",
  metric: "Headline Metric",
  text: "Notes",
};

/** The band caption: the artifact's own title if it has one, else a kind label. */
export function bandCaption(item: TimelineItem): string {
  if (item.type === "text") return "Notes";
  const props = item.props as { title?: unknown };
  if (typeof props?.title === "string" && props.title.trim()) return props.title;
  return KIND_FALLBACK[item.kind] ?? item.kind;
}

/**
 * A render unit: either a single timeline item, or a run of consecutive `metric`
 * artifacts coalesced into one group (so headline metrics lay out side-by-side in
 * a grid band rather than stacking full-width). `id` is the unit's stable key
 * (the first member's id for a group).
 */
export type RenderUnit =
  | { kind: "item"; id: string; item: TimelineItem }
  | { kind: "metricGroup"; id: string; items: TimelineItem[] };

/** Coalesce consecutive `metric` artifacts into groups; everything else stays single. */
export function groupTimeline(items: TimelineItem[]): RenderUnit[] {
  const units: RenderUnit[] = [];
  for (const item of items) {
    const isMetric = item.type === "artifact" && item.kind === "metric";
    const last = units[units.length - 1];
    if (isMetric && last?.kind === "metricGroup") {
      last.items.push(item);
    } else if (isMetric) {
      units.push({ kind: "metricGroup", id: item.id, items: [item] });
    } else {
      units.push({ kind: "item", id: item.id, item });
    }
  }
  return units;
}

/** Hatch-pattern swatch CSS per kind — the registry legend's visual key. */
export const HATCH: Record<ArtifactKind, string> = {
  chart:
    "repeating-linear-gradient(45deg,#555 0 0.6px,transparent 0.6px 3px),repeating-linear-gradient(-45deg,#555 0 0.6px,transparent 0.6px 3px)",
  metric: "repeating-linear-gradient(0deg,#555 0 0.6px,transparent 0.6px 4px)",
  table: "repeating-linear-gradient(45deg,#555 0 0.6px,transparent 0.6px 8px)",
  text: "repeating-linear-gradient(45deg,#999 0 0.6px,transparent 0.6px 5px,#999 5px 5.6px,transparent 5.6px 8px)",
};
