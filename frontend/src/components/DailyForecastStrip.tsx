import type { DailyForecast } from '../types';

const WMO_SHORT: Record<number, string> = {
  0: 'Clear', 1: 'Clear', 2: 'P.Cloudy', 3: 'Cloudy',
  45: 'Fog', 48: 'Fog', 51: 'Drizzle',
  61: 'Rain', 63: 'Rain', 65: 'Rain',
  71: 'Snow', 80: 'Showers', 95: 'Storms',
};

function toF(c: number) { return (c * 9) / 5 + 32; }
function fmt(c: number | null | undefined, unit: 'C' | 'F') {
  if (c == null) return '—';
  return unit === 'F' ? toF(c).toFixed(0) : c.toFixed(0);
}

interface Props {
  forecasts: DailyForecast[];
  selectedId: string | null;
  onSelect: (forecast: DailyForecast) => void;
  unit: 'C' | 'F';
}

export function DailyForecastStrip({ forecasts, selectedId, onSelect, unit }: Props) {
  return (
    <div className="daily-strip">
      {forecasts.map((f) => {
        const date = new Date(f.forecast_date + 'T12:00:00');
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        const condition = f.weather_code != null ? (WMO_SHORT[f.weather_code] ?? '—') : '—';
        return (
          <button
            key={f.id}
            type="button"
            className={`daily-card${selectedId === f.id ? ' daily-card--selected' : ''}`}
            onClick={() => onSelect(f)}
          >
            <span className="daily-card__day">{dayLabel}</span>
            <span className="daily-card__condition">{condition}</span>
            <span className="daily-card__max">{fmt(f.temp_max, unit)}°</span>
            <span className="daily-card__min">{fmt(f.temp_min, unit)}°</span>
          </button>
        );
      })}
    </div>
  );
}
