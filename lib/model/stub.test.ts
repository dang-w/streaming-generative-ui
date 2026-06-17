import { describe, expect, it } from "vitest";

import { STUB_INTRO } from "./stub";

describe("stub INTRO", () => {
  it("is a genuine multi-sentence paragraph", () => {
    expect(STUB_INTRO.length).toBeGreaterThan(180);
    const sentences = STUB_INTRO.split(/(?<=[.!?])\s+/).filter(Boolean);
    expect(sentences.length).toBeGreaterThanOrEqual(2);
  });

  it("frames the actual output (chart, metrics, table)", () => {
    expect(STUB_INTRO.toLowerCase()).toContain("chart");
    expect(STUB_INTRO.toLowerCase()).toContain("metric");
    expect(STUB_INTRO.toLowerCase()).toContain("account");
  });
});
