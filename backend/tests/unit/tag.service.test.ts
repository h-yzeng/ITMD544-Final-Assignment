/// <reference types="jest" />
import { getAllTags, addTagToLocation, removeTagFromLocation, getTagsForLocation } from '../../src/services/tag.service';

jest.mock('../../src/config/database', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '../../src/config/database';
const mockFrom = supabase.from as jest.Mock;

describe('tag service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAllTags returns all tags ordered by name', async () => {
    const tags = [{ id: 'tag-1', name: 'Coastal', color: '#0EA5E9' }];
    const chain = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: tags, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const result = await getAllTags();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Coastal');
  });

  it('addTagToLocation inserts into location_tags', async () => {
    const chain = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(addTagToLocation('loc-1', 'tag-1')).resolves.toBeUndefined();
  });

  it('removeTagFromLocation deletes the junction row', async () => {
    const innerChain = { eq: jest.fn().mockResolvedValue({ error: null }) };
    const chain = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue(innerChain),
    };
    mockFrom.mockReturnValue(chain);

    await expect(removeTagFromLocation('loc-1', 'tag-1')).resolves.toBeUndefined();
  });
});
