import { createOrGetLocation, getLocationById, getAllLocations, deleteLocation } from '../../src/services/location.service';

jest.mock('../../src/config/database', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '../../src/config/database';
const mockFrom = supabase.from as jest.Mock;

const mockLocation = {
  id: 'uuid-1',
  name: 'Chicago',
  country: 'United States',
  latitude: 41.85003,
  longitude: -87.65005,
  timezone: 'America/Chicago',
  created_at: '2026-05-03T00:00:00Z',
};

describe('location service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createOrGetLocation', () => {
    it('upserts and returns the location', async () => {
      const chain = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockLocation, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const result = await createOrGetLocation({
        name: 'Chicago', country: 'United States',
        latitude: 41.85003, longitude: -87.65005, timezone: 'America/Chicago',
      });
      expect(result).toEqual(mockLocation);
    });

    it('throws when supabase returns an error', async () => {
      const chain = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      mockFrom.mockReturnValue(chain);

      await expect(createOrGetLocation({
        name: 'Chicago', country: 'United States',
        latitude: 41.85003, longitude: -87.65005, timezone: 'America/Chicago',
      })).rejects.toThrow('DB error');
    });
  });

  describe('getAllLocations', () => {
    it('returns array of locations', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockLocation], error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const result = await getAllLocations();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Chicago');
    });
  });
});
