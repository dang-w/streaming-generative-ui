import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArtifactBand } from "./ArtifactBand";

describe("ArtifactBand", () => {
  it("renders the caption and the kind · schema ref", () => {
    render(
      <ArtifactBand caption="Monthly Sales" kind="chart" streaming={false}>
        <svg />
      </ArtifactBand>,
    );
    expect(screen.getByText("Monthly Sales")).toBeInTheDocument();
    expect(screen.getByText("chart")).toBeInTheDocument();
    expect(screen.getByText("chartSchema")).toBeInTheDocument();
  });

  it("marks the view as streaming when active", () => {
    render(
      <ArtifactBand caption="X" kind="metric" streaming>
        <div />
      </ArtifactBand>,
    );
    expect(screen.getByTestId("band-view")).toHaveClass("is-streaming");
  });
});
