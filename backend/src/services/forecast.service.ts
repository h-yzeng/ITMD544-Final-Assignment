import { supabase } from '../config/database';
import { DailyForecast, HourlyForecast } from '../types/database';
import { OpenMeteoForecast } from '../types/weather';

export async function saveDailyForecasts(
  locationId: string,
  forecast: OpenMeteoForecast
): Promise<DailyForecast[]> {
  const dailyRows = forecast.daily.time.map((date, i) => ({
    location_id: locationId,
    forecast_date: date,
    temp_max: forecast.daily.temperature_2m_max[i],
    temp_min: forecast.daily.temperature_2m_min[i],
    precipitation_sum: forecast.daily.precipitation_sum[i],
    weather_code: forecast.daily.weather_code[i],
    wind_speed_max: forecast.daily.wind_speed_10m_max[i],
  }));

  const { data: savedDaily, error: dailyError } = await supabase
    .from('daily_forecasts')
    .upsert(dailyRows, { onConflict: 'location_id,forecast_date' })
    .select();

  if (dailyError) throw new Error(dailyError.message);

  for (const daily of savedDaily ?? []) {
    const datePrefix = daily.forecast_date;
    const hourlyRows = forecast.hourly.time
      .map((time, i) => ({ time, i }))
      .filter(({ time }) => time.startsWith(datePrefix))
      .map(({ time, i }) => ({
        daily_forecast_id: daily.id,
        hour: new Date(time).getHours(),
        temperature: forecast.hourly.temperature_2m[i],
        precipitation: forecast.hourly.precipitation[i],
        wind_speed: forecast.hourly.wind_speed_10m[i],
        humidity: forecast.hourly.relative_humidity_2m[i],
      }));

    if (hourlyRows.length > 0) {
      const { error: hourlyError } = await supabase
        .from('hourly_forecasts')
        .upsert(hourlyRows, { onConflict: 'daily_forecast_id,hour' })
        .select();

      if (hourlyError) throw new Error(hourlyError.message);
    }
  }

  return savedDaily ?? [];
}

export async function getDailyForecasts(locationId: string): Promise<DailyForecast[]> {
  const { data, error } = await supabase
    .from('daily_forecasts')
    .select('*')
    .eq('location_id', locationId)
    .order('forecast_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHourlyForecasts(dailyForecastId: string): Promise<HourlyForecast[]> {
  const { data, error } = await supabase
    .from('hourly_forecasts')
    .select('*')
    .eq('daily_forecast_id', dailyForecastId)
    .order('hour', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
