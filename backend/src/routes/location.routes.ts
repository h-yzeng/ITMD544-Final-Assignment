import { Router, Request, Response, NextFunction } from 'express';
import { getAllLocations, getLocationById, updateLocation, deleteLocation } from '../services/location.service';
import { getTagsForLocation } from '../services/tag.service';

export const locationRouter = Router();

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all cached locations
 *     responses:
 *       200:
 *         description: Array of locations
 */
locationRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await getAllLocations();
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location with its tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Location object with tags array
 *       404:
 *         description: Location not found
 */
locationRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await getLocationById(req.params.id);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    const tags = await getTagsForLocation(req.params.id);
    res.json({ ...location, tags });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location's name, country, or timezone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               country: { type: string }
 *               timezone: { type: string }
 *     responses:
 *       200:
 *         description: Updated location
 *       400:
 *         description: No valid fields provided
 *       404:
 *         description: Location not found
 */
locationRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, country, timezone } = req.body as Record<string, unknown>;
    const fields: Record<string, string> = {};
    if (typeof name === 'string' && name.trim()) fields.name = name.trim();
    if (typeof country === 'string' && country.trim()) fields.country = country.trim();
    if (typeof timezone === 'string' && timezone.trim()) fields.timezone = timezone.trim();

    if (Object.keys(fields).length === 0) {
      res.status(400).json({ error: 'Provide at least one of: name, country, timezone' });
      return;
    }

    const updated = await updateLocation(req.params.id, fields);
    if (!updated) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location and all its data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
locationRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteLocation(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
