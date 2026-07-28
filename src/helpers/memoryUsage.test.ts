import { describe, expect, it } from "vitest";
import { calculateUsedMemoryBytes } from "./memoryUsage";

describe("calculateUsedMemoryBytes", () => {
  it("uses MemAvailable rather than the narrower Active counter", () => {
    expect(calculateUsedMemoryBytes(16_000, 6_000, 2_000, 3_000)).toBe(10_000);
  });

  it("falls back to free plus cache when MemAvailable is unavailable", () => {
    expect(calculateUsedMemoryBytes(16_000, null, 2_000, 3_000)).toBe(11_000);
  });

  it("bounds malformed counters and rejects invalid totals", () => {
    expect(calculateUsedMemoryBytes(16_000, 20_000, 0, 0)).toBe(0);
    expect(calculateUsedMemoryBytes(0, 0, 0, 0)).toBeNull();
  });
});
