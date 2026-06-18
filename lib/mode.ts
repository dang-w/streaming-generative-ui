export type Mode = "live" | "xray" | "registry";

/** Switcher order — also the order rendered in ModeSwitcher. */
export const MODES: Mode[] = ["live", "xray", "registry"];

/** Parse the `mode` query param from a search string; default + fallback to "live". */
export function parseMode(search: string): Mode {
  const value = new URLSearchParams(search).get("mode");
  return (MODES as string[]).includes(value ?? "") ? (value as Mode) : "live";
}
