export interface PackageCount {
    manager: string;
    count: number;
}

/**
 * The backend reports installed package counts as a JSON object string, e.g.
 * `{ "pacman": 1234, "flatpak": 5 }`. Turn it into a list so the UI can render
 * one row per package manager instead of dumping raw JSON.
 *
 * Returns an empty list when the payload is missing or not parseable, letting
 * callers fall back to showing the raw string.
 */
export function parsePackageCounts(raw: string | null | undefined): PackageCount[] {
    if (!raw) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];

    return Object.entries(parsed as Record<string, unknown>).reduce<PackageCount[]>(
        (result, [manager, value]) => {
            const count = typeof value === 'number' ? value : Number(value);
            if (Number.isFinite(count)) result.push({ manager, count });
            return result;
        },
        [],
    );
}

export default parsePackageCounts;
