/// <reference types="jest" />
import request from 'supertest';
import { app } from '../../src/app';

jest.mock('../../src/config/database', () => ({
  supabase: { from: () => ({}) },
}));
jest.mock('../../src/services/tag.service');
import { getAllTags, addTagToLocation, removeTagFromLocation } from '../../src/services/tag.service';
const mockGetAll = getAllTags as jest.Mock;
const mockAdd = addTagToLocation as jest.Mock;
const mockRemove = removeTagFromLocation as jest.Mock;

describe('Tag routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/tags returns all tags', async () => {
    mockGetAll.mockResolvedValue([{ id: 'tag-1', name: 'Coastal', color: '#0EA5E9' }]);
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Coastal');
  });

  it('POST /api/tags/locations/:id/tags returns 400 without tagId', async () => {
    const res = await request(app).post('/api/tags/locations/loc-1/tags').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/tags/locations/:id/tags adds tag and returns 201', async () => {
    mockAdd.mockResolvedValue(undefined);
    const res = await request(app).post('/api/tags/locations/loc-1/tags').send({ tagId: 'tag-1' });
    expect(res.status).toBe(201);
  });

  it('DELETE /api/tags/locations/:locationId/tags/:tagId returns 204', async () => {
    mockRemove.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/tags/locations/loc-1/tags/tag-1');
    expect(res.status).toBe(204);
  });
});
