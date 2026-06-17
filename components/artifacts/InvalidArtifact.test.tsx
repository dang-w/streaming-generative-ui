import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { InvalidArtifact } from "./InvalidArtifact";

describe("InvalidArtifact", () => {
  it("labels the off-spec kind and lists the real Zod issue", () => {
    const result = z.object({ value: z.number() }).safeParse({ value: "nope" });
    expect(result.success).toBe(false);
    if (result.success) return;

    render(<InvalidArtifact kind="chart" error={result.error} />);
    expect(screen.getByText(/OFF-SPEC/i)).toBeInTheDocument();
    expect(screen.getByText(/chart/)).toBeInTheDocument();
    // the Zod issue path/message is surfaced verbatim
    expect(screen.getByText(/value/)).toBeInTheDocument();
  });
});
