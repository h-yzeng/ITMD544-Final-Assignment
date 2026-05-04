import type { DailyForecast, Location } from '../types';

const WMO_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  80: 'Rain showers',
  95: 'Thunderstorm',
};

function getLabel(code: number | null) {
  if (code === null) return 'Unknown';
  return WMO_LABELS[code] ?? `Code ${code}`;
}

function toF(c: number) { return (c * 9) / 5 + 32; }
function toMph(kmh: number) { return kmh * 0.621371; }
function toIn(mm: number) { return mm * 0.0393701; }

function fmtTemp(c: number | null | undefined, unit: 'C' | 'F') {
  if (c == null) return '—';
  return unit === 'F' ? toF(c).toFixed(1) : c.toFixed(1);
}

function fmtWind(kmh: number | null | undefined, unit: 'C' | 'F') {
  if (kmh == null) return '—';
  return unit === 'F' ? `${toMph(kmh).toFixed(1)} mph` : `${kmh.toFixed(1)} km/h`;
}

function fmtPrecip(mm: number | null | undefined, unit: 'C' | 'F') {
  if (mm == null) return '—';
  return unit === 'F' ? `${toIn(mm).toFixed(2)} in` : `${mm.toFixed(1)} mm`;
}

interface Props {
  location: Location;
  today: DailyForecast;
  unit: 'C' | 'F';
}

export function WeatherCard({ location, today, unit }: Props) {
  const label = getLabel(today.weather_code);
  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <div>
          <h2 className="weather-card__city">{location.name}</h2>
          <p className="weather-card__country">{location.country}</p>
        </div>
      </div>
      <p className="weather-card__condition">{label}</p>
      <div className="weather-card__temps">
        <span className="weather-card__temp-max">{fmtTemp(today.temp_max, unit)}°{unit}</span>
        <span className="weather-card__temp-separator"> / </span>
        <span className="weather-card__temp-min">{fmtTemp(today.temp_min, unit)}°{unit}</span>
      </div>
      <div className="weather-card__details">
        <span>Wind: {fmtWind(today.wind_speed_max, unit)}</span>
        <span>Precip: {fmtPrecip(today.precipitation_sum, unit)}</span>
      </div>
    </div>
  );
}
