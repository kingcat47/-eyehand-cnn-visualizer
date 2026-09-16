export function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.00005) return (0).toFixed(digits);
  return value.toFixed(digits);
}

export function formatVector(values: readonly number[], digits = 4): string {
  return `(${values.map((value) => formatNumber(value, digits)).join(", ")})`;
}
