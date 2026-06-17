import { describe, expect, it } from "vitest";

import { metricSchema } from "./schemas";

describe("metricSchema", () => {
  it("accepts a full metric", () => {
    const r = metricSchema.safeParse({
      label: "Net revenue retention",
      value: 118,
      unit: "%",
      delta: 6,
      caption: "Up from 112% last year.",
    });
    expect(r.success).toBe(true);
  });

  it("accepts the minimal shape (label + value only)", () => {
    const r = metricSchema.safeParse({ label: "Signups", value: "1.2k" });
    expect(r.success).toBe(true);
  });

  it("rejects a missing value", () => {
    const r = metricSchema.safeParse({ label: "Signups" });
    expect(r.success).toBe(false);
  });
});
