import type { DailyForecast } from '../types';
import { WeatherIcon } from './WeatherIcon';

function toF(c: number) { return (c * 9) / 5 + 32; }
function fmt(c: number | null | undefined, unit: 'C' | 'F') {
  if (c == null) return '—';
  return unit === 'F' ? toF(c).toFixed(0) : c.toFixed(0);
}
function fmtPrecip(mm: number | null | undefined, unit: 'C' | 'F') {
  if (mm == null || mm === 0) return null;
  return unit === 'F' ? `${(mm * 0.0393701).toFixed(2)}"` : `${mm.toFixed(1)}mm`;
}

interface Props {
  forecasts: DailyForecast[];
  selectedId: string | null;
  onSelect: (forecast: DailyForecast) => void;
  unit: 'C' | 'F';
}

export function DailyForecastStrip({ forecasts, selectedId, onSelect, unit }: Props) {
  return (
    <div className="daily-section">
      <p className="section-title">7-Day Forecast</p>
      <div className="daily-strip">
        {forecasts.map((f, index) => {
          const date = new Date(f.forecast_date + 'T12:00:00');
          const isToday = index === 0;
          const dayLabel = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
          const precip = fmtPrecip(f.precipitation_sum, unit);
          return (
            <button
              key={f.id}
              type="button"
              className={`daily-card${selectedId === f.id ? ' daily-card--selected' : ''}${isToday ? ' daily-card--today' : ''}`}
              onClick={() => onSelect(f)}
            >
              <span className="daily-card__day">{dayLabel}</span>
              <WeatherIcon code={f.weather_code} size={36} />
              <span className="daily-card__max">{fmt(f.temp_max, unit)}°</span>
              <span className="daily-card__min">{fmt(f.temp_min, unit)}°</span>
              {precip && <span className="daily-card__precip">{precip}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
