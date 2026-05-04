/// <reference types="jest" />
import request from 'supertest';
import { app } from '../../src/app';

jest.mock('../../src/config/database', () => ({
  supabase: { from: () => ({}) },
}));
jest.mock('../../src/services/geocoding.service');
jest.mock('../../src/services/weather.service');
jest.mock('../../src/services/location.service');
jest.mock('../../src/services/forecast.service');
jest.mock('../../src/services/searchLog.service');

import { geocodeCity } from '../../src/services/geocoding.service';
import { fetchForecast } from '../../src/services/weather.service';
import { createOrGetLocation } from '../../src/services/location.service';
import { saveDailyForecasts } from '../../src/services/forecast.service';
import { logSearch, getRecentSearches } from '../../src/services/searchLog.service';

const mockGeocode = geocodeCity as jest.Mock;
const mockFetch = fetchForecast as jest.Mock;
const mockCreateLocation = createOrGetLocation as jest.Mock;
const mockSaveForecasts = saveDailyForecasts as jest.Mock;
const mockLogSearch = logSearch as jest.Mock;
const mockGetHistory = getRecentSearches as jest.Mock;

const mockGeoResult = {
  name: 'Chicago', country: 'United States',
  latitude: 41.85, longitude: -87.65, timezone: 'America/Chicago',
};
const mockForecastData = {
  daily: { time: ['2026-05-03'], temperature_2m_max: [22], temperature_2m_min: [12],
    precipitation_sum: [0], weather_code: [1], wind_speed_10m_max: [15] },
  hourly: { time: [], temperature_2m: [], precipitation: [], wind_speed_10m: [], relative_humidity_2m: [] },
};

describe('GET /api/search', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 if q param is missing', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/query parameter/i);
  });

  it('returns 400 if q param is empty string', async () => {
    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(400);
  });

  it('returns 404 when city not found', async () => {
    mockGeocode.mockResolvedValue(null);
    const res = await request(app).get('/api/search?q=nonexistent');
    expect(res.status).toBe(404);
  });

  it('returns 200 with location and daily forecast', async () => {
    mockGeocode.mockResolvedValue(mockGeoResult);
    mockFetch.mockResolvedValue(mockForecastData);
    mockCreateLocation.mockResolvedValue({ id: 'loc-1', name: 'Chicago' });
    mockSaveForecasts.mockResolvedValue([{ id: 'daily-1', forecast_date: '2026-05-03' }]);
    mockLogSearch.mockResolvedValue(undefined);

    const res = await request(app).get('/api/search?q=Chicago');
    expect(res.status).toBe(200);
    expect(res.body.location.name).toBe('Chicago');
    expect(res.body.daily).toHaveLength(1);
  });
});

describe('GET /api/search/history', () => {
  it('returns search history', async () => {
    mockGetHistory.mockResolvedValue([{ id: 'log-1', query_string: 'Chicago', searched_at: '2026-05-03T00:00:00Z' }]);
    const res = await request(app).get('/api/search/history');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
