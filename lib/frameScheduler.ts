export type Scheduler = {
  schedule: (cb: () => void) => number;
  cancel: (handle: number) => void;
};

export const rafScheduler: Scheduler = {
  schedule: (cb) => requestAnimationFrame(cb),
  cancel: (handle) => cancelAnimationFrame(handle),
};

export type Coalescer = {
  /** Mark work pending; ensures exactly one onFrame() on the next scheduled tick. */
  request: () => void;
  /** If work is pending, run onFrame() now and cancel the scheduled tick. */
  flush: () => void;
  /** Drop pending work without running onFrame(). */
  cancel: () => void;
};

/**
 * Collapses many request() calls into at most one onFrame() per scheduled tick.
 * Used to batch streamed text-delta state updates into one render per animation
 * frame instead of one render per token.
 */
export function createCoalescer(
  onFrame: () => void,
  scheduler: Scheduler = rafScheduler,
): Coalescer {
  let handle: number | null = null;

  const run = () => {
    handle = null;
    onFrame();
  };

  return {
    request() {
      if (handle === null) handle = scheduler.schedule(run);
    },
    flush() {
      if (handle !== null) {
        scheduler.cancel(handle);
        handle = null;
        onFrame();
      }
    },
    cancel() {
      if (handle !== null) {
        scheduler.cancel(handle);
        handle = null;
      }
    },
  };
}
