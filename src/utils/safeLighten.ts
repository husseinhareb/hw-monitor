import { lighten } from 'polished';

/**
 * Wrapper around polished `lighten` that catches errors from invalid color strings.
 * Returns the original color (or 'transparent') instead of throwing.
 */
export function safeLighten(amount: number, color: string): string {
    try {
        return lighten(amount, color);
    } catch {
        return color || 'transparent';
    }
}
