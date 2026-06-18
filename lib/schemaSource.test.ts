import { describe, expect, it } from "vitest";

import { schemaSource } from "./schemaSource";

describe("schemaSource", () => {
  it("returns the real Zod source for chartSchema", () => {
    const src = schemaSource("chartSchema");
    expect(src).toContain("z.object(");
    expect(src).toContain('variant: z.enum(["bar", "line"])');
    expect(src.startsWith("chartSchema =")).toBe(true);
  });

  it("slices only the requested export (no bleed into the next)", () => {
    const src = schemaSource("textSchema");
    expect(src).toContain("markdown");
    expect(src).not.toContain("metricSchema"); // must stop before the next export
  });

  it("returns empty string for an unknown export", () => {
    expect(schemaSource("nopeSchema")).toBe("");
  });
});
