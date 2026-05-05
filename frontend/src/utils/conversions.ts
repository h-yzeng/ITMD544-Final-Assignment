export function toF(c: number): number { return (c * 9) / 5 + 32; }
export function toMph(kmh: number): number { return kmh * 0.621371; }
export function toIn(mm: number): number { return mm * 0.0393701; }

export function fmtTemp(c: number | null | undefined, unit: 'C' | 'F', decimals = 0): string {
  if (c == null) return '—';
  return (unit === 'F' ? toF(c) : c).toFixed(decimals);
}

export function fmtWind(kmh: number | null | undefined, unit: 'C' | 'F'): string {
  if (kmh == null) return '—';
  return unit === 'F' ? `${toMph(kmh).toFixed(0)} mph` : `${kmh.toFixed(0)} km/h`;
}

export function fmtPrecip(mm: number | null | undefined, unit: 'C' | 'F'): string {
  if (mm == null) return '—';
  return unit === 'F' ? `${toIn(mm).toFixed(2)}"` : `${mm.toFixed(1)} mm`;
}
