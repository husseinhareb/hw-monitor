/**
 * Greedy masonry: each item, in order, goes to the currently shortest column.
 * CSS multi-column balances to the tallest unbreakable card instead, which
 * leaves whole columns empty when one card is much taller than the rest.
 */
export function distributeColumns<T>(items: { weight: number; item: T }[], count: number): T[][] {
  const columns = Array.from({ length: Math.max(1, count) }, () => ({ height: 0, items: [] as T[] }));
  for (const { weight, item } of items) {
    const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best));
    shortest.items.push(item);
    shortest.height += weight;
  }
  return columns.map(column => column.items);
}
