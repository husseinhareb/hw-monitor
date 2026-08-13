import { describe, expect, it } from 'vitest';
import { parsePackageCounts } from './packageCounts';

describe('parsePackageCounts', () => {
  it('turns the backend JSON payload into one entry per manager', () => {
    expect(parsePackageCounts('{ "pacman": 1234, "flatpak": 5 }')).toEqual([
      { manager: 'pacman', count: 1234 },
      { manager: 'flatpak', count: 5 },
    ]);
  });

  it('coerces numeric strings and drops non-numeric entries', () => {
    expect(parsePackageCounts('{ "dpkg": "2456", "broken": "many" }')).toEqual([
      { manager: 'dpkg', count: 2456 },
    ]);
  });

  it('returns an empty list for missing or malformed payloads', () => {
    expect(parsePackageCounts(null)).toEqual([]);
    expect(parsePackageCounts(undefined)).toEqual([]);
    expect(parsePackageCounts('')).toEqual([]);
    expect(parsePackageCounts('not json')).toEqual([]);
    expect(parsePackageCounts('[1, 2]')).toEqual([]);
  });
});
