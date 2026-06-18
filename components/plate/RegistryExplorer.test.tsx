import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RegistryExplorer } from "./RegistryExplorer";

describe("RegistryExplorer", () => {
  it("renders a selectable row for every kind", () => {
    render(<RegistryExplorer kind="chart" onSelect={() => {}} />);
    for (const k of ["CHART", "TABLE", "METRIC", "TEXT"]) {
      expect(screen.getByRole("button", { name: new RegExp(k) })).toBeInTheDocument();
    }
  });

  it("marks the selected kind active (aria-pressed)", () => {
    render(<RegistryExplorer kind="metric" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: /METRIC/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onSelect when another kind is clicked", () => {
    const onSelect = vi.fn();
    render(<RegistryExplorer kind="chart" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /TABLE/ }));
    expect(onSelect).toHaveBeenCalledWith("table");
  });

  it("shows the real registry description for the selected kind", () => {
    render(<RegistryExplorer kind="metric" onSelect={() => {}} />);
    expect(screen.getByTestId("registry-entry")).toHaveTextContent(
      /headline metric as a stat card/i,
    );
  });

  it("shows the real Zod schema source for the selected kind", () => {
    render(<RegistryExplorer kind="chart" onSelect={() => {}} />);
    const schema = screen.getByTestId("registry-schema");
    expect(within(schema).getByText(/z\.enum\(\["bar", "line"\]\)/)).toBeInTheDocument();
  });

  it("renders a live example for the selected kind", () => {
    const { container } = render(<RegistryExplorer kind="chart" onSelect={() => {}} />);
    expect(container.querySelector('[data-testid="registry-example"] svg')).not.toBeNull();
  });
});
