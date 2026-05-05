import { useState, useEffect } from 'react';
import type { DailyForecast, Location, CurrentConditions } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { fmtTemp, fmtWind, fmtPrecip, toF } from '../utils/conversions';

const WMO_LABELS: Record<number, string> = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Rain Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Severe Thunderstorm',
};

function getHourInTz(timezone: string): number {
  try {
    const s = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hour: 'numeric', hour12: false,
    }).format(new Date());
    return parseInt(s, 10) % 24;
  } catch {
    return new Date().getHours();
  }
}

function getTimeDisplay(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date());
  } catch {
    return '';
  }
}

function getTzAbbr(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, timeZoneName: 'short',
    }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

function heroTimeClass(hour: number): string {
  if (hour >= 22 || hour < 5) return 'night';
  if (hour < 7) return 'dawn';
  if (hour < 11) return 'morning';
  if (hour < 16) return 'midday';
  if (hour < 20) return 'afternoon';
  return 'evening';
}

interface Props {
  location: Location;
  forecast: DailyForecast;
  current: CurrentConditions | null;
  isToday: boolean;
  unit: 'C' | 'F';
  humidity?: number | null;
}

export function WeatherCard({ location, forecast, current, isToday, unit, humidity }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const hour = getHourInTz(location.timezone);
  const timeStr = isToday ? getTimeDisplay(location.timezone) : '';
  const tzAbbr = isToday ? getTzAbbr(location.timezone) : '';

  // Use live current temperature when viewing today, otherwise use forecast max
  const rawTemp = isToday && current?.temperature != null
    ? current.temperature
    : forecast.temp_max;
  const displayTemp = rawTemp != null
    ? Math.round(unit === 'F' ? toF(rawTemp) : rawTemp)
    : null;

  const displayCode = isToday && current?.weather_code != null
    ? current.weather_code
    : forecast.weather_code;

  // Stats bar: prefer live current values when viewing today
  const windVal = isToday && current?.wind_speed != null
    ? fmtWind(current.wind_speed, unit)
    : fmtWind(forecast.wind_speed_max, unit);
  const precipVal = isToday && current?.precipitation != null
    ? fmtPrecip(current.precipitation, unit)
    : fmtPrecip(forecast.precipitation_sum, unit);

  const label = displayCode != null
    ? (WMO_LABELS[displayCode] ?? `Code ${displayCode}`)
    : 'Unknown';

  const dateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: location.timezone,
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(isToday ? now : new Date(forecast.forecast_date + 'T12:00:00'));

  return (
    <div className={`hero-card hero-card--${heroTimeClass(hour)}`}>
      <div className="hero-top">
        <div className="hero-primary">
          <div className="hero-temp-display">
            <span className="hero-temp">{displayTemp ?? '—'}</span>
            <span className="hero-temp-unit">°{unit}</span>
          </div>
          <div className="hero-condition-row">
            <WeatherIcon code={displayCode} size={28} />
            <span>{label}</span>
          </div>
          <p className="hero-hilow">
            H: {fmtTemp(forecast.temp_max, unit)}° &nbsp;·&nbsp; L: {fmtTemp(forecast.temp_min, unit)}°
          </p>
        </div>

        <div className="hero-location">
          <h2 className="hero-city">{location.name}</h2>
          <p className="hero-country">{location.country}</p>
          <p className="hero-date">{dateStr}</p>
          {timeStr && (
            <p className="hero-time">
              {timeStr}<span className="hero-tz">{tzAbbr}</span>
            </p>
          )}
        </div>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hero-stat__icon">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </svg>
          <span className="hero-stat__label">Wind</span>
          <span className="hero-stat__value">{windVal}</span>
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
            <line x1="8" y1="19" x2="8" y2="21" /><line x1="8" y1="13" x2="8" y2="15" />
            <line x1="16" y1="19" x2="16" y2="21" /><line x1="16" y1="13" x2="16" y2="15" />
            <line x1="12" y1="21" x2="12" y2="23" /><line x1="12" y1="15" x2="12" y2="17" />
            <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
          </svg>
          <span className="hero-stat__label">Precipitation</span>
          <span className="hero-stat__value">{precipVal}</span>
        </div>
      </div>
    </div>
  );
}
