import { describe, expect, it } from "vitest";

import { EXAMPLES } from "./exampleArtifacts";
import { registry, type ArtifactKind } from "./registry";

describe("EXAMPLES", () => {
  it("has one example for every registry kind", () => {
    const kinds = Object.keys(registry) as ArtifactKind[];
    for (const k of kinds) expect(EXAMPLES[k]).toBeDefined();
  });

  it("every example validates against its real schema", () => {
    const kinds = Object.keys(registry) as ArtifactKind[];
    for (const k of kinds) {
      const result = registry[k].schema.safeParse(EXAMPLES[k]);
      expect(result.success).toBe(true);
    }
  });
});
