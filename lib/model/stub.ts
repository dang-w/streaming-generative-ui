import type { ModelAdapter, ModelStreamArgs, NormalisedEvent } from "./adapter";

const INTRO =
  "Here's a quick snapshot of the company's quarterly performance and top accounts.";

const CHART_INPUT = {
  variant: "bar" as const,
  title: "Quarterly Revenue (USD m)",
  xLabel: "Quarter",
  yLabel: "USD m",
  data: [
    { label: "Q1", value: 4.2 },
    { label: "Q2", value: 5.8 },
    { label: "Q3", value: 6.1 },
    { label: "Q4", value: 7.4 },
  ],
};

const TABLE_INPUT = {
  title: "Top accounts by ARR",
  columns: ["Account", "ARR (USD k)", "Owner"],
  rows: [
    ["Acme Co", 420, "K. Patel"],
    ["Globex", 380, "L. Chen"],
    ["Initech", 290, null],
  ],
};

const METRIC_INPUT = {
  label: "Net revenue retention",
  value: 118,
  unit: "%",
  delta: 6,
  caption: "Up from 112% in the prior year.",
};

const SUMMARY_INPUT = {
  markdown:
    "## Summary\n\nRevenue grew **76%** across the year, driven by stronger expansion in EMEA and a healthy retention curve in mid-market. Q4 closed at $7.4m, the year's high.",
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export class StubAdapter implements ModelAdapter {
  readonly name = "stub";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async *stream(_args: ModelStreamArgs): AsyncIterable<NormalisedEvent> {
    // Stream the intro word-by-word so the demo actually shows progressive text.
    const words = INTRO.split(" ");
    for (let i = 0; i < words.length; i++) {
      await sleep(60);
      yield { type: "text-delta", text: (i === 0 ? "" : " ") + words[i] };
    }

    await sleep(150);
    yield { type: "tool-use", name: "chart", input: CHART_INPUT };

    await sleep(200);
    yield { type: "tool-use", name: "table", input: TABLE_INPUT };

    await sleep(200);
    yield { type: "tool-use", name: "metric", input: METRIC_INPUT };

    await sleep(200);
    yield { type: "tool-use", name: "text", input: SUMMARY_INPUT };

    yield { type: "done" };
  }
}
