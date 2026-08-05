const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

/** Compact, readable formatting for large incremental-game numbers. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '∞'
  if (value < 1000) {
    return value % 1 === 0 ? value.toString() : value.toFixed(1)
  }
  const tier = Math.min(Math.floor(Math.log10(value) / 3), UNITS.length - 1)
  const scaled = value / Math.pow(1000, tier)
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
  return `${scaled.toFixed(digits)}${UNITS[tier]}`
}
