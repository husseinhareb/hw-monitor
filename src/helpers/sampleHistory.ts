export function appendBoundedSample<T>(
  history: readonly T[],
  value: T,
  maxPoints = 20,
): T[] {
  if (!Number.isInteger(maxPoints) || maxPoints <= 0) {
    throw new RangeError("maxPoints must be a positive integer");
  }

  return [...history, value].slice(-maxPoints);
}
