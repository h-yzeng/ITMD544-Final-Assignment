import { saveDailyForecasts, getDailyForecasts, getHourlyForecasts } from '../../src/services/forecast.service';
import { OpenMeteoForecast } from '../../src/types/weather';

jest.mock('../../src/config/database', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '../../src/config/database';
const mockFrom = supabase.from as jest.Mock;

const mockOpenMeteoData: OpenMeteoForecast = {
  latitude: 41.85,
  longitude: -87.65,
  timezone: 'America/Chicago',
  daily: {
    time: ['2026-05-03'],
    temperature_2m_max: [22.5],
    temperature_2m_min: [12.3],
    precipitation_sum: [0.0],
    weather_code: [1],
    wind_speed_10m_max: [15.2],
  },
  hourly: {
    time: ['2026-05-03T00:00', '2026-05-03T01:00'],
    temperature_2m: [14.2, 13.8],
    precipitation: [0.0, 0.0],
    wind_speed_10m: [10.1, 9.5],
    relative_humidity_2m: [72, 75],
  },
};

describe('forecast service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('saveDailyForecasts', () => {
    it('upserts daily and hourly forecasts and returns daily rows', async () => {
      const savedDaily = [{ id: 'daily-uuid-1', location_id: 'loc-1', forecast_date: '2026-05-03' }];
      const dailyChain = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: savedDaily, error: null }),
      };
      const hourlyChain = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockFrom
        .mockReturnValueOnce(dailyChain)
        .mockReturnValue(hourlyChain);

      const result = await saveDailyForecasts('loc-1', mockOpenMeteoData);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('daily-uuid-1');
    });

    it('throws when daily upsert fails', async () => {
      const chain = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
      };
      mockFrom.mockReturnValue(chain);

      await expect(saveDailyForecasts('loc-1', mockOpenMeteoData)).rejects.toThrow('insert failed');
    });
  });

  describe('getDailyForecasts', () => {
    it('returns forecasts for a location ordered by date', async () => {
      const forecasts = [{ id: 'daily-1', location_id: 'loc-1', forecast_date: '2026-05-03' }];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: forecasts, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const result = await getDailyForecasts('loc-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getHourlyForecasts', () => {
    it('returns hourly rows for a daily forecast', async () => {
      const hourly = [{ id: 'h-1', hour: 0, temperature: 14.2 }];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: hourly, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const result = await getHourlyForecasts('daily-1');
      expect(result).toHaveLength(1);
    });
  });
});
