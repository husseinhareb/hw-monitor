/**
 * Format a CPU frequency reported in kHz (the unit used by sysfs cpufreq
 * entries such as `cpuinfo_max_freq`) as a human readable MHz/GHz string.
 *
 * Returns null when the value is missing or unparseable so callers can fall
 * back to their own "N/A" placeholder.
 */
export function formatFrequencyKHz(khz: string | number | null | undefined): string | null {
    if (khz === null || khz === undefined || khz === '') return null;

    const value = typeof khz === 'number' ? khz : parseFloat(khz);
    if (!Number.isFinite(value) || value <= 0) return null;

    const mhz = value / 1000;
    return mhz >= 1000 ? `${(mhz / 1000).toFixed(2)} GHz` : `${Math.round(mhz)} MHz`;
}

export default formatFrequencyKHz;
