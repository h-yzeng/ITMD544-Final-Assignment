import axios from 'axios';
import { OpenMeteoForecast } from '../types/weather';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchForecast(
  latitude: number,
  longitude: number,
  timezone: string
): Promise<OpenMeteoForecast> {
  const { data } = await axios.get<OpenMeteoForecast>(FORECAST_URL, {
    params: {
      latitude,
      longitude,
      timezone,
      forecast_days: 7,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'weather_code',
        'wind_speed_10m_max',
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation',
        'wind_speed_10m',
        'relative_humidity_2m',
      ].join(','),
    },
  });
  return data;
}
