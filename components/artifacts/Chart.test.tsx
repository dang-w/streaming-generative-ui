import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Chart } from "./Chart";

const data = [
  { label: "Q1", value: 10 },
  { label: "Q2", value: 20 },
  { label: "Q3", value: 40 },
];

describe("Chart", () => {
  it("renders one data point circle per datum (line variant)", () => {
    const { container } = render(<Chart variant="line" data={data} animate={false} />);
    expect(container.querySelectorAll('[data-role="point"]')).toHaveLength(3);
  });

  it("renders a polyline for the line variant", () => {
    const { container } = render(<Chart variant="line" data={data} animate={false} />);
    expect(container.querySelector("polyline")).not.toBeNull();
  });

  it("renders one bar per datum for the bar variant", () => {
    const { container } = render(<Chart variant="bar" data={data} animate={false} />);
    expect(container.querySelectorAll('[data-role="bar"]')).toHaveLength(3);
  });

  it("marks the latest point active (orange ring)", () => {
    const { container } = render(<Chart variant="line" data={data} animate={false} />);
    expect(container.querySelector('[data-role="active-point"]')).not.toBeNull();
  });

  it("renders the y-axis title when given", () => {
    const { getByText } = render(
      <Chart variant="line" data={data} yLabel="SALES ($K)" animate={false} />,
    );
    expect(getByText("SALES ($K)")).toBeInTheDocument();
  });

  it("animates the line-draw on mount by default", () => {
    const { container } = render(<Chart variant="line" data={data} />);
    // The polyline still renders; the .chart-line class drives the CSS transition.
    expect(container.querySelector("polyline.chart-line")).not.toBeNull();
  });
});
