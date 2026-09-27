import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../services/configStore";
import { activeThemeIndex, themes } from "./themes";

describe("activeThemeIndex", () => {
  it("recognises each preset and the built-in defaults as the Default theme", () => {
    expect(activeThemeIndex(defaultConfig)).toBe(0);
    themes.forEach((preset, index) => {
      expect(activeThemeIndex({ ...defaultConfig, ...preset.values })).toBe(index);
    });
  });

  it("reports a custom palette once any color differs", () => {
    expect(activeThemeIndex({ ...defaultConfig, navbar_background_color: "#123456" })).toBe(-1);
  });
});
