const kiloBytes = 1000;

export function convertData(data: number | null): { value: number; unit: string } {
    let unit = "B";
    let convertedData = data || 0;

    if (data !== null) {
        if (data >= kiloBytes * kiloBytes * kiloBytes) {
            convertedData = parseFloat((data / (kiloBytes * kiloBytes * kiloBytes)).toFixed(2));
            unit = "GB";
        } else if (data >= kiloBytes * kiloBytes) {
            convertedData = parseFloat((data / (kiloBytes * kiloBytes)).toFixed(2));
            unit = "MB";
        } else if (data >= kiloBytes) {
            convertedData = parseFloat((data / kiloBytes).toFixed(2));
            unit = "KB";
        }
    }

    return { value: convertedData, unit };
}

/**
 * Format a throughput in bytes per second, e.g. `1.2 MB/s`.
 * `perSecondSuffix` is the localized "/s" marker.
 */
export function formatDataRate(bytesPerSec: number, perSecondSuffix: string): string {
    const { value, unit } = convertData(Number.isFinite(bytesPerSec) ? bytesPerSec : 0);
    return `${value} ${unit}${perSecondSuffix}`;
}

/** @deprecated Use the named `convertData` export directly. */
const useDataConverter = () => convertData;
export default useDataConverter;
