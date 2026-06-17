import { renderArtifact } from "@/lib/renderArtifact";

const fixtures: Array<{ label: string; kind: string; props: unknown }> = [
  {
    label: "text artifact",
    kind: "text",
    props: {
      markdown:
        "# Quarterly summary\n\nRevenue **grew 18%** quarter-over-quarter, driven by:\n\n- expansion in the EMEA segment\n- improved retention in mid-market",
    },
  },
  {
    label: "chart artifact (bar)",
    kind: "chart",
    props: {
      variant: "bar",
      title: "Quarterly revenue (USD m)",
      xLabel: "Quarter",
      yLabel: "USD m",
      data: [
        { label: "Q1", value: 4.2 },
        { label: "Q2", value: 5.1 },
        { label: "Q3", value: 6.0 },
        { label: "Q4", value: 7.3 },
      ],
    },
  },
  {
    label: "chart artifact (line)",
    kind: "chart",
    props: {
      variant: "line",
      title: "Active users (k)",
      data: [
        { label: "Jan", value: 12 },
        { label: "Feb", value: 14 },
        { label: "Mar", value: 19 },
        { label: "Apr", value: 23 },
        { label: "May", value: 28 },
      ],
    },
  },
  {
    label: "table artifact",
    kind: "table",
    props: {
      title: "Top accounts by ARR",
      columns: ["Account", "ARR (USD k)", "Owner"],
      rows: [
        ["Acme Co", 420, "K. Patel"],
        ["Globex", 380, "L. Chen"],
        ["Initech", 290, null],
      ],
    },
  },
  {
    label: "metric artifact",
    kind: "metric",
    props: {
      label: "Net revenue retention",
      value: 118,
      unit: "%",
      delta: 6,
      caption: "Up from 112% in the prior year.",
    },
  },
  {
    label: "invalid: chart with malformed data",
    kind: "chart",
    props: {
      variant: "bar",
      data: "this should be an array",
    },
  },
  {
    label: "unknown: map kind not in registry",
    kind: "map",
    props: { lat: 51.5, lng: -0.12, zoom: 10 },
  },
];

export default function DevPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Registry dev page</h1>
        <p className="text-sm text-ink-3">
          Static fixtures rendered through{" "}
          <code className="font-mono">renderArtifact()</code> — proves all
          artifacts + fallbacks before wiring the model.
        </p>
      </header>

      {fixtures.map((f, i) => (
        <section key={i} className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-ink-3">
            {f.label}
          </h2>
          {renderArtifact(f.kind, f.props)}
        </section>
      ))}
    </main>
  );
}
