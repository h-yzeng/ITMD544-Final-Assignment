import axios from "axios";
import { OpenMeteoForecast } from "../types/weather";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  timezone: string,
): Promise<OpenMeteoForecast> {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.get<OpenMeteoForecast>(FORECAST_URL, {
        params: {
          latitude,
          longitude,
          timezone,
          forecast_days: 7,
          current: [
            "temperature_2m",
            "weather_code",
            "relative_humidity_2m",
            "wind_speed_10m",
            "precipitation",
          ].join(","),
          daily: [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "weather_code",
            "wind_speed_10m_max",
          ].join(","),
          hourly: [
            "temperature_2m",
            "precipitation",
            "wind_speed_10m",
            "relative_humidity_2m",
          ].join(","),
        },
      });
      return data;
    } catch (error: any) {
      lastError = error;

      // If it's a 429 error and we have retries left, wait and retry
      if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
        await sleep(delayMs);
        continue;
      }

      // For other errors or last attempt, throw
      throw error;
    }
  }

  throw lastError;
}
