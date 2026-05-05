interface Props {
  value: number;
  max: number;
  color: string;
}

export function SemiGauge({ value, max, color }: Props) {
  const pct = Math.max(0.001, Math.min(0.999, value / max));
  const cx = 50, cy = 44, r = 34;
  const bg = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const endX = cx - r * Math.cos(pct * Math.PI);
  const endY = cy - r * Math.sin(pct * Math.PI);
  const fg = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  return (
    <svg width="100" height="50" viewBox="0 0 100 50">
      <path d={bg} fill="none" stroke="var(--track-bg)" strokeWidth="7" strokeLinecap="round" />
      <path d={fg} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
