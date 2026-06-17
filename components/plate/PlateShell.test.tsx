import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlateShell } from "./PlateShell";
import { ZoneTag } from "./ZoneTag";

describe("PlateShell", () => {
  it("renders the sheet chrome and its children", () => {
    render(
      <PlateShell>
        <p>inner content</p>
      </PlateShell>,
    );
    expect(screen.getByTestId("plate-sheet")).toBeInTheDocument();
    expect(screen.getByText("inner content")).toBeInTheDocument();
  });
});

describe("ZoneTag", () => {
  it("renders its label wrapped in em-dashes", () => {
    render(<ZoneTag label="System · internals" />);
    expect(screen.getByText(/—\s*System · internals\s*—/)).toBeInTheDocument();
  });
});
