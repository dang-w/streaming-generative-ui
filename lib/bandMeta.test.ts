import { describe, expect, it } from "vitest";

import { bandCaption, groupTimeline, streamingItemId } from "./bandMeta";
import type { TimelineItem } from "@/hooks/useArtifactStream";

const text: TimelineItem = { id: "t1", type: "text", text: "hi" };
const chart: TimelineItem = {
  id: "c1",
  type: "artifact",
  kind: "chart",
  props: { title: "Monthly Sales" },
};
const metric: TimelineItem = {
  id: "m1",
  type: "artifact",
  kind: "metric",
  props: {},
};

describe("streamingItemId", () => {
  it("returns the last item id while streaming", () => {
    expect(streamingItemId([text, chart], "streaming")).toBe("c1");
  });
  it("returns null when not streaming", () => {
    expect(streamingItemId([text, chart], "done")).toBeNull();
  });
  it("returns null for an empty timeline", () => {
    expect(streamingItemId([], "streaming")).toBeNull();
  });
});

describe("bandCaption", () => {
  it("labels a text item Notes", () => {
    expect(bandCaption(text)).toBe("Notes");
  });
  it("uses the chart title when present", () => {
    expect(bandCaption(chart)).toBe("Monthly Sales");
  });
  it("falls back to a kind label when no title", () => {
    expect(bandCaption(metric)).toBe("Headline Metric");
  });
});

describe("groupTimeline", () => {
  const m2: TimelineItem = { id: "m2", type: "artifact", kind: "metric", props: {} };
  const m3: TimelineItem = { id: "m3", type: "artifact", kind: "metric", props: {} };

  it("coalesces a run of consecutive metric artifacts into one group", () => {
    const units = groupTimeline([text, metric, m2, m3]);
    expect(units).toHaveLength(2);
    expect(units[0]).toEqual({ kind: "item", id: "t1", item: text });
    expect(units[1].kind).toBe("metricGroup");
    if (units[1].kind === "metricGroup") {
      expect(units[1].id).toBe("m1"); // first member's id is the group key
      expect(units[1].items.map((i) => i.id)).toEqual(["m1", "m2", "m3"]);
    }
  });

  it("does not merge metrics separated by a non-metric item", () => {
    const units = groupTimeline([metric, chart, m2]);
    expect(units.map((u) => u.kind)).toEqual(["metricGroup", "item", "metricGroup"]);
  });

  it("keeps non-metric artifacts and text as single units", () => {
    const units = groupTimeline([text, chart]);
    expect(units).toEqual([
      { kind: "item", id: "t1", item: text },
      { kind: "item", id: "c1", item: chart },
    ]);
  });

  it("returns an empty array for an empty timeline", () => {
    expect(groupTimeline([])).toEqual([]);
  });
});
