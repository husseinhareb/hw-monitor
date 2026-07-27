export function calculateUsedMemoryBytes(
  total: number | null,
  available: number | null,
  free: number | null,
  cached: number | null,
): number | null {
  if (total === null || !Number.isFinite(total) || total <= 0) {
    return null;
  }

  const fallbackAvailable = Math.max(0, free ?? 0) + Math.max(0, cached ?? 0);
  const usableAvailable = available ?? fallbackAvailable;
  const clampedAvailable = Math.min(total, Math.max(0, usableAvailable));
  return total - clampedAvailable;
}
