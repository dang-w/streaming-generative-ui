import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { registry } from "./registry";
import { renderArtifact } from "./renderArtifact";
import { tools } from "./tools";

describe("registry derivation for metric", () => {
  it("includes metric in the registry", () => {
    expect(Object.keys(registry)).toContain("metric");
  });

  it("derives a metric tool automatically", () => {
    expect(tools.map((t) => t.name)).toContain("metric");
  });

  it("renders a valid metric through renderArtifact", () => {
    render(<>{renderArtifact("metric", { label: "NRR", value: 118, unit: "%" })}</>);
    expect(screen.getByText("NRR")).toBeInTheDocument();
    expect(screen.getByText("118")).toBeInTheDocument();
  });

  it("falls back (not crash) on an invalid metric", () => {
    render(<>{renderArtifact("metric", { label: "NRR" })}</>);
    // InvalidArtifact renders; the headline value is absent.
    expect(screen.queryByText("118")).not.toBeInTheDocument();
  });
});
