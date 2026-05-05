import type { DailyForecast } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { fmtTemp, fmtPrecip } from '../utils/conversions';

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
      <div className="daily-strip daily-strip--centered">
        {forecasts.map((f, index) => {
          const date = new Date(f.forecast_date + 'T12:00:00');
          const isToday = index === 0;
          const dayLabel = isToday
            ? 'Today'
            : date.toLocaleDateString('en-US', { weekday: 'short' });
          const precip = f.precipitation_sum != null && f.precipitation_sum > 0
            ? fmtPrecip(f.precipitation_sum, unit)
            : null;
          return (
            <button
              key={f.id}
              type="button"
              className={`daily-card${selectedId === f.id ? ' daily-card--selected' : ''}${isToday ? ' daily-card--today' : ''}`}
              onClick={() => onSelect(f)}
            >
              <span className="daily-card__day">{dayLabel}</span>
              <WeatherIcon code={f.weather_code} size={36} />
              <span className="daily-card__max">{fmtTemp(f.temp_max, unit)}°</span>
              <span className="daily-card__min">{fmtTemp(f.temp_min, unit)}°</span>
              {precip && <span className="daily-card__precip">{precip}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
