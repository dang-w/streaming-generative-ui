import { describe, expect, it } from "vitest";

import { MODES, parseMode } from "./mode";

describe("parseMode", () => {
  it("defaults to live for empty/absent param", () => {
    expect(parseMode("")).toBe("live");
    expect(parseMode("?foo=bar")).toBe("live");
  });

  it("reads a valid mode from the query string", () => {
    expect(parseMode("?mode=xray")).toBe("xray");
    expect(parseMode("?mode=registry")).toBe("registry");
    expect(parseMode("?mode=live")).toBe("live");
  });

  it("falls back to live for an unknown mode", () => {
    expect(parseMode("?mode=bogus")).toBe("live");
  });

  it("exposes the three modes in switcher order", () => {
    expect(MODES).toEqual(["live", "xray", "registry"]);
  });
});
