import { describe, expect, it } from "vitest";

import { XRAY_STEPS } from "./xraySteps";

describe("XRAY_STEPS", () => {
  it("has four steps in pipeline order", () => {
    expect(XRAY_STEPS.map((s) => s.id)).toEqual([
      "tool-call",
      "registry-lookup",
      "validate",
      "render",
    ]);
  });

  it("numbers them 1..4", () => {
    expect(XRAY_STEPS.map((s) => s.n)).toEqual([1, 2, 3, 4]);
  });

  it("carries the real code expression per step", () => {
    const byId = Object.fromEntries(XRAY_STEPS.map((s) => [s.id, s]));
    expect(byId["registry-lookup"].code).toContain('registry["chart"]');
    expect(byId["validate"].code).toContain("chartSchema.safeParse");
    expect(byId["render"].code).toContain("renderArtifact");
  });

  it("gives every step a title and a non-empty directive", () => {
    for (const s of XRAY_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.directive.length).toBeGreaterThan(20);
    }
  });
});
