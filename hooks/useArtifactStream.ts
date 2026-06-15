"use client";

import { useCallback, useRef, useState } from "react";

export type TimelineItem =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "artifact"; kind: string; props: unknown };

export type StreamStatus = "idle" | "streaming" | "done" | "error";

type WireEvent =
  | { type: "text-delta"; text: string }
  | { type: "artifact"; kind: string; props: unknown }
  | { type: "error"; message: string }
  | { type: "done" };

export function useArtifactStream() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (prompt: string) => {
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;

    setItems([]);
    setError(null);
    setStatus("streaming");

    // Current text-run (deltas accumulate into one item until an artifact
    // closes the run). Held in refs to avoid stale-closure reads inside the
    // SSE read loop.
    let currentTextId: string | null = null;
    let currentText = "";

    const appendDelta = (delta: string) => {
      currentText += delta;
      if (currentTextId === null) {
        const id = crypto.randomUUID();
        currentTextId = id;
        const snapshot = currentText;
        setItems((prev) => [...prev, { id, type: "text", text: snapshot }]);
      } else {
        const id = currentTextId;
        const snapshot = currentText;
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, text: snapshot } : it)),
        );
      }
    };

    const pushArtifact = (kind: string, props: unknown) => {
      currentTextId = null;
      currentText = "";
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "artifact", kind, props },
      ]);
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: ctl.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by a blank line (\n\n).
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const msg of messages) {
          const dataLine = msg.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          let event: WireEvent;
          try {
            event = JSON.parse(dataLine.slice(6)) as WireEvent;
          } catch {
            continue;
          }

          if (event.type === "text-delta") {
            appendDelta(event.text);
          } else if (event.type === "artifact") {
            pushArtifact(event.kind, event.props);
          } else if (event.type === "error") {
            setError(event.message);
            setStatus("error");
            return;
          } else if (event.type === "done") {
            setStatus("done");
            return;
          }
        }
      }

      // Stream closed without a `done` event — treat as success.
      setStatus("done");
    } catch (e) {
      if (ctl.signal.aborted) return;
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setItems([]);
    setStatus("idle");
    setError(null);
  }, []);

  return { items, status, error, send, reset };
}
