import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ModeSwitcher } from "./ModeSwitcher";

describe("ModeSwitcher", () => {
  it("renders all three modes", () => {
    render(<ModeSwitcher mode="live" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /LIVE/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /X-RAY/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /REGISTRY/ })).toBeInTheDocument();
  });

  it("marks the active mode pressed", () => {
    render(<ModeSwitcher mode="xray" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /X-RAY/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onChange when a live mode is clicked", () => {
    const onChange = vi.fn();
    render(<ModeSwitcher mode="live" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /X-RAY/ }));
    expect(onChange).toHaveBeenCalledWith("xray");
  });

  it("disables REGISTRY (Phase C) and does not fire onChange for it", () => {
    const onChange = vi.fn();
    render(<ModeSwitcher mode="live" onChange={onChange} />);
    const registry = screen.getByRole("button", { name: /REGISTRY/ });
    expect(registry).toBeDisabled();
    fireEvent.click(registry);
    expect(onChange).not.toHaveBeenCalled();
  });
});
