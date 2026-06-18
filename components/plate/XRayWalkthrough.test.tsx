import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { XRayWalkthrough } from "./XRayWalkthrough";

describe("XRayWalkthrough", () => {
  it("starts on step 1 of 4 (tool-call)", () => {
    render(<XRayWalkthrough />);
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("1 / 4");
    expect(screen.getByTestId("xray-directive")).toHaveTextContent(/tool_use/i);
  });

  it("advances with NEXT through the pipeline in order", () => {
    render(<XRayWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("2 / 4");
    expect(screen.getByTestId("xray-directive")).toHaveTextContent(/registry\["chart"\]/);
  });

  it("flags the active step in the rail", () => {
    render(<XRayWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    const active = screen.getByTestId("xray-rail-active");
    expect(within(active).getByText(/REGISTRY LOOKUP/)).toBeInTheDocument();
  });

  it("clamps at the ends (PREV on step 1 stays, NEXT on step 4 stays)", () => {
    render(<XRayWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /PREV/ }));
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("1 / 4");
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("4 / 4");
  });

  it("dims the chart on non-render steps and undims it on the render step", () => {
    render(<XRayWalkthrough />);
    expect(screen.getByTestId("xray-chart").getAttribute("data-dimmed")).toBe("true");
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    expect(screen.getByTestId("xray-chart").getAttribute("data-dimmed")).toBe("false");
  });

  it("highlights the CHART row on the registry-lookup step", () => {
    render(<XRayWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    expect(screen.getByTestId("xray-registry-chart")).toHaveAttribute("data-hot", "true");
  });
});

describe("XRayWalkthrough auto-replay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("restarts at step 1 and advances on a slow timer when replay starts", () => {
    render(<XRayWalkthrough />);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("4 / 4");

    fireEvent.click(screen.getByRole("button", { name: /AUTO-REPLAY/ }));
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("1 / 4");
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(screen.getByTestId("xray-stepcount")).toHaveTextContent("2 / 4");
  });
});
