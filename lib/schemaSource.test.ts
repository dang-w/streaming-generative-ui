import { describe, expect, it } from "vitest";

import { schemaJson } from "./schemaSource";

describe("schemaJson", () => {
  it("derives JSON Schema from the real chart schema (enum values surfaced)", () => {
    const s = schemaJson("chart");
    expect(s).toContain("variant");
    expect(s).toContain('"bar"');
    expect(s).toContain('"line"');
  });

  it("derives a distinct schema per kind", () => {
    expect(schemaJson("text")).toContain("markdown");
    expect(schemaJson("text")).not.toContain("variant");
  });

  it("is valid JSON (parses back to an object)", () => {
    expect(() => JSON.parse(schemaJson("metric"))).not.toThrow();
  });
});
