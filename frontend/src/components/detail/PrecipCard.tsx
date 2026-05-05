import { fmtPrecip } from '../../utils/conversions';
import type { DailyForecast } from '../../types';

function precipCategory(mm: number): string {
  if (mm === 0) return 'None expected';
  if (mm < 2) return 'Light';
  if (mm < 10) return 'Moderate';
  return 'Heavy';
}

interface Props { today: DailyForecast; unit: 'C' | 'F'; }

export function PrecipCard({ today, unit }: Props) {
  const mm = today.precipitation_sum;
  const disp = fmtPrecip(mm, unit);
  const cat = mm != null ? precipCategory(mm) : null;
  const barPct = mm != null && mm > 0 ? Math.min(100, (mm / 20) * 100) : 0;

  return (
    <div className="detail-card">
      <div className="detail-card__header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="19" x2="8" y2="21" /><line x1="8" y1="13" x2="8" y2="15" />
          <line x1="16" y1="19" x2="16" y2="21" /><line x1="16" y1="13" x2="16" y2="15" />
          <line x1="12" y1="21" x2="12" y2="23" /><line x1="12" y1="15" x2="12" y2="17" />
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
        </svg>
        Precipitation
      </div>
      <div className="detail-card__value">{disp}</div>
      {cat && <p className="detail-card__sub">{cat}</p>}
      {barPct > 0 && (
        <div className="detail-precip-bar-track">
          <div className="detail-precip-bar-fill" style={{ width: `${barPct}%` }} />
        </div>
      )}
    </div>
  );
}
