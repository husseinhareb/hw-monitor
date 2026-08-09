import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useEffect, act } from 'react';
import { createRoot } from 'react-dom/client';
import useSerialPolling from './useSerialPolling';

// Tell React we're in a test environment so act() works properly
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Flush React 18 effects reliably by wrapping in act() which drains
// the scheduler's effect queue synchronously.
async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

interface HarnessProps {
  enabled?: boolean;
  interval: number;
  poll: () => Promise<string>;
  onSuccess: (value: string) => void;
  onError?: (error: unknown) => void;
  pollNowRef?: React.MutableRefObject<(() => void) | null>;
}

const Harness: React.FC<HarnessProps> = ({
  enabled,
  interval,
  poll,
  onSuccess,
  onError,
  pollNowRef,
}) => {
  const { pollNow } = useSerialPolling({
    enabled,
    interval,
    poll,
    onSuccess,
    onError,
  });
  useEffect(() => {
    if (pollNowRef) pollNowRef.current = pollNow;
  }, [pollNow, pollNowRef]);
  return null;
};

interface Rendered {
  unmount: () => void;
  rerender: (props: HarnessProps) => void;
}

function renderHarness(props: HarnessProps): Rendered {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(React.createElement(Harness, props));
  });
  return {
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
    rerender: (nextProps: HarnessProps) => {
      act(() => {
        root.render(React.createElement(Harness, nextProps));
      });
    },
  };
}

// A deferred promise that never resolves — used to stall a poll in-flight.
function stalledPromise(): Promise<string> {
  return new Promise<string>(() => {});
}

describe('useSerialPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls poll on mount and delivers result to onSuccess', async () => {
    const onSuccess = vi.fn();
    const rendered = renderHarness({ interval: 1000, poll: () => Promise.resolve('ok'), onSuccess });

    // Flush React effects → poll fires
    await flushEffects();
    // Poll promise resolves on microtask
    await flushEffects();

    expect(onSuccess).toHaveBeenCalledWith('ok');
    expect(onSuccess).toHaveBeenCalledTimes(1);

    rendered.unmount();
  });

  it('does NOT re-poll while a previous poll is in-flight', async () => {
    const poll = vi.fn(() => stalledPromise());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const rendered = renderHarness({ interval: 100, poll, onSuccess, onError });

    await flushEffects();
    // poll was called once on mount
    expect(poll).toHaveBeenCalledTimes(1);

    // Advance many intervals — poll is still in-flight so no new calls
    await vi.advanceTimersByTimeAsync(5000);
    expect(poll).toHaveBeenCalledTimes(1);

    rendered.unmount();
  });

  it('schedules next poll after interval once previous completes', async () => {
    const poll = vi
      .fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second');

    const onSuccess = vi.fn();
    const rendered = renderHarness({ interval: 500, poll, onSuccess });

    // Flush effect → first poll fires
    await flushEffects();
    await flushEffects(); // poll promise microtask
    expect(onSuccess).toHaveBeenCalledWith('first');
    expect(poll).toHaveBeenCalledTimes(1);

    // Advance past interval → next poll fires
    await vi.advanceTimersByTimeAsync(500);
    await flushEffects(); // poll promise microtask
    expect(poll).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledWith('second');

    rendered.unmount();
  });

  it('does not poll when enabled=false', async () => {
    const poll = vi.fn(() => Promise.resolve('x'));
    const onSuccess = vi.fn();

    const rendered = renderHarness({ enabled: false, interval: 500, poll, onSuccess });

    await flushEffects();
    expect(poll).not.toHaveBeenCalled();

    rendered.unmount();
  });

  it('starts polling when re-enabled', async () => {
    const poll = vi.fn(() => Promise.resolve('x'));
    const onSuccess = vi.fn();

    const rendered = renderHarness({ enabled: false, interval: 500, poll, onSuccess });
    await flushEffects();
    expect(poll).not.toHaveBeenCalled();

    // Re-enable
    rendered.rerender({ enabled: true, interval: 500, poll, onSuccess });
    await flushEffects();
    await flushEffects(); // poll promise
    expect(onSuccess).toHaveBeenCalledTimes(1);

    rendered.unmount();
  });

  it('discards stale response when generation counter advances', async () => {
    // First poll is slow; second poll is fast but from a new generation
    let resolveFirst!: (value: string) => void;
    const poll = vi
      .fn()
      .mockImplementationOnce(() => new Promise<string>(r => { resolveFirst = r; }))
      .mockImplementationOnce(() => Promise.resolve('second'));

    const onSuccess = vi.fn();
    const rendered = renderHarness({ interval: 500, poll, onSuccess });

    // Mount → first poll fires (slow, pending)
    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(1);

    // Force a new generation: unmount and remount
    rendered.unmount();
    const rendered2 = renderHarness({ interval: 500, poll, onSuccess });

    await flushEffects();
    // New generation triggers fresh poll (second in the mock sequence)
    expect(poll).toHaveBeenCalledTimes(2);

    // Resolve the FIRST (stale) poll
    resolveFirst('stale-first');
    await flushEffects();
    // Stale result should NOT be delivered
    expect(onSuccess).not.toHaveBeenCalledWith('stale-first');

    // Second poll resolves
    await flushEffects();
    expect(onSuccess).toHaveBeenCalledWith('second');

    rendered2.unmount();
  });

  it('calls onError and continues scheduling on poll rejection', async () => {
    const poll = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('recovered');

    const onSuccess = vi.fn();
    const onError = vi.fn();
    const rendered = renderHarness({ interval: 300, poll, onSuccess, onError });

    // First poll fires and rejects
    await flushEffects();
    await flushEffects(); // rejection microtask
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onSuccess).not.toHaveBeenCalled();

    // After interval, next poll fires and succeeds
    await vi.advanceTimersByTimeAsync(300);
    await flushEffects();
    expect(onSuccess).toHaveBeenCalledWith('recovered');

    rendered.unmount();
  });

  it('pollNow() triggers immediate new poll; no-op while in-flight', async () => {
    let resolveFirst!: (value: string) => void;
    const poll = vi
      .fn()
      .mockImplementationOnce(() => new Promise<string>(r => { resolveFirst = r; }))
      .mockImplementationOnce(() => Promise.resolve('manual'));

    const onSuccess = vi.fn();
    const pollNowRef: React.MutableRefObject<(() => void) | null> = { current: null };
    const rendered = renderHarness({ interval: 10000, poll, onSuccess, pollNowRef });

    // First poll fires on mount
    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(1);

    // pollNow() while in-flight is a no-op
    pollNowRef.current?.();
    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(1);

    // Resolve first poll
    resolveFirst('first');
    await flushEffects();
    expect(onSuccess).toHaveBeenCalledWith('first');

    // Now pollNow() triggers a new poll immediately
    pollNowRef.current?.();
    await flushEffects();
    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledWith('manual');

    rendered.unmount();
  });

  it('cleans up timer and ignores callbacks after unmount', async () => {
    let resolvePoll!: (value: string) => void;
    const poll = vi.fn(() => new Promise<string>(r => { resolvePoll = r; }));

    const onSuccess = vi.fn();
    const onError = vi.fn();
    const rendered = renderHarness({ interval: 500, poll, onSuccess, onError });

    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(1);

    // Unmount while poll is in-flight
    rendered.unmount();

    // Resolve the in-flight poll after unmount
    resolvePoll('after-unmount');
    await flushEffects();

    // Neither callback should fire (generation counter advanced on cleanup)
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('restarts polling cycle on interval change', async () => {
    const poll = vi.fn(() => Promise.resolve('ok'));
    const onSuccess = vi.fn();

    const rendered = renderHarness({ interval: 1000, poll, onSuccess });
    await flushEffects();
    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(1);

    // Re-render with new interval — cleanup + new effect triggers fresh poll
    rendered.rerender({ interval: 2000, poll, onSuccess });
    await flushEffects();
    await flushEffects();
    expect(poll).toHaveBeenCalledTimes(2);

    rendered.unmount();
  });
});
