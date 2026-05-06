type HslColor = { hue: number; saturation: number; lightness: number; alpha?: number };

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h: number;
    switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        default: h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s, l];
}

function parseToHsl(color: string): HslColor {
    const hex3 = /^#([a-f\d])([a-f\d])([a-f\d])$/i.exec(color);
    if (hex3) {
        const [hue, saturation, lightness] = rgbToHsl(
            parseInt(hex3[1] + hex3[1], 16),
            parseInt(hex3[2] + hex3[2], 16),
            parseInt(hex3[3] + hex3[3], 16),
        );
        return { hue, saturation, lightness };
    }

    const hex6 = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (hex6) {
        const [hue, saturation, lightness] = rgbToHsl(
            parseInt(hex6[1], 16),
            parseInt(hex6[2], 16),
            parseInt(hex6[3], 16),
        );
        return { hue, saturation, lightness };
    }

    const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(color);
    if (rgba) {
        const [hue, saturation, lightness] = rgbToHsl(
            parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3]),
        );
        const result: HslColor = { hue, saturation, lightness };
        if (rgba[4] !== undefined) result.alpha = parseFloat(rgba[4]);
        return result;
    }

    const hsla = /^hsla?\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(color);
    if (hsla) {
        const result: HslColor = {
            hue: parseInt(hsla[1]),
            saturation: parseFloat(hsla[2]) / 100,
            lightness: parseFloat(hsla[3]) / 100,
        };
        if (hsla[4] !== undefined) result.alpha = parseFloat(hsla[4]);
        return result;
    }

    throw new Error(`Couldn't parse color: ${color}`);
}

function toColorString({ hue, saturation, lightness, alpha }: HslColor): string {
    const h = Math.round(hue);
    const s = `${Math.round(saturation * 100)}%`;
    const l = `${Math.round(lightness * 100)}%`;
    return alpha !== undefined
        ? `hsla(${h}, ${s}, ${l}, ${alpha})`
        : `hsl(${h}, ${s}, ${l})`;
}

function lighten(amount: number, color: string): string {
    if (color === 'transparent') return color;
    const hsl = parseToHsl(color);
    return toColorString({ ...hsl, lightness: clamp(hsl.lightness + amount, 0, 1) });
}

export function safeLighten(amount: number, color: string): string {
    try {
        return lighten(amount, color);
    } catch {
        return color || 'transparent';
    }
}
