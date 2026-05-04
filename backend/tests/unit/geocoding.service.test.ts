/// <reference types="jest" />
import axios from 'axios';
import { geocodeCity } from '../../src/services/geocoding.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('geocodeCity', () => {
  it('returns the first result for a valid city name', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 4887398,
            name: 'Chicago',
            latitude: 41.85003,
            longitude: -87.65005,
            country: 'United States',
            timezone: 'America/Chicago',
            country_code: 'US',
          },
        ],
      },
    });

    const result = await geocodeCity('Chicago');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Chicago');
    expect(result!.latitude).toBe(41.85003);
  });

  it('returns null when no results found', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });
    const result = await geocodeCity('xyznonexistent');
    expect(result).toBeNull();
  });

  it('returns null when results field is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });
    const result = await geocodeCity('');
    expect(result).toBeNull();
  });
});
