import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Readout } from "./Readout";

describe("Readout", () => {
  it("shows the live artifact count and STREAMING state", () => {
    render(<Readout status="streaming" artifactCount={2} adapter={null} model={null} />);
    expect(screen.getByTestId("readout-artifacts")).toHaveTextContent("2");
    expect(screen.getByTestId("readout-state")).toHaveTextContent("STREAMING");
  });

  it("flips STATE to DONE when finished", () => {
    render(<Readout status="done" artifactCount={3} adapter={null} model={null} />);
    expect(screen.getByTestId("readout-state")).toHaveTextContent("DONE");
  });

  it("shows IDLE before a run", () => {
    render(<Readout status="idle" artifactCount={0} adapter={null} model={null} />);
    expect(screen.getByTestId("readout-state")).toHaveTextContent("IDLE");
  });

  it("renders the static real facts (PATTERN, TRANSPORT, BATCH)", () => {
    render(<Readout status="idle" artifactCount={0} adapter={null} model={null} />);
    expect(screen.getByText("typed registry")).toBeInTheDocument();
    expect(screen.getByText("SSE")).toBeInTheDocument();
    expect(screen.getByText("rAF · text")).toBeInTheDocument();
  });

  describe("MODEL row", () => {
    it("shows — for MODEL before any run", () => {
      render(<Readout status="idle" artifactCount={0} adapter={null} model={null} />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
    it("names the real model after an anthropic run", () => {
      render(<Readout status="done" artifactCount={3} adapter="anthropic" model="claude-haiku-4-5" />);
      expect(screen.getByText("claude-haiku-4-5")).toBeInTheDocument();
    });
    it("honestly labels the stub (no model ran)", () => {
      render(<Readout status="done" artifactCount={3} adapter="stub" model={null} />);
      expect(screen.getByText("stub · canned")).toBeInTheDocument();
    });
  });
});
