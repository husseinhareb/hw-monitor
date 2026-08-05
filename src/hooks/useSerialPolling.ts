import { DependencyList, useCallback, useEffect, useRef } from "react";

interface UseSerialPollingOptions<T> {
  enabled?: boolean;
  interval: number;
  poll: () => Promise<T>;
  onSuccess: (value: T) => void;
  onError?: (error: unknown) => void;
  deps?: DependencyList;
}

export default function useSerialPolling<T>({
  enabled = true,
  interval,
  poll,
  onSuccess,
  onError,
  deps = [],
}: UseSerialPollingOptions<T>) {
  const pollRef = useRef(poll);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  const enabledRef = useRef(enabled);
  const intervalRef = useRef(interval);
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);

  pollRef.current = poll;
  successRef.current = onSuccess;
  errorRef.current = onError;
  enabledRef.current = enabled;
  intervalRef.current = interval;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const runOnce = useCallback(async () => {
    if (!enabledRef.current || inFlightRef.current) {
      return;
    }

    clearTimer();
    inFlightRef.current = true;
    const requestId = ++requestIdRef.current;

    try {
      const value = await pollRef.current();
      if (requestId === requestIdRef.current) {
        successRef.current(value);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        errorRef.current?.(error);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;

        if (enabledRef.current) {
          clearTimer();
          timerRef.current = window.setTimeout(() => {
            void runOnce();
          }, intervalRef.current);
        }
      }
    }
  }, [clearTimer]);

  useEffect(() => {
    // Advance the generation counter and reset in-flight state before
    // starting a new polling cycle.  The double-increment across cleanup
    // and setup is harmless — generation counters only need to be unique
    // per cycle, not consecutive.  Rapid enabled/disabling toggles may
    // skip several generations, but the strict requestId check in
    // runOnce ensures stale responses are always discarded.
    requestIdRef.current += 1;
    inFlightRef.current = false;
    clearTimer();

    if (!enabled) {
      return () => {
        requestIdRef.current += 1;
        inFlightRef.current = false;
        clearTimer();
      };
    }

    void runOnce();

    return () => {
      requestIdRef.current += 1;
      inFlightRef.current = false;
      clearTimer();
    };
  }, [enabled, interval, clearTimer, runOnce, ...deps]);

  return { pollNow: runOnce };
}
