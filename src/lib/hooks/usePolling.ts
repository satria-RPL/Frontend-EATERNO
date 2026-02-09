import { useEffect, useRef } from "react";

type PollingOptions = {
  intervalMs: number;
  immediate?: boolean;
  enabled?: boolean;
  runWhenHidden?: boolean;
  onError?: (error: unknown) => void;
};

export function usePolling(
  task: () => Promise<void> | void,
  {
    intervalMs,
    immediate = true,
    enabled = true,
    runWhenHidden = false,
    onError,
  }: PollingOptions
) {
  const taskRef = useRef(task);
  const runningRef = useRef(false);

  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timeoutId: number | null = null;

    const schedule = () => {
      if (cancelled) return;
      timeoutId = window.setTimeout(run, intervalMs);
    };

    const run = async () => {
      if (cancelled || runningRef.current) return;
      if (!runWhenHidden && typeof document !== "undefined" && document.hidden) {
        schedule();
        return;
      }

      runningRef.current = true;
      try {
        await taskRef.current();
      } catch (error) {
        onError?.(error);
      } finally {
        runningRef.current = false;
        schedule();
      }
    };

    if (immediate) {
      run();
    } else {
      schedule();
    }

    const handleVisibility = () => {
      if (runWhenHidden) return;
      if (!document.hidden) {
        run();
      }
    };

    if (!runWhenHidden) {
      window.addEventListener("focus", handleVisibility);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      cancelled = true;
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
      if (!runWhenHidden) {
        window.removeEventListener("focus", handleVisibility);
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [enabled, immediate, intervalMs, onError, runWhenHidden]);
}
