import type {
  CurrentConditions,
  DailyForecast,
  HourlyForecast,
  Location,
  LocationSuggestion,
  SearchResult,
} from "../types";

type OpenMeteoGeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
  country_code: string;
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
};

type OpenMeteoForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: {
    time: string;
    temperature_2m: number | null;
    weather_code: number | null;
    relative_humidity_2m: number | null;
    wind_speed_10m: number | null;
    wind_direction_10m: number | null;
    precipitation: number | null;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    relative_humidity_2m: number[];
  };
};

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function buildLocation(geo: OpenMeteoGeocodingResult): Location {
  return {
    id: `browser-${geo.id}`,
    name: geo.name,
    country: geo.country,
    latitude: geo.latitude,
    longitude: geo.longitude,
    timezone: geo.timezone,
    created_at: new Date().toISOString(),
  };
}

function buildCurrent(forecast: OpenMeteoForecast): CurrentConditions | null {
  const raw = forecast.current;
  if (!raw) return null;
  return {
    temperature: raw.temperature_2m,
    weather_code: raw.weather_code,
    humidity: raw.relative_humidity_2m,
    wind_speed: raw.wind_speed_10m,
    wind_direction: raw.wind_direction_10m,
    precipitation: raw.precipitation,
  };
}

function buildDaily(
  locationId: string,
  forecast: OpenMeteoForecast,
): DailyForecast[] {
  return forecast.daily.time.map((date, index) => ({
    id: `${locationId}-${date}`,
    location_id: locationId,
    forecast_date: date,
    temp_max: forecast.daily.temperature_2m_max[index] ?? null,
    temp_min: forecast.daily.temperature_2m_min[index] ?? null,
    precipitation_sum: forecast.daily.precipitation_sum[index] ?? null,
    weather_code: forecast.daily.weather_code[index] ?? null,
    wind_speed_max: forecast.daily.wind_speed_10m_max[index] ?? null,
  }));
}

function buildHourly(
  dailyForecasts: DailyForecast[],
  forecast: OpenMeteoForecast,
): HourlyForecast[] {
  const dailyIdByDate = new Map(
    dailyForecasts.map((daily) => [daily.forecast_date, daily.id]),
  );

  return forecast.hourly.time.map((time, index) => {
    const forecastDate = time.slice(0, 10);
    const dailyId =
      dailyIdByDate.get(forecastDate) ??
      dailyForecasts[0]?.id ??
      `browser-${forecastDate}`;

    return {
      id: `${dailyId}-${time}`,
      daily_forecast_id: dailyId,
      hour: new Date(time).getHours(),
      temperature: forecast.hourly.temperature_2m[index] ?? null,
      precipitation: forecast.hourly.precipitation[index] ?? null,
      wind_speed: forecast.hourly.wind_speed_10m[index] ?? null,
      wind_direction: forecast.hourly.wind_direction_10m[index] ?? null,
      humidity: forecast.hourly.relative_humidity_2m[index] ?? null,
    };
  });
}

export async function getSuggestions(
  query: string,
): Promise<LocationSuggestion[]> {
  if (!query.trim()) return [];

  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", query.trim());
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const data = await fetchJson<OpenMeteoGeocodingResponse>(url.toString());
  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    country_code: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }));
}

export async function searchWeather(
  query: string,
): Promise<
  SearchResult & {
    hourly: HourlyForecast[];
    geocoding: OpenMeteoGeocodingResult;
    forecast: OpenMeteoForecast;
  }
> {
  const geocodingUrl = new URL(GEOCODING_URL);
  geocodingUrl.searchParams.set("name", query.trim());
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  const geocodingData = await fetchJson<OpenMeteoGeocodingResponse>(
    geocodingUrl.toString(),
  );
  const geocoding = geocodingData.results?.[0];
  if (!geocoding) {
    throw new Error(`City "${query}" not found`);
  }

  const forecastUrl = new URL(FORECAST_URL);
  forecastUrl.searchParams.set("latitude", String(geocoding.latitude));
  forecastUrl.searchParams.set("longitude", String(geocoding.longitude));
  forecastUrl.searchParams.set("timezone", geocoding.timezone);
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "weather_code",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "precipitation",
    ].join(","),
  );
  forecastUrl.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "weather_code",
      "wind_speed_10m_max",
    ].join(","),
  );
  forecastUrl.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "precipitation",
      "wind_speed_10m",
      "wind_direction_10m",
      "relative_humidity_2m",
    ].join(","),
  );

  const forecast = await fetchJson<OpenMeteoForecast>(forecastUrl.toString());
  const location = buildLocation(geocoding);
  const daily = buildDaily(location.id, forecast);
  const current = buildCurrent(forecast);
  const hourly = buildHourly(daily, forecast);

  return { location, daily, current, hourly, geocoding, forecast };
}
