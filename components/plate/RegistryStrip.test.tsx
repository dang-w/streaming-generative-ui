import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegistryStrip } from "./RegistryStrip";

describe("RegistryStrip", () => {
  it("renders a cell for every registry kind", () => {
    render(<RegistryStrip />);
    for (const kind of ["CHART", "TABLE", "METRIC", "TEXT"]) {
      expect(screen.getByText(kind)).toBeInTheDocument();
    }
  });

  it("labels each cell with its schema name", () => {
    render(<RegistryStrip />);
    expect(screen.getByText("chartSchema")).toBeInTheDocument();
    expect(screen.getByText("textSchema")).toBeInTheDocument();
  });
});
