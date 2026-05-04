/// <reference types="jest" />
import axios from 'axios';
import { fetchForecast } from '../../src/services/weather.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockForecastResponse = {
  data: {
    latitude: 41.85,
    longitude: -87.65,
    timezone: 'America/Chicago',
    daily: {
      time: ['2026-05-03', '2026-05-04'],
      temperature_2m_max: [22.5, 20.1],
      temperature_2m_min: [12.3, 11.0],
      precipitation_sum: [0.0, 2.5],
      weather_code: [1, 61],
      wind_speed_10m_max: [15.2, 22.3],
    },
    hourly: {
      time: ['2026-05-03T00:00', '2026-05-03T01:00'],
      temperature_2m: [14.2, 13.8],
      precipitation: [0.0, 0.0],
      wind_speed_10m: [10.1, 9.5],
      relative_humidity_2m: [72, 75],
    },
  },
};

describe('fetchForecast', () => {
  it('fetches forecast data for given coordinates', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockForecastResponse);
    const result = await fetchForecast(41.85, -87.65, 'America/Chicago');
    expect(result.daily.time).toHaveLength(2);
    expect(result.daily.temperature_2m_max[0]).toBe(22.5);
    expect(result.hourly.temperature_2m).toHaveLength(2);
  });

  it('calls the correct Open-Meteo endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockForecastResponse);
    await fetchForecast(41.85, -87.65, 'America/Chicago');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 41.85,
          longitude: -87.65,
          timezone: 'America/Chicago',
        }),
      })
    );
  });
});
