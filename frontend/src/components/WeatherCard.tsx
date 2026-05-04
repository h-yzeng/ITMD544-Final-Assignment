import type { DailyForecast, Location } from '../types';

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Icy fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
};

function getWeather(code: number | null) {
  if (code === null) return { label: 'Unknown', icon: '🌡️' };
  return WMO_CODES[code] ?? { label: `Code ${code}`, icon: '🌡️' };
}

function toF(c: number) { return (c * 9) / 5 + 32; }
function fmt(c: number | null | undefined, unit: 'C' | 'F') {
  if (c == null) return '—';
  return unit === 'F' ? toF(c).toFixed(1) : c.toFixed(1);
}

interface Props {
  location: Location;
  today: DailyForecast;
  unit: 'C' | 'F';
}

export function WeatherCard({ location, today, unit }: Props) {
  const weather = getWeather(today.weather_code);
  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <div>
          <h2 className="weather-card__city">{location.name}</h2>
          <p className="weather-card__country">{location.country}</p>
        </div>
        <span className="weather-card__icon">{weather.icon}</span>
      </div>
      <p className="weather-card__condition">{weather.label}</p>
      <div className="weather-card__temps">
        <span className="weather-card__temp-max">{fmt(today.temp_max, unit)}°{unit}</span>
        <span className="weather-card__temp-separator"> / </span>
        <span className="weather-card__temp-min">{fmt(today.temp_min, unit)}°{unit}</span>
      </div>
      <div className="weather-card__details">
        <span>💨 {today.wind_speed_max?.toFixed(1)} km/h</span>
        <span>💧 {today.precipitation_sum?.toFixed(1)} mm</span>
      </div>
    </div>
  );
}
