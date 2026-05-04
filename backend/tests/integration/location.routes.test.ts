import request from 'supertest';
import { app } from '../../src/app';

jest.mock('../../src/config/database', () => ({
  supabase: { from: () => ({}) },
}));
jest.mock('../../src/services/location.service');
jest.mock('../../src/services/tag.service');

import { getAllLocations, getLocationById, updateLocation, deleteLocation } from '../../src/services/location.service';
import { getTagsForLocation } from '../../src/services/tag.service';

const mockGetAll = getAllLocations as jest.Mock;
const mockGetById = getLocationById as jest.Mock;
const mockUpdate = updateLocation as jest.Mock;
const mockDelete = deleteLocation as jest.Mock;
const mockGetTags = getTagsForLocation as jest.Mock;

const mockLocation = { id: 'loc-1', name: 'Chicago', country: 'United States', latitude: 41.85, longitude: -87.65, timezone: 'America/Chicago', created_at: '2026-05-03T00:00:00Z' };

describe('Location routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/locations returns all locations', async () => {
    mockGetAll.mockResolvedValue([mockLocation]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('GET /api/locations/:id returns location with tags', async () => {
    mockGetById.mockResolvedValue(mockLocation);
    mockGetTags.mockResolvedValue([{ id: 'tag-1', name: 'Urban', color: '#8B5CF6' }]);
    const res = await request(app).get('/api/locations/loc-1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Chicago');
    expect(res.body.tags).toHaveLength(1);
  });

  it('GET /api/locations/:id returns 404 when not found', async () => {
    mockGetById.mockResolvedValue(null);
    const res = await request(app).get('/api/locations/nonexistent');
    expect(res.status).toBe(404);
  });

  it('PUT /api/locations/:id returns updated location', async () => {
    mockUpdate.mockResolvedValue({ ...mockLocation, name: 'Chicago City' });
    const res = await request(app).put('/api/locations/loc-1').send({ name: 'Chicago City' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Chicago City');
  });

  it('PUT /api/locations/:id returns 404 when not found', async () => {
    mockUpdate.mockResolvedValue(null);
    const res = await request(app).put('/api/locations/nonexistent').send({ timezone: 'America/New_York' });
    expect(res.status).toBe(404);
  });

  it('PUT /api/locations/:id returns 400 with no valid fields', async () => {
    const res = await request(app).put('/api/locations/loc-1').send({});
    expect(res.status).toBe(400);
  });

  it('DELETE /api/locations/:id returns 204', async () => {
    mockDelete.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/locations/loc-1');
    expect(res.status).toBe(204);
  });
});
