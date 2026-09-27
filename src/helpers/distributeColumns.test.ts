import { describe, expect, it } from "vitest";
import { distributeColumns } from "./distributeColumns";

describe("distributeColumns", () => {
  it("fills every column around one tall item", () => {
    const items = [30, 6, 3, 2, 1, 1, 7].map((weight, i) => ({ weight, item: i }));
    expect(distributeColumns(items, 3)).toEqual([[0], [1, 5], [2, 3, 4, 6]]);
  });

  it("keeps order in a single column and never returns zero columns", () => {
    const items = [1, 2, 3].map((weight, i) => ({ weight, item: i }));
    expect(distributeColumns(items, 0)).toEqual([[0, 1, 2]]);
  });
});
