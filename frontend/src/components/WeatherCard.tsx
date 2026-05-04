import type { DailyForecast, Location } from '../types';
import { WeatherIcon } from './WeatherIcon';

const WMO_LABELS: Record<number, string> = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Rain Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Severe Thunderstorm',
};

function toF(c: number) { return (c * 9) / 5 + 32; }
function toMph(kmh: number) { return kmh * 0.621371; }
function toIn(mm: number) { return mm * 0.0393701; }

function fmtTemp(c: number | null | undefined, unit: 'C' | 'F') {
  if (c == null) return '—';
  return unit === 'F' ? toF(c).toFixed(0) : c.toFixed(0);
}

function fmtWind(kmh: number | null | undefined, unit: 'C' | 'F') {
  if (kmh == null) return '—';
  return unit === 'F' ? `${toMph(kmh).toFixed(0)} mph` : `${kmh.toFixed(0)} km/h`;
}

function fmtPrecip(mm: number | null | undefined, unit: 'C' | 'F') {
  if (mm == null) return '—';
  if (unit === 'F') return `${toIn(mm).toFixed(2)}"`;
  return `${mm.toFixed(1)} mm`;
}

interface Props {
  location: Location;
  today: DailyForecast;
  unit: 'C' | 'F';
  humidity?: number | null;
}

export function WeatherCard({ location, today, unit, humidity }: Props) {
  const label = today.weather_code != null ? (WMO_LABELS[today.weather_code] ?? `Code ${today.weather_code}`) : 'Unknown';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="hero-card">
      <div className="hero-top">
        <div className="hero-primary">
          <div className="hero-temp-display">
            <span className="hero-temp">{fmtTemp(today.temp_max, unit)}</span>
            <span className="hero-temp-unit">°{unit}</span>
          </div>
          <div className="hero-condition-row">
            <WeatherIcon code={today.weather_code} size={28} />
            <span className="hero-condition">{label}</span>
          </div>
          <p className="hero-hilow">
            H: {fmtTemp(today.temp_max, unit)}° &nbsp;·&nbsp; L: {fmtTemp(today.temp_min, unit)}°
          </p>
        </div>

        <div className="hero-location">
          <h2 className="hero-city">{location.name}</h2>
          <p className="hero-country">{location.country}</p>
          <p className="hero-date">{dateStr}</p>
        </div>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hero-stat__icon">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </svg>
          <span className="hero-stat__label">Wind</span>
          <span className="hero-stat__value">{fmtWind(today.wind_speed_max, unit)}</span>
        </div>
        <div className="hero-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hero-stat__icon">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span className="hero-stat__label">Humidity</span>
          <span className="hero-stat__value">{humidity != null ? `${humidity}%` : '—'}</span>
        </div>
        <div className="hero-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hero-stat__icon">
            <line x1="8" y1="19" x2="8" y2="21" />
            <line x1="8" y1="13" x2="8" y2="15" />
            <line x1="16" y1="19" x2="16" y2="21" />
            <line x1="16" y1="13" x2="16" y2="15" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="12" y1="15" x2="12" y2="17" />
            <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
          </svg>
          <span className="hero-stat__label">Precipitation</span>
          <span className="hero-stat__value">{fmtPrecip(today.precipitation_sum, unit)}</span>
        </div>
      </div>
    </div>
  );
}
