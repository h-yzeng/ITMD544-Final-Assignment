import axios from "axios";
import { GeocodingResult, GeocodingResponse } from "../types/weather";
import { getCachedFromDB, setCachedToDB } from "./databaseCache";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// Request deduplication
const pendingGeocodeRequests = new Map<
  string,
  Promise<GeocodingResult | null>
>();
const pendingSuggestRequests = new Map<string, Promise<GeocodingResult[]>>();

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeCity(
  query: string,
): Promise<GeocodingResult | null> {
  const key = `geocode:${query.toLowerCase()}`;
  const cached = await getCachedFromDB<GeocodingResult | null>(key);
  if (cached) return cached;

  // If another request for this query is in flight, wait for it
  if (pendingGeocodeRequests.has(key)) {
    return pendingGeocodeRequests.get(key)!;
  }

  const requestPromise = (async () => {
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { data } = await axios.get<GeocodingResponse>(GEOCODING_URL, {
          params: { name: query, count: 1, language: "en", format: "json" },
        });
        const result = data.results?.[0] ?? null;
        await setCachedToDB(key, result, 10 * 60 * 1000);
        pendingGeocodeRequests.delete(key);
        return result;
      } catch (error: any) {
        lastError = error;

        if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
          await sleep(delayMs);
          continue;
        }

        throw error;
      }
    }

    pendingGeocodeRequests.delete(key);
    throw lastError;
  })();

  pendingGeocodeRequests.set(key, requestPromise);
  return requestPromise;
}

export async function suggestCities(
  query: string,
  count = 5,
): Promise<GeocodingResult[]> {
  const key = `suggest:${query.toLowerCase()}:${count}`;
  const cached = await getCachedFromDB<GeocodingResult[]>(key);
  if (cached) return cached;

  // If another request for this query is in flight, wait for it
  if (pendingSuggestRequests.has(key)) {
    return pendingSuggestRequests.get(key)!;
  }

  const requestPromise = (async () => {
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { data } = await axios.get<GeocodingResponse>(GEOCODING_URL, {
          params: { name: query, count, language: "en", format: "json" },
        });
        const results = data.results ?? [];
        await setCachedToDB(key, results, 10 * 60 * 1000);
        pendingSuggestRequests.delete(key);
        return results;
      } catch (error: any) {
        lastError = error;

        if (error.response?.status === 429 && attempt < MAX_RETRIES - 1) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
          await sleep(delayMs);
          continue;
        }

        throw error;
      }
    }

    pendingSuggestRequests.delete(key);
    throw lastError;
  })();

  pendingSuggestRequests.set(key, requestPromise);
  return requestPromise;
}
