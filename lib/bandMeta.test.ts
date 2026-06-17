import { describe, expect, it } from "vitest";

import { bandCaption, streamingItemId } from "./bandMeta";
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
