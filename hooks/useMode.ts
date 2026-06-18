"use client";

import { useCallback, useSyncExternalStore } from "react";

import { type Mode, parseMode } from "@/lib/mode";

/** Subscribe to URL changes (back/forward + our own replaceState notifications). */
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * Mode state backed by the `?mode=` query param so views are linkable/shareable.
 * Uses useSyncExternalStore — the idiomatic way to read an external mutable
 * source (the URL): the server snapshot is always "live" (so SSR + hydration
 * match), the client snapshot reads the real URL, and writes replaceState +
 * dispatch a popstate so subscribers re-read. parseMode returns a primitive, so
 * the snapshot is stable until the URL actually changes.
 */
export function useMode(): [Mode, (m: Mode) => void] {
  const mode = useSyncExternalStore(
    subscribe,
    () => parseMode(window.location.search),
    () => "live" as Mode,
  );

  const setMode = useCallback((m: Mode) => {
    const url = new URL(window.location.href);
    if (m === "live") url.searchParams.delete("mode");
    else url.searchParams.set("mode", m);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  return [mode, setMode];
}
