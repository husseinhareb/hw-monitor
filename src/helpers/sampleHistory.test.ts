import { describe, expect, it } from "vitest";
import { appendBoundedSample } from "./sampleHistory";

describe("appendBoundedSample", () => {
  it("retains raw network byte samples across display-unit boundaries", () => {
    expect(appendBoundedSample([999], 1_001)).toEqual([999, 1_001]);
  });

  it("keeps only the requested number of recent samples", () => {
    expect(appendBoundedSample([1, 2, 3], 4, 3)).toEqual([2, 3, 4]);
  });

  it("rejects an invalid history bound", () => {
    expect(() => appendBoundedSample([], 1, 0)).toThrow(RangeError);
  });
});
