import type { DailyForecast } from '../types';

const WMO_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 80: '🌦️', 95: '⛈️',
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
        const icon = f.weather_code != null ? (WMO_ICONS[f.weather_code] ?? '🌡️') : '🌡️';
        return (
          <button
            key={f.id}
            type="button"
            className={`daily-card${selectedId === f.id ? ' daily-card--selected' : ''}`}
            onClick={() => onSelect(f)}
          >
            <span className="daily-card__day">{dayLabel}</span>
            <span className="daily-card__icon">{icon}</span>
            <span className="daily-card__max">{fmt(f.temp_max, unit)}°</span>
            <span className="daily-card__min">{fmt(f.temp_min, unit)}°</span>
          </button>
        );
      })}
    </div>
  );
}
