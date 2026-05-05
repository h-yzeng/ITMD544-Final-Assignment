import { fmtTemp } from '../../utils/conversions';
import type { DailyForecast } from '../../types';

interface Props { today: DailyForecast; unit: 'C' | 'F'; }

export function TempCard({ today, unit }: Props) {
  const hi = fmtTemp(today.temp_max, unit);
  const lo = fmtTemp(today.temp_min, unit);
  const range =
    today.temp_max != null && today.temp_min != null
      ? fmtTemp(today.temp_max - today.temp_min, 'C')
      : null;

  return (
    <div className="detail-card">
      <div className="detail-card__header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
        Temperature
      </div>
      <div className="detail-temp-row">
        <span className="detail-temp-lo">{lo}°</span>
        <div className="detail-temp-track" />
        <span className="detail-temp-hi">{hi}°</span>
      </div>
      {range && <p className="detail-card__sub">Range: {range}°</p>}
    </div>
  );
}
