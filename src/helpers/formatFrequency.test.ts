import { describe, expect, it } from 'vitest';
import { formatFrequencyKHz } from './formatFrequency';

describe('formatFrequencyKHz', () => {
  it('formats sysfs kHz values above 1 GHz in GHz', () => {
    expect(formatFrequencyKHz('4700000')).toBe('4.70 GHz');
    expect(formatFrequencyKHz(3600000)).toBe('3.60 GHz');
  });

  it('formats sub-GHz values in MHz', () => {
    expect(formatFrequencyKHz('400000')).toBe('400 MHz');
    expect(formatFrequencyKHz('800000')).toBe('800 MHz');
  });

  it('returns null for missing or unusable values', () => {
    expect(formatFrequencyKHz(null)).toBeNull();
    expect(formatFrequencyKHz(undefined)).toBeNull();
    expect(formatFrequencyKHz('')).toBeNull();
    expect(formatFrequencyKHz('n/a')).toBeNull();
    expect(formatFrequencyKHz(0)).toBeNull();
  });
});
