import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricArtifact } from "./MetricArtifact";

describe("MetricArtifact", () => {
  it("renders label, value and unit", () => {
    render(<MetricArtifact label="Net revenue retention" value={118} unit="%" />);
    expect(screen.getByText("Net revenue retention")).toBeInTheDocument();
    expect(screen.getByText("118")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("shows an up arrow for a positive delta", () => {
    render(<MetricArtifact label="Signups" value={1200} delta={6} />);
    expect(screen.getByText(/▲/)).toBeInTheDocument();
    expect(screen.getByText(/6/)).toBeInTheDocument();
  });

  it("shows a down arrow for a negative delta", () => {
    render(<MetricArtifact label="Churn" value={3} delta={-2} />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("renders the caption when provided", () => {
    render(<MetricArtifact label="X" value={1} caption="context line" />);
    expect(screen.getByText("context line")).toBeInTheDocument();
  });
});
