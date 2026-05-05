import { toMph } from '../../utils/conversions';
import type { DailyForecast } from '../../types';

function windCategory(kmh: number): string {
  if (kmh < 10) return 'Calm';
  if (kmh < 30) return 'Light';
  if (kmh < 50) return 'Breezy';
  if (kmh < 70) return 'Windy';
  return 'Strong';
}

interface Props { today: DailyForecast; unit: 'C' | 'F'; }

export function WindCard({ today, unit }: Props) {
  const wind = today.wind_speed_max;
  const disp = wind != null ? (unit === 'F' ? toMph(wind).toFixed(0) : wind.toFixed(0)) : '—';
  const unitLabel = unit === 'F' ? 'mph' : 'km/h';
  const cat = wind != null ? windCategory(wind) : null;

  return (
    <div className="detail-card">
      <div className="detail-card__header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
        Wind
      </div>
      <div className="detail-card__value">
        {disp}<span className="detail-card__unit"> {unitLabel}</span>
      </div>
      {cat && <p className="detail-card__sub">{cat}</p>}
      <svg width="56" height="56" viewBox="0 0 56 56" className="wind-compass">
        <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="28" y="10" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="system-ui">N</text>
        <text x="28" y="50" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="system-ui">S</text>
        <text x="10" y="31" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="system-ui">W</text>
        <text x="47" y="31" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="system-ui">E</text>
        <line x1="28" y1="28" x2="28" y2="9" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="28" r="3" fill="var(--accent)" />
      </svg>
    </div>
  );
}
