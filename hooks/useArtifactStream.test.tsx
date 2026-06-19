import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useArtifactStream } from "./useArtifactStream";

function sse(...events: object[]) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (const e of events) c.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      c.close();
    },
  });
}

function mockFetch(stream: ReadableStream<Uint8Array>) {
  return vi.fn().mockResolvedValue(new Response(stream, { status: 200 }));
}

afterEach(() => vi.restoreAllMocks());

describe("useArtifactStream", () => {
  it("builds the timeline and captures the run's adapter/model from done", async () => {
    global.fetch = mockFetch(
      sse(
        { type: "text-delta", text: "hello" },
        { type: "artifact", kind: "chart", props: { variant: "bar", data: [{ label: "a", value: 1 }] } },
        { type: "done", adapter: "stub", model: null },
      ),
    );
    const { result } = renderHook(() => useArtifactStream());
    await act(async () => {
      await result.current.send("hi");
    });
    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.items.some((i) => i.type === "artifact")).toBe(true);
    expect(result.current.runInfo).toEqual({ adapter: "stub", model: null });
  });

  it("surfaces an error event", async () => {
    global.fetch = mockFetch(sse({ type: "error", message: "boom" }));
    const { result } = renderHook(() => useArtifactStream());
    await act(async () => {
      await result.current.send("hi");
    });
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("boom");
  });

  it("aborts the fetch on unmount", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    // a stream that never closes, so the request stays in-flight
    const never = new ReadableStream<Uint8Array>({ start() {} });
    global.fetch = mockFetch(never);
    const { result, unmount } = renderHook(() => useArtifactStream());
    await act(async () => {
      result.current.send("hi");
    });
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
