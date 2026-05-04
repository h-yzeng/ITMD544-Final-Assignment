import { logSearch, getRecentSearches } from '../../src/services/searchLog.service';

jest.mock('../../src/config/database', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '../../src/config/database';
const mockFrom = supabase.from as jest.Mock;

describe('searchLog service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('logSearch inserts a search log entry', async () => {
    const chain = { insert: jest.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockReturnValue(chain);

    await expect(logSearch('Chicago', 'loc-1')).resolves.toBeUndefined();
    expect(chain.insert).toHaveBeenCalledWith({ query_string: 'Chicago', location_id: 'loc-1' });
  });

  it('logSearch works without a locationId', async () => {
    const chain = { insert: jest.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockReturnValue(chain);

    await expect(logSearch('unknown city')).resolves.toBeUndefined();
    expect(chain.insert).toHaveBeenCalledWith({ query_string: 'unknown city', location_id: null });
  });

  it('getRecentSearches returns recent entries', async () => {
    const logs = [{ id: 'log-1', query_string: 'Chicago', searched_at: '2026-05-03T00:00:00Z', locations: { name: 'Chicago' } }];
    const chain = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: logs, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const result = await getRecentSearches(10);
    expect(result).toHaveLength(1);
    expect(result[0].query_string).toBe('Chicago');
  });
});
