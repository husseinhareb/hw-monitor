import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ConfigColorRow } from "./ConfigPrimitives";
import type { ConfigTheme } from "./Styles/style";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const theme = {} as ConfigTheme;

// React listens to the native input event and reads the value through the prototype setter
function drag(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("ConfigColorRow", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    container.remove();
  });

  it("saves once after a drag pauses, with the last color", () => {
    const onChange = vi.fn();
    act(() => root.render(<ConfigColorRow labelKey="x" value="#000000" onChange={onChange} theme={theme} />));
    const input = container.querySelector("input")!;

    act(() => {
      drag(input, "#111111");
      drag(input, "#222222");
      drag(input, "#333333");
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(container.textContent).toContain("#333333");

    act(() => vi.advanceTimersByTime(250));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("#333333");
  });

  it("saves a pending color when the row unmounts", () => {
    const onChange = vi.fn();
    act(() => root.render(<ConfigColorRow labelKey="x" value="#000000" onChange={onChange} theme={theme} />));
    act(() => drag(container.querySelector("input")!, "#abcdef"));
    act(() => root.unmount());
    expect(onChange).toHaveBeenCalledWith("#abcdef");
  });
});
