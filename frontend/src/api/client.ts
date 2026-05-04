import axios from 'axios';
import type { Location, DailyForecast, HourlyForecast, Tag, SearchResult, SearchHistoryEntry } from '../types';

const api = axios.create({ baseURL: '/api' });

export async function searchCity(query: string): Promise<SearchResult> {
  const { data } = await api.get<SearchResult>('/search', { params: { q: query } });
  return data;
}

export async function getSearchHistory(): Promise<SearchHistoryEntry[]> {
  const { data } = await api.get<SearchHistoryEntry[]>('/search/history');
  return data;
}

export async function getLocations(): Promise<Location[]> {
  const { data } = await api.get<Location[]>('/locations');
  return data;
}

export async function getLocation(id: string): Promise<Location> {
  const { data } = await api.get<Location>(`/locations/${id}`);
  return data;
}

export async function deleteLocation(id: string): Promise<void> {
  await api.delete(`/locations/${id}`);
}

export async function getDailyForecasts(locationId: string): Promise<DailyForecast[]> {
  const { data } = await api.get<DailyForecast[]>(`/forecasts/${locationId}`);
  return data;
}

export async function getHourlyForecasts(locationId: string, dailyId: string): Promise<HourlyForecast[]> {
  const { data } = await api.get<HourlyForecast[]>(`/forecasts/${locationId}/hourly`, {
    params: { dailyId },
  });
  return data;
}

export async function getTags(): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}

export async function addTagToLocation(locationId: string, tagId: string): Promise<void> {
  await api.post(`/tags/locations/${locationId}/tags`, { tagId });
}

export async function removeTagFromLocation(locationId: string, tagId: string): Promise<void> {
  await api.delete(`/tags/locations/${locationId}/tags/${tagId}`);
}
