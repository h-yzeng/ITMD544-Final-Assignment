import axios from 'axios';
import { GeocodingResult, GeocodingResponse } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function geocodeCity(query: string): Promise<GeocodingResult | null> {
  const { data } = await axios.get<GeocodingResponse>(GEOCODING_URL, {
    params: { name: query, count: 1, language: 'en', format: 'json' },
  });
  return data.results?.[0] ?? null;
}
