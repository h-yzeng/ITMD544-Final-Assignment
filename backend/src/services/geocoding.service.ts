import axios from "axios";
import { GeocodingResult, GeocodingResponse } from "../types/weather";
import { getCached, setCached } from "./simpleCache";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryRequest<T>(
  url: string,
  config: any,
  operation: (data: T) => any,
): Promise<any> {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.get<T>(url, config);
      return operation(data);
    } catch (error: any) {
      lastError = error;

      // If it's a 429 error and we have retries left, wait and retry
      if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
        await sleep(delayMs);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function geocodeCity(
  query: string,
): Promise<GeocodingResult | null> {
  const key = `geocode:${query.toLowerCase()}`;
  const cached = getCached<GeocodingResult | null>(key);
  if (cached) return cached;

  const result = await retryRequest<GeocodingResponse>(
    GEOCODING_URL,
    {
      params: { name: query, count: 1, language: "en", format: "json" },
    },
    (data) => data.results?.[0] ?? null,
  );

  // cache for 10 minutes
  setCached(key, result, 10 * 60 * 1000);
  return result;
}

export async function suggestCities(
  query: string,
  count = 5,
): Promise<GeocodingResult[]> {
  const key = `suggest:${query.toLowerCase()}:${count}`;
  const cached = getCached<GeocodingResult[]>(key);
  if (cached) return cached;

  const results = await retryRequest<GeocodingResponse>(
    GEOCODING_URL,
    {
      params: { name: query, count, language: "en", format: "json" },
    },
    (data) => data.results ?? [],
  );

  setCached(key, results, 10 * 60 * 1000);
  return results;
}
