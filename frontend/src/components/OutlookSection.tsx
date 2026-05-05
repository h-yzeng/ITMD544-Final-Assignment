import type { DailyForecast } from '../types';
import { fmtTemp, fmtWind } from '../utils/conversions';

const WMO_OUTLOOK: Record<number, { headline: string; detail: string }> = {
  0:  { headline: 'Clear skies today.',         detail: 'Abundant sunshine expected throughout the day.' },
  1:  { headline: 'Mainly clear.',              detail: 'Mostly sunny with occasional thin cloud cover.' },
  2:  { headline: 'Partly cloudy conditions.',  detail: 'A mix of sun and clouds throughout the day.' },
  3:  { headline: 'Overcast skies.',            detail: 'Cloudy conditions with little to no sunshine.' },
  45: { headline: 'Foggy conditions.',          detail: 'Reduced visibility expected, especially in the morning.' },
  48: { headline: 'Freezing fog.',              detail: 'Icy fog may cause slippery surfaces. Use caution.' },
  51: { headline: 'Light drizzle.',             detail: 'Intermittent light drizzle. Keep an umbrella handy.' },
  53: { headline: 'Drizzle throughout the day.',detail: 'Persistent drizzle. Outdoor plans may be affected.' },
  61: { headline: 'Rain in the forecast.',      detail: 'Wet conditions expected. Bring rain gear.' },
  63: { headline: 'Moderate rain expected.',    detail: 'Steady rainfall throughout the day.' },
  65: { headline: 'Heavy rain today.',          detail: 'Significant rainfall expected. Flooding possible in low-lying areas.' },
  71: { headline: 'Snow showers possible.',     detail: 'Light snowfall with some accumulation expected.' },
  73: { headline: 'Moderate snow.',             detail: 'Snow accumulation likely. Allow extra travel time.' },
  75: { headline: 'Heavy snow today.',          detail: 'Significant snowfall expected. Difficult travel conditions.' },
  80: { headline: 'Rain showers.',              detail: 'Periodic showers throughout the day with some drier spells.' },
  81: { headline: 'Moderate rain showers.',     detail: 'Frequent showers with heavier bursts possible.' },
  95: { headline: 'Thunderstorms possible.',    detail: 'Gusty winds and heavy rain likely. Outdoor activities not advised.' },
  96: { headline: 'Thunderstorms with hail.',   detail: 'Severe weather possible. Stay indoors during storms.' },
  99: { headline: 'Severe thunderstorms.',      detail: 'Dangerous conditions possible. Heed all weather alerts.' },
};

interface Props {
  today: DailyForecast;
  unit: 'C' | 'F';
}

export function OutlookSection({ today, unit }: Props) {
  const code = today.weather_code ?? 2;
  const outlook = WMO_OUTLOOK[code] ?? {
    headline: 'Variable conditions.',
    detail: 'Weather conditions may change throughout the day.',
  };
  const high = fmtTemp(today.temp_max, unit);
  const low  = fmtTemp(today.temp_min, unit);
  const wind = fmtWind(today.wind_speed_max, unit);

  const tempStr = today.temp_max != null && today.temp_min != null
    ? ` High of ${high}°, low of ${low}°.`
    : '';
  const windStr = today.wind_speed_max != null ? ` Wind speeds up to ${wind}.` : '';

  return (
    <div className="outlook-section">
      <p className="section-title">Today's Outlook</p>
      <p className="outlook-headline">{outlook.headline}{tempStr}{windStr}</p>
      <p className="outlook-detail">{outlook.detail}</p>
    </div>
  );
}
