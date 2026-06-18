"use client";

import { useEffect, useState } from "react";

import { ChartArtifact } from "@/components/artifacts/ChartArtifact";
import { runPipeline } from "@/components/plate/XRayWalkthrough.pipeline";
import { SCHEMA_NAME } from "@/lib/bandMeta";
import { registry, type ArtifactKind } from "@/lib/registry";
import { XRAY_STEPS } from "@/lib/xraySteps";

export function XRayWalkthrough() {
  const [step, setStep] = useState(0); // 0..3
  const [replaying, setReplaying] = useState(false);

  // Auto-replay: advance one step per slow tick; stop at the end. This is the
  // ONLY timed pacing in X-RAY (the labelled "slowed render"); manual nav is real-speed.
  useEffect(() => {
    if (!replaying || step >= XRAY_STEPS.length - 1) return;
    const next = step + 1;
    const id = setTimeout(() => {
      setStep(next);
      if (next >= XRAY_STEPS.length - 1) setReplaying(false);
    }, 2200);
    return () => clearTimeout(id);
  }, [replaying, step]);

  const startReplay = () => {
    setStep(0);
    setReplaying(true);
  };

  const current = XRAY_STEPS[step];
  const { entry, valid, exemplar } = runPipeline();

  const isRender = current.id === "render";
  const kinds = Object.keys(registry) as ArtifactKind[];

  return (
    <div>
      {/* top bar */}
      <div className="flex items-baseline justify-between">
        <div className="text-[14px] font-bold text-ink-1">
          Fig. 1 — {String(exemplar.title ?? "Chart exemplar")}
        </div>
        <div className="text-[10px] tracking-[0.1em] text-ink-2">
          X-RAY · GUIDED WALKTHROUGH{" "}
          <span className="font-bold text-orange" data-testid="xray-stepcount">
            {current.n} / {XRAY_STEPS.length}
          </span>
        </div>
      </div>
      <div className="mb-4 mt-1.5 text-[10px] tracking-[0.04em] text-ink-3">
        {"// we drive. one step at a time, in pipeline order — attention is directed, not left to wander."}
      </div>

      {/* main: chart (dimmed unless render) + step focus panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div
          data-testid="xray-chart"
          data-dimmed={isRender ? "false" : "true"}
          className={`border-[0.5px] border-ink-3 bg-paper p-4 transition-opacity ${
            isRender ? "opacity-100" : "opacity-[0.28]"
          }`}
        >
          <ChartArtifact
            variant={exemplar.variant as "bar" | "line"}
            data={exemplar.data}
            yLabel={exemplar.yLabel}
            animate={isRender}
          />
        </div>

        {/* focus panel — content per step. Fixed height + internal scroll so the
            tall tool-call JSON doesn't grow the row and shove the rail/controls
            down on step 1 — the visual area stays a constant height every step. */}
        <div className="overflow-auto border-[0.5px] border-ink-3 bg-paper-zone p-4 lg:h-[300px]">
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-orange">
            <span className="mr-2">{["①", "②", "③", "④"][step]}</span>
            {current.title}
          </div>
          <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-[11px] text-ink-1">
            {current.code}
          </pre>

          {current.id === "tool-call" && (
            <pre className="mt-3 border-[0.5px] border-ink-4 bg-paper p-2.5 font-mono text-[10px] leading-relaxed text-ink-2">
              {JSON.stringify(exemplar, null, 2)}
            </pre>
          )}

          {current.id === "registry-lookup" && (
            <div className="mt-3 border-[0.5px] border-ink-3">
              <div className="border-b-[0.5px] border-ink-4 px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink-2">
                Registry · Artifact Schedule
              </div>
              {kinds.map((k) => {
                const hot = k === "chart";
                return (
                  <div
                    key={k}
                    data-testid={hot ? "xray-registry-chart" : undefined}
                    data-hot={hot ? "true" : "false"}
                    className={`flex items-center justify-between px-3 py-1.5 text-[9.5px] ${
                      hot ? "bg-orange/10 ring-[0.8px] ring-orange" : "opacity-50"
                    }`}
                  >
                    <span className={hot ? "font-bold text-ink-1" : "text-ink-1"}>
                      {k.toUpperCase()}
                    </span>
                    <span className="text-amber">{SCHEMA_NAME[k]}</span>
                  </div>
                );
              })}
            </div>
          )}

          {current.id === "validate" && (
            <p className="mt-3 font-mono text-[11px]">
              <span className="text-ink-2">result: </span>
              <span className={valid ? "font-bold text-[#1f7a3d]" : "font-bold text-red"}>
                {valid ? "✓ valid" : "✗ invalid"}
              </span>
              <span className="ml-2 text-ink-3">
                — {Object.keys(exemplar).length} input fields checked against {SCHEMA_NAME.chart}
              </span>
            </p>
          )}

          {current.id === "render" && (
            <p className="mt-3 font-mono text-[11px] text-ink-2">
              {/* Stable literal (the chart entry's component) — entry.Component.name
                  would mangle under production minification. entry.description is
                  the real, derived value. */}
              → <b className="text-ink-1">ChartArtifact</b>{" "}
              <span className="text-ink-3">({entry.description})</span>
            </p>
          )}
        </div>
      </div>

      {/* step rail */}
      <div className="mt-5 flex gap-0 border-t-[0.5px] border-ink-4 pt-4">
        {XRAY_STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <div
              key={s.id}
              data-testid={state === "active" ? "xray-rail-active" : undefined}
              className={`flex flex-1 items-center gap-2.5 text-[10px] tracking-[0.06em] ${
                state === "active"
                  ? "font-bold text-orange"
                  : state === "done"
                    ? "text-ink-2"
                    : "text-ink-3"
              }`}
            >
              <span
                className={`inline-flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full border-[0.5px] text-[9px] ${
                  state === "active"
                    ? "border-orange bg-orange text-paper"
                    : state === "done"
                      ? "border-ink-2 text-ink-2"
                      : "border-ink-3"
                }`}
              >
                {s.n}
              </span>
              {s.title}
            </div>
          );
        })}
      </div>

      {/* directive (left) + controls (right) — controls live in the empty right
          zone so they're prominent and sit at a stable position every step. */}
      <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p
          data-testid="xray-directive"
          aria-live="polite"
          className="max-w-[70ch] text-[12.5px] leading-relaxed text-ink-1"
        >
          {current.directive}
        </p>

        <div className="flex shrink-0 mr-12 items-center gap-5 border-orange px-6 py-4 text-[11px] tracking-[0.1em] text-ink-2 sm:border">
          <button
            type="button"
            onClick={() => {
              setReplaying(false);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0 && !replaying}
            className="hover:text-ink-1 disabled:opacity-30 disabled:hover:text-ink-2"
          >
            <span className="text-ink-3">◀</span> <b className="text-ink-1">PREV</b>
          </button>
          <button
            type="button"
            onClick={() => {
              setReplaying(false);
              setStep((s) => Math.min(XRAY_STEPS.length - 1, s + 1));
            }}
            disabled={step === XRAY_STEPS.length - 1 && !replaying}
            className="hover:text-ink-1 disabled:opacity-30 disabled:hover:text-ink-2"
          >
            <span className="text-ink-3">▶</span> <b className="text-ink-1">NEXT</b>
          </button>
          <button type="button" onClick={startReplay} className="hover:text-orange">
            <span className="text-ink-3">⟲</span> <b className="text-ink-1">AUTO-REPLAY</b>{" "}
            <span className="text-ink-3">(slow)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
