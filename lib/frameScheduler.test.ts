import { describe, expect, it, vi } from "vitest";

import { createCoalescer, type Scheduler } from "./frameScheduler";

function manualScheduler() {
  let nextHandle = 1;
  const pending = new Map<number, () => void>();
  const scheduler: Scheduler = {
    schedule: (cb) => {
      const h = nextHandle++;
      pending.set(h, cb);
      return h;
    },
    cancel: (h) => {
      pending.delete(h);
    },
  };
  const tick = () => {
    const cbs = [...pending.values()];
    pending.clear();
    cbs.forEach((cb) => cb());
  };
  return { scheduler, tick };
}

describe("createCoalescer", () => {
  it("collapses many request() calls into one onFrame() per tick", () => {
    const onFrame = vi.fn();
    const { scheduler, tick } = manualScheduler();
    const c = createCoalescer(onFrame, scheduler);

    c.request();
    c.request();
    c.request();
    expect(onFrame).not.toHaveBeenCalled();

    tick();
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it("schedules a fresh frame for the next batch after a tick", () => {
    const onFrame = vi.fn();
    const { scheduler, tick } = manualScheduler();
    const c = createCoalescer(onFrame, scheduler);

    c.request();
    tick();
    c.request();
    tick();
    expect(onFrame).toHaveBeenCalledTimes(2);
  });

  it("flush() runs onFrame immediately and cancels the pending tick", () => {
    const onFrame = vi.fn();
    const { scheduler, tick } = manualScheduler();
    const c = createCoalescer(onFrame, scheduler);

    c.request();
    c.flush();
    expect(onFrame).toHaveBeenCalledTimes(1);

    tick();
    expect(onFrame).toHaveBeenCalledTimes(1);
  });

  it("flush() with nothing pending is a no-op", () => {
    const onFrame = vi.fn();
    const { scheduler } = manualScheduler();
    const c = createCoalescer(onFrame, scheduler);

    c.flush();
    expect(onFrame).not.toHaveBeenCalled();
  });

  it("cancel() drops pending work without calling onFrame", () => {
    const onFrame = vi.fn();
    const { scheduler, tick } = manualScheduler();
    const c = createCoalescer(onFrame, scheduler);

    c.request();
    c.cancel();
    tick();
    expect(onFrame).not.toHaveBeenCalled();
  });
});
